import { randomUUID } from 'node:crypto';
import type { LlmClient } from '../llm/types.js';
import { LlmFormatError } from '../llm/types.js';
import type { Retrieved, RetrieverLike } from '../retrieve/retriever.js';
import { NOT_SURE, type AnswerResult, type AskResult, type Chunk, type ClarifyQuestion } from '../types.js';
import { toCitation, validateCitations, type RawCitation } from './citations.js';
import { ANSWER_SYSTEM, DECIDE_SYSTEM, answerSchema, answerUser, decideSchema, decideUser } from './prompts.js';
import type { Session, SessionStore } from './session.js';

export class NotFoundError extends Error {}
export class BadRequestError extends Error {}

const MAX_FACTS = 10;

interface RawDecision {
  status: 'ready' | 'need_info';
  questions: { text: string; options: string[]; sourceSectionId: string }[];
}

interface RawAnswer {
  answer: string;
  steps: string[];
  citations: RawCitation[];
  assumptions: string[];
}

const collapse = (v: string): string => v.replace(/\s+/g, ' ').trim();
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function sanitizeQuestions(d: RawDecision, chunks: Chunk[]): ClarifyQuestion[] {
  if (!isObj(d) || d.status !== 'need_info' || !Array.isArray(d.questions)) return [];
  const ids = new Set(chunks.map((c) => c.sectionId));
  const out: ClarifyQuestion[] = [];
  for (const q of d.questions as unknown[]) {
    if (!isObj(q) || typeof q.text !== 'string' || !q.text.trim()) continue;
    if (typeof q.sourceSectionId !== 'string' || !ids.has(q.sourceSectionId)) continue;
    const opts = [
      ...new Set(
        strings(q.options)
          .map((o) => o.trim())
          .filter((o) => o && o.toLowerCase() !== NOT_SURE.toLowerCase()),
      ),
    ].slice(0, 4);
    out.push({
      text: q.text.trim(),
      sourceSectionId: q.sourceSectionId,
      options: [...(opts.length ? opts : ['Yes', 'No']), NOT_SURE],
    });
    if (out.length === 3) break;
  }
  return out;
}

export class Orchestrator {
  constructor(
    private retriever: RetrieverLike,
    private llm: LlmClient,
    private sessions: SessionStore,
  ) {}

  reset(sessionId: string): void {
    this.sessions.reset(sessionId);
  }

  async ask(sessionId: string, question: string): Promise<AskResult> {
    const s = this.sessions.get(sessionId);
    s.pending = undefined;
    const r = await this.retriever.retrieve(question, s.facts);
    if (r.lowConfidence) return this.notFound(r);

    let decision: RawDecision;
    try {
      decision = await this.llm.generateJson<RawDecision>({
        system: DECIDE_SYSTEM,
        user: decideUser(question, s.facts, s.recent, r.chunks),
        schema: decideSchema,
      });
    } catch (e) {
      if (!(e instanceof LlmFormatError)) throw e;
      decision = { status: 'ready', questions: [] };
    }

    const questions = sanitizeQuestions(decision, r.chunks);
    if (questions.length > 0) {
      const pendingId = randomUUID();
      s.pending = { id: pendingId, question, questions, chunks: r.chunks };
      return { type: 'clarify', pendingId, questions };
    }
    return this.answer(s, question, r, [], s.facts);
  }

  async resolve(sessionId: string, pendingId: string, answers: string[]): Promise<AskResult> {
    const s = this.sessions.get(sessionId);
    const p = s.pending;
    if (!p || p.id !== pendingId) throw new NotFoundError('No pending clarification for this session');
    if (!Array.isArray(answers)) throw new BadRequestError('"answers" must be an array of strings');

    // Build locally; only commit to the session once everything succeeded, so a retry still works.
    const unknown: string[] = [];
    const added: string[] = [];
    p.questions.forEach((q, i) => {
      const raw = answers[i];
      const a = typeof raw === 'string' ? collapse(raw) : '';
      const valid = a !== '' && a !== NOT_SURE && q.options.includes(a);
      if (valid) added.push(`${q.text} -> ${a}`);
      else unknown.push(q.text);
    });
    const facts = [...new Set([...s.facts, ...added])].slice(-MAX_FACTS);

    const r = await this.retriever.retrieve(p.question, facts);
    const result = await this.answer(s, p.question, r, unknown, facts);
    s.facts = facts;
    s.pending = undefined;
    return result;
  }

  private notFound(r: Retrieved): AskResult {
    return { type: 'not_found', nearest: r.chunks.slice(0, 3).map((c) => toCitation(c, false)) };
  }

  private async answer(s: Session, question: string, r: Retrieved, unknown: string[], facts: string[]): Promise<AnswerResult> {
    let raw: RawAnswer;
    try {
      raw = await this.llm.generateJson<RawAnswer>({
        system: ANSWER_SYSTEM,
        user: answerUser(question, facts, unknown, s.recent, r.chunks, r.outline),
        schema: answerSchema,
      });
      if (!isObj(raw)) throw new LlmFormatError('answer was not an object');
    } catch (e) {
      if (!(e instanceof LlmFormatError)) throw e;
      return {
        type: 'answer',
        answer: 'I could not format an answer. These are the most relevant rules:',
        steps: [],
        assumptions: [],
        citations: r.chunks.slice(0, 3).map((c) => toCitation(c, true, c.text.slice(0, 200))),
        unverified: 0,
      };
    }

    const { citations, unverified } = validateCitations(Array.isArray(raw.citations) ? raw.citations : [], r.chunks);
    const answer = typeof raw.answer === 'string' ? raw.answer : '';
    s.recent = [...s.recent, { q: question, a: answer.slice(0, 300) }].slice(-2);
    const fallback = citations.length === 0;
    return {
      type: 'answer',
      answer,
      steps: strings(raw.steps),
      assumptions: strings(raw.assumptions),
      citations: fallback ? r.chunks.slice(0, 3).map((c) => toCitation(c, false)) : citations,
      unverified: fallback ? Math.max(unverified, 1) : unverified,
    };
  }
}
