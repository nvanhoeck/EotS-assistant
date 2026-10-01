import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Retriever } from '../src/retrieve/retriever.js';
import type { Chunk } from '../src/types.js';
import { config } from '../src/config.js';

const mk = (sectionId: string, text: string, extra: Partial<Chunk> = {}): Chunk => ({
  id: sectionId,
  sectionId,
  label: `${sectionId} Label`,
  headingPath: [],
  pageStart: 5,
  pageEnd: 5,
  text,
  crossRefs: [],
  conditionals: [],
  part: 0,
  ...extra,
});

const chunks: Chunk[] = [
  mk('4.11', 'Reinforcement segment each player receives scheduled reinforcements for the turn', { crossRefs: ['9.0'] }),
  mk('4.12', 'Replacement segment both players may receive replacements to flip reduced units'),
  mk('8.31', 'No surviving air or naval units the battle is over and ground units do not fight'),
  mk('9.0', 'Reinforcements and amphibious shipping points placement of new units'),
];

describe('Retriever (BM25 only)', () => {
  // tiny 4-chunk corpus gives low idf, so use a lower confidence threshold than the default
  const r = new Retriever(chunks, undefined, undefined, { minBm25: 1 });

  it('finds the matching rule', async () => {
    const out = await r.retrieve('What happens if no air or naval units survive?');
    expect(out.chunks[0].sectionId).toBe('8.31');
    expect(out.mode).toBe('bm25');
    expect(out.lowConfidence).toBe(false);
  });
  it('expands cross references', async () => {
    const out = await r.retrieve('reinforcement segment scheduled reinforcements');
    expect(out.chunks.map((c) => c.sectionId)).toContain('9.0');
  });
  it('flags low confidence for unrelated questions', async () => {
    const out = await r.retrieve('what is the airspeed velocity of a swallow');
    expect(out.lowConfidence).toBe(true);
  });
  it('includes session facts in the query', async () => {
    const out = await r.retrieve('what now', ['replacements flip reduced units']);
    expect(out.chunks[0].sectionId).toBe('4.12');
  });
  it('respects the character budget but always returns the best chunk', async () => {
    const tight = new Retriever(chunks, undefined, undefined, { budgetChars: 10 });
    const out = await tight.retrieve('reinforcement segment scheduled reinforcements');
    expect(out.chunks).toHaveLength(1);
  });
});

describe('Retriever (hybrid)', () => {
  it('uses embeddings when available and falls back when they fail', async () => {
    const vectors = [[1, 0], [0, 1], [0, 0.2], [0.1, 0]];
    const ok = new Retriever(chunks, { embed: async () => [[0, 1]] }, vectors);
    expect((await ok.retrieve('zzz unrelated')).mode).toBe('hybrid');

    const broken = new Retriever(
      chunks,
      {
        embed: async () => {
          throw new Error('down');
        },
      },
      vectors,
    );
    expect((await broken.retrieve('replacements')).mode).toBe('bm25');
  });
  it('rejects misaligned vectors', () => {
    expect(() => new Retriever(chunks, { embed: async () => [[0]] }, [[1]])).toThrow(/aligned/);
  });
});

const file = path.join(config.dataDir, 'chunks.json');
describe.skipIf(!fs.existsSync(file))('Retriever on the real rulebook (BM25)', () => {
  const real: Chunk[] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const r = new Retriever(real);
  const cases: [string, string[]][] = [
    ['What happens in the reinforcement segment?', ['4.11']],
    ['How many strategy cards does each player get dealt?', ['4.14']],
    ['Who goes first in the offensives phase?', ['4.21']],
    ['What happens if no air or naval units survive the battle?', ['8.31']],
    ['What does a zero die roll mean?', ['1.21']],
    ['What is an OC and an EC?', ['1.24']],
  ];
  it.each(cases)('%s', async (q, expected) => {
    const out = await r.retrieve(q);
    const ids = out.chunks.map((c) => c.sectionId);
    expect(expected.some((e) => ids.includes(e))).toBe(true);
  });
});
