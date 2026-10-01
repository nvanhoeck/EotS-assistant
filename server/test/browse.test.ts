import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/api/app.js';
import { createBrowseRouter } from '../src/api/browse.js';
import { SectionIndex } from '../src/library/sections.js';
import { Orchestrator } from '../src/orchestrate/orchestrator.js';
import { SessionStore } from '../src/orchestrate/session.js';
import { MockLlm } from '../src/llm/mock.js';
import type { Chunk } from '../src/types.js';

const mk = (id: string, text: string, extra: Partial<Chunk> = {}): Chunk => ({
  id, sectionId: id, label: id, headingPath: [], pageStart: 5, pageEnd: 5, text, crossRefs: [], conditionals: [], part: 0, ...extra,
});
const chunks: Chunk[] = [
  mk('4.0', '4.0 Sequence of Play\nThe sequence is repeated each turn.', { label: '4.0 Sequence of Play' }),
  mk('4.11', '4.11 Reinforcement Segment Each player receives reinforcements.', { label: '4.11 Reinforcement Segment', summary: 'Each player receives reinforcements.' }),
  mk('9.0', '9.0 Reinforcements\nNew units arrive.', { label: '9.0 Reinforcements' }),
  mk('ERRATA', 'ERRATA Errata and printing notes\nFix one.', { label: 'ERRATA Errata and printing notes' }),
];
const index = new SectionIndex(chunks);
const calls: { q: string; limit?: number }[] = [];
const searcher = {
  search: async (q: string, limit?: number) => {
    calls.push({ q, limit });
    return q === 'nothing' ? [] : [chunks[1], chunks[0]];
  },
};
const orchestrator = new Orchestrator(
  { retrieve: async () => ({ chunks: [], lowConfidence: true, mode: 'bm25' as const }) },
  new MockLlm([]),
  new SessionStore(),
);
const app = () => createApp(orchestrator, createBrowseRouter(searcher, index));

describe('browse API', () => {
  it('GET /search returns ranked hits, best first', async () => {
    const res = await request(app()).get('/search').query({ q: 'reinforcement' });
    expect(res.status).toBe(200);
    expect(res.body.results.map((r: { sectionId: string }) => r.sectionId)).toEqual(['4.11', '4.0']);
    expect(res.body.results[0]).toMatchObject({ label: '4.11 Reinforcement Segment', snippet: 'Each player receives reinforcements.' });
  });
  it('asks the retriever for at most 20 hits and trims the query', async () => {
    calls.length = 0;
    await request(app()).get('/search').query({ q: '  air combat  ' });
    expect(calls).toEqual([{ q: 'air combat', limit: 20 }]);
  });
  it('GET /search with no hits is an empty list, not an error', async () => {
    const res = await request(app()).get('/search').query({ q: 'nothing' });
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });
  it('GET /search without a usable q is 400', async () => {
    expect((await request(app()).get('/search')).status).toBe(400);
    expect((await request(app()).get('/search').query({ q: '   ' })).status).toBe(400);
  });
  it('GET /section/:id returns the section view', async () => {
    const res = await request(app()).get('/section/4.0');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ sectionId: '4.0', title: 'Sequence of Play', prev: null, next: { sectionId: '9.0' } });
  });
  it('GET /section/ERRATA works and has no next', async () => {
    const res = await request(app()).get('/section/ERRATA');
    expect(res.status).toBe(200);
    expect(res.body.next).toBeNull();
  });
  it('GET /section/:id for an unknown id is 404 with a message', async () => {
    const res = await request(app()).get('/section/99.9');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/99\.9/);
  });
  it('GET /outline lists the top-level sections', async () => {
    const res = await request(app()).get('/outline');
    expect(res.body.sections.map((s: { sectionId: string }) => s.sectionId)).toEqual(['4.0', '9.0', 'ERRATA']);
  });
  it('the browse routes are absent when no router is given', async () => {
    expect((await request(createApp(orchestrator)).get('/outline')).status).toBe(404);
  });
});
