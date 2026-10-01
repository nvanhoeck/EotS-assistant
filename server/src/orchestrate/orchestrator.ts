import { randomUUID } from 'node:crypto';
import type { LlmClient } from '../llm/types.js';
import { LlmFormatError } from '../llm/types.js';
import type { Retrieved, RetrieverLike } from '../retrieve/retriever.js';
import { NOT_SURE, type AnswerResult, type AskResult, type Chunk, type ClarifyQuestion } from '../types.js';
import { toCitation, validateCitations, type RawCitation } from './citations.js';
import { ANSWER_SYSTEM, DECIDE_SYSTEM, answerSchema, answerUser, decideSchema, decideUser } from './prompts.js';
import type { Session, SessionStore } from './session.js';

export class NotFoundError extends Error {}

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

export function sanitizeQuestions(d: RawDecision, chunks: Chunk[]): ClarifyQuestion[] {
  if (d.status !== 'need_info') return [];
  const ids = new Set(chunks.map((c) => c.sectionId));
  return (d.questions ?? [])
    .filter((q) => q.text?.trim() && ids.has(q.sourceSectionId))
    .slice(0, 3)
    .map((q) => {
      const opts = [...new Set((q.options ?? []).map((o) => o.trim()).filter(Boolean))].slice(0, 4);
      return {
        text: q.text.trim(),
        sourceSectionId: q.sourceSectionId,
        options: [...(opts.length ? opts : ['Yes', 'No']), NOT_SURE],
      };
    });
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
    return this.answer(s, question, r, []);
  }

  async resolve(sessionId: string, pendingId: string, answers: string[]): Promise<AskResult> {
    const s = this.sessions.get(sessionId);
    const p = s.pending;
    if (!p || p.id !== pendingId) throw new NotFoundError('No pending clarification for this session');
    s.pending = undefined;

    const unknown: string[] = [];
    p.questions.forEach((q, i) => {
      const a = answers[i];
      if (!a || a === NOT_SURE) unknown.push(q.text);
      else s.facts.push(`${q.text} -> ${a}`);
    });

    const r = await this.retriever.retrieve(p.question, s.facts);
    return this.answer(s, p.question, r, unknown);
  }

  private notFound(r: Retrieved): AskResult {
    return { type: 'not_found', nearest: r.chunks.slice(0, 3).map((c) => toCitation(c, false)) };
  }

  private async answer(s: Session, question: string, r: Retrieved, unknown: string[]): Promise<AnswerResult> {
    let raw: RawAnswer;
    try {
      raw = await this.llm.generateJson<RawAnswer>({
        system: ANSWER_SYSTEM,
        user: answerUser(question, s.facts, unknown, s.recent, r.chunks),
        schema: answerSchema,
      });
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

    const { citations, unverified } = validateCitations(raw.citations ?? [], r.chunks);
    s.recent = [...s.recent, { q: question, a: (raw.answer ?? '').slice(0, 300) }].slice(-2);
    return {
      type: 'answer',
      answer: raw.answer ?? '',
      steps: raw.steps ?? [],
      assumptions: raw.assumptions ?? [],
      citations: citations.length ? citations : r.chunks.slice(0, 3).map((c) => toCitation(c, false)),
      unverified,
    };
  }
}
