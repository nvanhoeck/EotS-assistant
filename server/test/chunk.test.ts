import { describe, it, expect } from 'vitest';
import { buildChunks, parentId, splitText } from '../src/ingest/chunk.js';
import type { RuleBlock } from '../src/types.js';

const b = (id: string, text: string, heading = false, title: string | null = null, page = 5): RuleBlock => ({
  id,
  heading,
  title,
  page,
  pageEnd: page,
  text,
});

describe('parentId', () => {
  it.each([
    ['4.11', '4.1'],
    ['4.1', '4.0'],
    ['4.0', null],
    ['6.29.A', '6.29'],
    ['10.0', null],
    ['9.21', '9.2'],
  ])('%s -> %s', (id, parent) => {
    expect(parentId(id)).toBe(parent);
  });
});

describe('splitText', () => {
  it('returns one piece when short', () => {
    expect(splitText('short text', 100)).toEqual(['short text']);
  });
  it('packs sentences into pieces no longer than max', () => {
    const text = 'One sentence here. Two sentence here. Three sentence here.';
    const pieces = splitText(text, 40);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.every((p) => p.length <= 40)).toBe(true);
    expect(pieces.join(' ')).toBe(text);
  });
});

describe('buildChunks', () => {
  const blocks = [
    b('4.0', '4.0 Sequence of Play', true, 'Sequence of Play'),
    b('4.1', '4.1 The Strategic Phase', true, 'The Strategic Phase'),
    b(
      '4.12',
      '4.12 Replacement Segment Both players may receive replacements. Replacements flip units only if they are in supply. See Replacements (rule 10.0) and 99.9.',
    ),
    b('10.0', '10.0 Replacements', true, 'Replacements', 22),
  ];
  const chunks = buildChunks(blocks);
  const c412 = chunks.find((c) => c.sectionId === '4.12')!;

  it('builds heading path from rule-number ancestry', () => {
    expect(c412.headingPath).toEqual(['4.0 Sequence of Play', '4.1 The Strategic Phase']);
  });
  it('labels inline rules with their first words', () => {
    expect(c412.label.startsWith('4.12 Replacement Segment')).toBe(true);
  });
  it('keeps only cross refs that are known sections', () => {
    expect(c412.crossRefs).toEqual(['10.0']);
  });
  it('extracts conditional sentences', () => {
    expect(c412.conditionals).toHaveLength(1);
    expect(c412.conditionals[0]).toContain('only if they are in supply');
  });
  it('splits long blocks into parts that share the section id', () => {
    const long = b('5.1', '5.1 ' + 'Sentence number one is here. '.repeat(100));
    const parts = buildChunks([long]);
    expect(parts.length).toBeGreaterThan(1);
    expect(new Set(parts.map((p) => p.sectionId))).toEqual(new Set(['5.1']));
    expect(parts[1].id).toBe('5.1#1');
    expect(parts[1].part).toBe(1);
  });
  it('gives duplicate section ids unique chunk ids', () => {
    const dup = buildChunks([b('6.2', '6.2 Intelligence'), b('6.2', '6.2 Something else here entirely.')]);
    expect(dup.map((c) => c.id)).toEqual(['6.2', '6.2~2']);
  });
});
