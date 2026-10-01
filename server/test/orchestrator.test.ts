import { describe, it, expect } from 'vitest';
import { Orchestrator, NotFoundError } from '../src/orchestrate/orchestrator.js';
import { SessionStore } from '../src/orchestrate/session.js';
import { MockLlm } from '../src/llm/mock.js';
import { LlmFormatError } from '../src/llm/types.js';
import type { Chunk } from '../src/types.js';
import type { Retrieved, RetrieverLike } from '../src/retrieve/retriever.js';

const chunk: Chunk = {
  id: '8.31',
  sectionId: '8.31',
  label: '8.31 No Surviving Air or Naval Units',
  headingPath: ['8.0 Battle Resolution'],
  pageStart: 20,
  pageEnd: 20,
  text: '8.31 No Surviving Air or Naval Units If no air or naval units survive the battle, then ground combat is conducted unless the hex is a port.',
  crossRefs: [],
  conditionals: ['If no air or naval units survive the battle, then ground combat is conducted unless the hex is a port.'],
  part: 0,
};

function fakeRetriever(over: Partial<Retrieved> = {}) {
  const calls: { q: string; facts: string[] }[] = [];
  const r: RetrieverLike = {
    async retrieve(q, facts = []) {
      calls.push({ q, facts });
      return { chunks: [chunk], lowConfidence: false, mode: 'bm25', ...over };
    },
  };
  return { r, calls };
}

const goodAnswer = {
  answer: 'Ground combat is conducted.',
  steps: ['Check for surviving air/naval units', 'Conduct ground combat'],
  citations: [{ sectionId: '8.31', quote: 'then ground combat is conducted' }],
  assumptions: [],
};

describe('Orchestrator', () => {
  it('returns not_found when retrieval confidence is low', async () => {
    const { r } = fakeRetriever({ lowConfidence: true });
    const o = new Orchestrator(r, new MockLlm([]), new SessionStore());
    const res = await o.ask('s1', 'banana?');
    expect(res.type).toBe('not_found');
  });

  it('answers directly when the model says ready, with validated citations', async () => {
    const { r } = fakeRetriever();
    const llm = new MockLlm([{ status: 'ready', questions: [] }, goodAnswer]);
    const res = await new Orchestrator(r, llm, new SessionStore()).ask('s1', 'What happens?');
    expect(res).toMatchObject({ type: 'answer', unverified: 0 });
    if (res.type === 'answer') expect(res.citations[0]).toMatchObject({ verified: true, pageStart: 20 });
  });

  it('drops invented citations and counts them', async () => {
    const { r } = fakeRetriever();
    const llm = new MockLlm([
      { status: 'ready', questions: [] },
      { ...goodAnswer, citations: [{ sectionId: '99.9', quote: 'made up text here' }] },
    ]);
    const res = await new Orchestrator(r, llm, new SessionStore()).ask('s1', 'q');
    if (res.type !== 'answer') throw new Error('expected answer');
    expect(res.unverified).toBe(1);
    expect(res.citations[0].verified).toBe(false); // falls back to top retrieved chunk
    expect(res.citations[0].sectionId).toBe('8.31');
  });

  it('asks grounded clarifying questions, then resolves with the answers as facts', async () => {
    const { r, calls } = fakeRetriever();
    const llm = new MockLlm([
      { status: 'need_info', questions: [{ text: 'Is the hex a port?', options: ['Yes', 'No'], sourceSectionId: '8.31' }] },
      goodAnswer,
    ]);
    const o = new Orchestrator(r, llm, new SessionStore());
    const first = await o.ask('s1', 'What happens?');
    if (first.type !== 'clarify') throw new Error('expected clarify');
    expect(first.questions[0].options).toEqual(['Yes', 'No', 'Not sure']);

    const second = await o.resolve('s1', first.pendingId, ['Yes']);
    expect(second.type).toBe('answer');
    expect(calls[1].facts).toEqual(['Is the hex a port? -> Yes']);
    expect(llm.calls[1].user).toContain('Is the hex a port? -> Yes');
  });

  it('ignores questions whose source section was not retrieved', async () => {
    const { r } = fakeRetriever();
    const llm = new MockLlm([
      { status: 'need_info', questions: [{ text: 'Invented?', options: ['Yes'], sourceSectionId: '77.7' }] },
      goodAnswer,
    ]);
    const res = await new Orchestrator(r, llm, new SessionStore()).ask('s1', 'q');
    expect(res.type).toBe('answer');
  });

  it('treats "Not sure" as an unknown, not a fact', async () => {
    const { r, calls } = fakeRetriever();
    const llm = new MockLlm([
      { status: 'need_info', questions: [{ text: 'Is the hex a port?', options: ['Yes', 'No'], sourceSectionId: '8.31' }] },
      goodAnswer,
    ]);
    const o = new Orchestrator(r, llm, new SessionStore());
    const first = await o.ask('s1', 'q');
    if (first.type !== 'clarify') throw new Error('expected clarify');
    await o.resolve('s1', first.pendingId, ['Not sure']);
    expect(calls[1].facts).toEqual([]);
    expect(llm.calls[1].user).toMatch(/UNKNOWN/);
    expect(llm.calls[1].user).toContain('Is the hex a port?');
  });

  it('falls back to a plain chunk answer when the answer JSON is malformed', async () => {
    const { r } = fakeRetriever();
    const llm = new MockLlm([{ status: 'ready', questions: [] }, new LlmFormatError('bad')]);
    const res = await new Orchestrator(r, llm, new SessionStore()).ask('s1', 'q');
    if (res.type !== 'answer') throw new Error('expected answer');
    expect(res.citations[0]).toMatchObject({ sectionId: '8.31', verified: true });
    expect(res.answer).toMatch(/could not format/i);
  });

  it('proceeds to answering when the decide step returns malformed JSON', async () => {
    const { r } = fakeRetriever();
    const llm = new MockLlm([new LlmFormatError('bad'), goodAnswer]);
    expect((await new Orchestrator(r, llm, new SessionStore()).ask('s1', 'q')).type).toBe('answer');
  });

  it('rejects an unknown pending id', async () => {
    const { r } = fakeRetriever();
    const o = new Orchestrator(r, new MockLlm([]), new SessionStore());
    await expect(o.resolve('s1', 'nope', [])).rejects.toBeInstanceOf(NotFoundError);
  });

  it('reset clears facts', async () => {
    const { r, calls } = fakeRetriever();
    const store = new SessionStore();
    const llm = new MockLlm([
      { status: 'need_info', questions: [{ text: 'Port?', options: ['Yes'], sourceSectionId: '8.31' }] },
      goodAnswer,
      { status: 'ready', questions: [] },
      goodAnswer,
    ]);
    const o = new Orchestrator(r, llm, store);
    const first = await o.ask('s1', 'q');
    if (first.type !== 'clarify') throw new Error('expected clarify');
    await o.resolve('s1', first.pendingId, ['Yes']);
    o.reset('s1');
    await o.ask('s1', 'q2');
    expect(calls[calls.length - 1].facts).toEqual([]);
  });
});
