import { describe, it, expect } from 'vitest';
import { buildFromPages } from '../src/ingest/index.js';

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
