import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Retriever, ruleOrder } from '../src/retrieve/retriever.js';
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

const seq: Chunk[] = [
  mk('4.0', '4.0 Sequence of Play\nThe following sequence represents all portions of a single game turn.', {
    label: '4.0 Sequence of Play',
    summary: 'The following sequence represents all portions of a single game turn.',
  }),
  mk('4.1', '4.1 The Strategic Phase', { label: '4.1 The Strategic Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('4.11', '4.11 Reinforcement Segment Each player receives the scheduled reinforcements.', { summary: 'Reinforcement Segment Each player receives the scheduled reinforcements.' }),
  mk('4.12', '4.12 Replacement Segment Both players may receive replacements.', { summary: 'Replacement Segment Both players may receive replacements.' }),
  mk('4.2', '4.2 The Offensives Phase', { label: '4.2 The Offensives Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('4.21', '4.21 Offensives Segment The player with the most cards goes first.', { summary: 'Offensives Segment The player with the most cards goes first.' }),
  mk('8.31', 'No surviving air or naval units the battle is over and ground units do not fight'),
];

describe('Retriever heading expansion', () => {
  const r = new Retriever(seq, undefined, undefined, { minBm25: 0 });

  it('pulls in every sub-rule of a heading, in rule order', async () => {
    const out = await r.retrieve('What is the sequence of play?');
    const ids = out.chunks.map((c) => c.sectionId);
    expect(ids[0]).toBe('4.0');
    const rest = ids.filter((i) => i.startsWith('4.'));
    expect(rest).toEqual(['4.0', '4.1', '4.11', '4.12', '4.2', '4.21']);
  });
  it('adds an outline with one line per block, indented by depth', async () => {
    const out = await r.retrieve('What is the sequence of play?');
    expect(out.outline).toContain('4.0 Sequence of Play');
    expect(out.outline).toContain('\n  4.1 The Strategic Phase');
    expect(out.outline).toContain('\n    4.11 — Reinforcement Segment');
    expect(out.outline).toContain('\n    4.21 — Offensives Segment');
    expect(out.outline).not.toContain('(outline only)');
  });
  it('lists blocks that do not fit the budget as outline only', async () => {
    const tight = new Retriever(seq, undefined, undefined, { minBm25: 0, budgetChars: 100 });
    const out = await tight.retrieve('What is the sequence of play?');
    expect(out.chunks.map((c) => c.sectionId)).toEqual(['4.0']);
    expect(out.outline).toContain('4.11 — Reinforcement Segment');
    expect(out.outline).toContain('(outline only)');
  });
  it('outlines a top-ranked parent that has body text, without pulling in its sub-rule text', async () => {
    const battle: Chunk[] = [
      mk('8.0', '8.0 Battle Resolution\n' + 'combat sequence overview. ' + 'filler words here. '.repeat(30), {
        label: '8.0 Battle Resolution',
        summary: 'combat sequence overview.',
      }),
      mk('8.1', '8.1 Who Participates All units in the same hex must fight together.', { summary: 'Who Participates All units in the same hex must fight together.' }),
      mk('8.2', '8.2 Air Naval Combat Procedure combat sequence step by step.', { summary: 'Air Naval Combat Procedure combat sequence step by step.' }),
      mk('9.0', 'Reinforcements and amphibious shipping'),
    ];
    const out = await new Retriever(battle, undefined, undefined, { minBm25: 0 }).retrieve('combat sequence');
    expect(out.chunks.map((c) => c.sectionId)).not.toContain('8.1');
    expect(out.outline).toContain('8.0 Battle Resolution');
    expect(out.outline).toContain('8.1 — Who Participates');
    expect(out.outline).toContain('(outline only)');
  });
  it('lists sub-rules in rule order even when the chunks are stored out of order', async () => {
    const shuffled = [seq[0], seq[1], seq[3], seq[2], seq[5], seq[4], seq[6]];
    const out = await new Retriever(shuffled, undefined, undefined, { minBm25: 0 }).retrieve('What is the sequence of play?');
    expect(out.chunks.map((c) => c.sectionId).filter((i) => i.startsWith('4.'))).toEqual(['4.0', '4.1', '4.11', '4.12', '4.2', '4.21']);
    expect(out.outline.indexOf('4.11 —')).toBeLessThan(out.outline.indexOf('4.12 —'));
    expect(out.outline.indexOf('4.12 —')).toBeLessThan(out.outline.indexOf('4.2 The'));
  });
  it('lists only direct children for a parent that is outlined without its sub-rule text', async () => {
    const parent = mk('8.0', '8.0 Battle Resolution\n' + 'combat sequence overview. ' + 'filler words here. '.repeat(30), { label: '8.0 Battle Resolution', summary: 'combat sequence overview.' });
    const kids = [
      mk('8.3', '8.3 Winner of the exchange.', { summary: 'Winner of the exchange.' }),
      mk('8.31', '8.31 No surviving units.', { summary: 'No surviving units.' }),
      mk('8.9', '8.9 combat sequence combat sequence combat sequence.', { summary: 'combat sequence.' }),
    ];
    const out = await new Retriever([parent, ...kids, mk('9.0', 'amphibious shipping')], undefined, undefined, { minBm25: 0 }).retrieve('combat sequence');
    expect(out.outline).toContain('8.3 —');
    expect(out.outline).not.toContain('8.31');
  });
  it('gives no outline when the best match is a leaf rule', async () => {
    const out = await r.retrieve('What happens if no air or naval units survive?');
    expect(out.chunks[0].sectionId).toBe('8.31');
    expect(out.outline).toBe('');
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
    ['What happens if no air or naval units survive the battle?', ['9.31']],
    ['What does a zero die roll mean?', ['1.22']],
    ['What is an OC and an EC?', ['1.25']],
  ];
  it.each(cases)('%s', async (q, expected) => {
    const out = await r.retrieve(q);
    const ids = out.chunks.map((c) => c.sectionId);
    expect(expected.some((e) => ids.includes(e))).toBe(true);
  });
});

describe('ruleOrder', () => {
  it('keeps children under their parent', () => {
    const ids = ['4.2', '4.12', '4.1', '4.11', '10.1', '9.2', '4.0', '6.29.A', '6.29'];
    expect(ids.sort(ruleOrder)).toEqual(['4.0', '4.1', '4.11', '4.12', '4.2', '6.29', '6.29.A', '9.2', '10.1']);
  });
});

describe('Retriever.search', () => {
  const r = new Retriever(chunks);

  it('ranks the best match first', async () => {
    const out = await r.search('air or naval units survive');
    expect(out[0].sectionId).toBe('8.31');
  });
  it('honours the limit', async () => {
    expect((await r.search('units', 1)).length).toBe(1);
    expect((await r.search('units')).length).toBeGreaterThan(1);
  });
  it('returns one hit per section even when a section is split into parts', async () => {
    const parts = [
      mk('5.1', 'alpha beta gamma'),
      mk('5.1', 'alpha beta delta', { id: '5.1#1', part: 1 }),
      mk('6.1', 'unrelated words here'),
    ];
    const out = await new Retriever(parts).search('alpha beta');
    expect(out.map((c) => c.sectionId)).toEqual(['5.1']);
  });
  it('returns nothing for a query without searchable words', async () => {
    expect(await r.search('???')).toEqual([]);
    expect(await r.search('the of')).toEqual([]);
    expect(await r.search('   ')).toEqual([]);
  });
  it('keeps retrieve() unchanged', async () => {
    const out = await r.retrieve('What happens if no air or naval units survive?');
    expect(out.chunks[0].sectionId).toBe('8.31');
  });
});
