import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/api/app.js';
import { Orchestrator } from '../src/orchestrate/orchestrator.js';
import { SessionStore } from '../src/orchestrate/session.js';
import { MockLlm } from '../src/llm/mock.js';
import { LlmError } from '../src/llm/types.js';
import type { Chunk } from '../src/types.js';

const chunk: Chunk = {
  id: '8.31', sectionId: '8.31', label: '8.31 X', headingPath: [], pageStart: 20, pageEnd: 20,
  text: 'If no air or naval units survive the battle, ground combat is conducted unless the hex is a port.',
  crossRefs: [], conditionals: [], part: 0,
};
const retriever = { retrieve: async () => ({ chunks: [chunk], lowConfidence: false, mode: 'bm25' as const }) };
const answer = { answer: 'ok', steps: [], citations: [{ sectionId: '8.31', quote: 'ground combat is conducted' }], assumptions: [] };

function app(queue: unknown[]) {
  return createApp(new Orchestrator(retriever, new MockLlm(queue), new SessionStore()));
}

describe('API', () => {
  it('GET /health', async () => {
    const res = await request(app([])).get('/health');
    expect(res.status).toBe(200);
  });
  it('POST /ask returns an answer', async () => {
    const res = await request(app([{ status: 'ready', questions: [] }, answer]))
      .post('/ask').send({ sessionId: 's', question: 'q' });
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('answer');
    expect(res.body.citations[0].pageStart).toBe(20);
  });
  it('POST /ask validates input', async () => {
    const res = await request(app([])).post('/ask').send({ sessionId: 's' });
    expect(res.status).toBe(400);
  });
  it('clarify then answer-clarification', async () => {
    const a = app([
      { status: 'need_info', questions: [{ text: 'Port?', options: ['Yes', 'No'], sourceSectionId: '8.31' }] },
      answer,
    ]);
    const first = await request(a).post('/ask').send({ sessionId: 's', question: 'q' });
    expect(first.body.type).toBe('clarify');
    const second = await request(a)
      .post('/answer-clarification')
      .send({ sessionId: 's', pendingId: first.body.pendingId, answers: ['Yes'] });
    expect(second.status).toBe(200);
    expect(second.body.type).toBe('answer');
  });
  it('answer-clarification with a bad pending id is 404', async () => {
    const res = await request(app([])).post('/answer-clarification').send({ sessionId: 's', pendingId: 'x', answers: [] });
    expect(res.status).toBe(404);
  });
  it('maps LlmError to 503 with a readable message', async () => {
    const res = await request(app([new LlmError('Cannot reach Ollama at http://x')]))
      .post('/ask').send({ sessionId: 's', question: 'q' });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/Ollama/);
  });
  it('POST /reset clears a session', async () => {
    const res = await request(app([])).post('/reset').send({ sessionId: 's' });
    expect(res.status).toBe(200);
  });
});
