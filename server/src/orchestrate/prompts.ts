import type { Chunk } from '../types.js';

export function pageLabel(c: Chunk): string {
  return c.pageStart === c.pageEnd ? `p.${c.pageStart}` : `pp.${c.pageStart}-${c.pageEnd}`;
}

export function formatContext(chunks: Chunk[]): string {
  return chunks.map((c) => `[${c.sectionId} | ${pageLabel(c)} | ${c.headingPath.join(' > ')}]\n${c.text}`).join('\n\n');
}

function formatConditions(chunks: Chunk[]): string {
  const lines = chunks.flatMap((c) => c.conditionals.map((s) => `[${c.sectionId}] ${s}`));
  return lines.length ? lines.join('\n') : '(none found)';
}

function formatFacts(facts: string[]): string {
  return facts.length ? facts.map((f) => `- ${f}`).join('\n') : '(none)';
}

function formatRecent(recent: { q: string; a: string }[]): string {
  return recent.length ? recent.map((r) => `Q: ${r.q}\nA: ${r.a}`).join('\n') : '(none)';
}

export const decideSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['ready', 'need_info'] },
    questions: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          options: { type: 'array', maxItems: 4, items: { type: 'string' } },
          sourceSectionId: { type: 'string' },
        },
        required: ['text', 'options', 'sourceSectionId'],
      },
    },
  },
  required: ['status', 'questions'],
};

export const answerSchema = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    steps: { type: 'array', items: { type: 'string' } },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { sectionId: { type: 'string' }, quote: { type: 'string' } },
        required: ['sectionId', 'quote'],
      },
    },
    assumptions: { type: 'array', items: { type: 'string' } },
  },
  required: ['answer', 'steps', 'citations', 'assumptions'],
};

export const DECIDE_SYSTEM = `You help a player of the board game Empire of the Sun. You may only use the RULES EXCERPTS you are given.
Your only job now: decide whether the question can be answered correctly right away.
Set status to "need_info" ONLY IF the correct answer differs depending on a condition that neither the QUESTION nor the KNOWN FACTS state.
Each clarifying question must be about one of the CONDITIONS FOUND IN THE RULES, give that condition's sectionId in sourceSectionId, and offer 2-4 short answer options.
Ask at most 3 questions. Never ask about anything not listed in the conditions. If the question can be answered, set status to "ready" and questions to [].
Reply with JSON only.`;

export function decideUser(question: string, facts: string[], recent: { q: string; a: string }[], chunks: Chunk[]): string {
  return `QUESTION:\n${question}\n\nKNOWN FACTS:\n${formatFacts(facts)}\n\nRECENT CONVERSATION:\n${formatRecent(recent)}\n\nCONDITIONS FOUND IN THE RULES:\n${formatConditions(chunks)}\n\nRULES EXCERPTS:\n${formatContext(chunks)}`;
}

export const ANSWER_SYSTEM = `You help a player of the board game Empire of the Sun. Answer using ONLY the RULES EXCERPTS.
- Give the steps in the order the rules require, as short numbered-style strings in "steps".
- Explicitly mention any exception ("unless", "except", "only if") from the excerpts that applies or could apply.
- For every claim add a citation: sectionId copied from the excerpt's bracket header, and a short quote copied EXACTLY, word for word, from that excerpt.
- If something is listed under UNKNOWN, say in "assumptions" which case you assumed and how the answer changes otherwise.
- If a RULE OUTLINE is given and the question asks what a section, phase or sequence consists of, give one entry in "steps" per outline line, in outline order, each a one-sentence summary of that block. Do not skip or merge lines. Cite the matching excerpt for each line; a line marked "(outline only)" has no excerpt, so summarise it from the outline text and do not cite it.
- If the excerpts do not contain the answer, say so in "answer", leave "citations" empty and do not guess.
Reply with JSON only.`;

export function answerUser(
  question: string,
  facts: string[],
  unknown: string[],
  recent: { q: string; a: string }[],
  chunks: Chunk[],
  outline = '',
): string {
  const outlineBlock = outline ? `RULE OUTLINE (every block under the headings found, in rule order):\n${outline}\n\n` : '';
  const unknownBlock = unknown.length ? unknown.map((u) => `- ${u}`).join('\n') : '(none)';
  return `QUESTION:\n${question}\n\nKNOWN FACTS:\n${formatFacts(facts)}\n\nUNKNOWN (player was not sure):\n${unknownBlock}\n\nRECENT CONVERSATION:\n${formatRecent(recent)}\n\n${outlineBlock}RULES EXCERPTS:\n${formatContext(chunks)}`;
}
