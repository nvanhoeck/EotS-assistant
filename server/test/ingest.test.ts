import { describe, it, expect } from 'vitest';
import { buildFromPages, droppedIds } from '../src/ingest/index.js';

describe('buildFromPages', () => {
  const pages = [
    'cover',
    '4.0 Sequence of Play\n4.1 The Strategic Phase\n4.11 Reinforcement Segment Each player receives reinforcements. See Replacements (10.0).',
    '',
    '10.0 Replacements\n10.1 Out Of Order\n6.23 Later\n6.2 Earlier',
  ];
  const { chunks, report } = buildFromPages(pages);

  it('produces chunks and a report', () => {
    expect(chunks.length).toBeGreaterThanOrEqual(6);
    expect(report.pages).toBe(4);
    expect(report.chunks).toBe(chunks.length);
  });
  it('reports pages with no rule starts', () => {
    expect(report.pagesWithoutRules).toContain(3);
  });
  it('flags ids that appear out of numeric order', () => {
    expect(report.outOfOrderIds).toContain('6.2');
  });
});

describe('droppedIds', () => {
  const c = (sectionId: string) => ({ sectionId });
  it('lists rule ids present before but missing after, once each', () => {
    const before = [c('4.0'), c('4.1'), c('4.1'), c('ERRATA')];
    const after = [c('4.0'), c('4.2')];
    expect(droppedIds(before, after)).toEqual(['4.1', 'ERRATA']);
  });
  it('is empty when nothing was lost (new ids are fine)', () => {
    expect(droppedIds([c('4.0')], [c('4.0'), c('4.1')])).toEqual([]);
  });
});
