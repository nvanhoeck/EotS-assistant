import { describe, it, expect } from 'vitest';
import { SectionIndex } from '../src/library/sections.js';
import type { Chunk } from '../src/types.js';

const mk = (id: string, text: string, extra: Partial<Chunk> = {}): Chunk => ({
  id, sectionId: id, label: id, headingPath: [], pageStart: 5, pageEnd: 5, text, crossRefs: [], conditionals: [], part: 0, ...extra,
});
const L411 = '4.11 Reinforcement Segment Each player receives';
const chunks: Chunk[] = [
  mk('4.0', '4.0 Sequence of Play\nThe sequence is repeated each turn.', { label: '4.0 Sequence of Play' }),
  mk('4.1', '4.1 The Strategic Phase', { label: '4.1 The Strategic Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('4.11', '4.11 Reinforcement Segment Each player receives reinforcements (see 9.0).', {
    label: L411, crossRefs: ['9.0'], pageStart: 6, pageEnd: 6,
    summary: 'Reinforcement Segment Each player receives reinforcements (see 9.0).',
  }),
  mk('4.11', 'It continues here.', { id: '4.11#1', part: 1, label: L411, pageStart: 6, pageEnd: 7 }),
  mk('4.12', '4.12 Replacement Segment Both players may receive replacements.', { label: '4.12 Replacement Segment Both players may' }),
  mk('4.2', '4.2 The Offensives Phase', { label: '4.2 The Offensives Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('9.0', '9.0 Reinforcements\nNew units arrive.', { label: '9.0 Reinforcements' }),
  mk('ERRATA', 'ERRATA Errata and printing notes\nFix one.', { label: 'ERRATA Errata and printing notes' }),
];
const index = new SectionIndex(chunks);

describe('SectionIndex.section', () => {
  it('returns undefined for an unknown id', () => {
    expect(index.section('nope')).toBeUndefined();
  });
  it('merges split parts, pages and cross references of one section', () => {
    const s = index.section('4.11')!;
    expect(s.text).toBe('4.11 Reinforcement Segment Each player receives reinforcements (see 9.0). It continues here.');
    expect(s.pageStart).toBe(6);
    expect(s.pageEnd).toBe(7);
    expect(s.title).toBeNull();
    expect(s.crossRefs).toEqual([{ sectionId: '9.0', label: '9.0 Reinforcements' }]);
  });
  it('turns a heading into title + body without the label line', () => {
    const s = index.section('4.0')!;
    expect(s.title).toBe('Sequence of Play');
    expect(s.text).toBe('The sequence is repeated each turn.');
    expect(s.children.map((c) => c.sectionId)).toEqual(['4.1', '4.2']);
  });
  it('gives a heading-only section an empty body and its children', () => {
    const s = index.section('4.1')!;
    expect(s.title).toBe('The Strategic Phase');
    expect(s.text).toBe('');
    expect(s.headingPath).toEqual(['4.0 Sequence of Play']);
    expect(s.children.map((c) => c.sectionId)).toEqual(['4.11', '4.12']);
    expect(s.children[0].summary).toMatch(/^Reinforcement Segment/);
  });
  it('prefers siblings for prev/next and falls back to the document neighbour at the edges', () => {
    const first = index.section('4.11')!;
    expect(first.prev?.sectionId).toBe('4.1'); // no previous sibling -> parent heading
    expect(first.next?.sectionId).toBe('4.12');
    const last = index.section('4.12')!;
    expect(last.prev?.sectionId).toBe('4.11');
    expect(last.next?.sectionId).toBe('4.2'); // no next sibling -> next in document order
    expect(index.section('4.1')!.next?.sectionId).toBe('4.2');
  });
  it('has no prev before the first section and no next after the last', () => {
    expect(index.section('4.0')!.prev).toBeNull();
    expect(index.section('4.0')!.next?.sectionId).toBe('9.0');
    expect(index.section('ERRATA')!.prev?.sectionId).toBe('9.0');
    expect(index.section('ERRATA')!.next).toBeNull();
  });
  it('attaches a section whose parent heading is missing to its nearest existing ancestor', () => {
    const orphan = new SectionIndex([
      mk('17.0', '17.0 Scenarios\nIntro.', { label: '17.0 Scenarios' }),
      mk('17.21', '17.21 Orphan rule.'),
    ]);
    expect(orphan.section('17.0')!.children.map((c) => c.sectionId)).toEqual(['17.21']);
    expect(orphan.section('17.21')!.prev?.sectionId).toBe('17.0');
  });
});

describe('SectionIndex.outline and hit', () => {
  it('lists the top-level sections in rule order', () => {
    expect(index.outline().map((s) => s.sectionId)).toEqual(['4.0', '9.0', 'ERRATA']);
  });
  it('maps a chunk to a search hit using the section label and the chunk summary', () => {
    expect(index.hit(chunks[2])).toEqual({
      sectionId: '4.11', label: L411, headingPath: [], pageStart: 6, pageEnd: 6,
      snippet: 'Reinforcement Segment Each player receives reinforcements (see 9.0).',
    });
  });
  it('falls back to a computed summary when the chunk has none', () => {
    expect(index.hit(chunks[0]).snippet).toBe('The sequence is repeated each turn.');
  });
});
