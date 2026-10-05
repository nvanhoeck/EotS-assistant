import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { citeLabel } from '../../src/helper/cite';
import { RULE_PAGES } from '../../src/helper/rulePages';

const raw = JSON.parse(readFileSync(new URL('../../../server/data/chunks.json', import.meta.url), 'utf8'));
const chunks: { sectionId: string; pageStart: number; pageEnd: number }[] = Array.isArray(raw) ? raw : raw.chunks;

describe('rulePages', () => {
  it('matches server/data/chunks.json (run `npm run gen:pages` after a re-ingest)', () => {
    const expected: Record<string, [number, number]> = {};
    for (const c of chunks) {
      const cur = expected[c.sectionId];
      expected[c.sectionId] = [Math.min(cur?.[0] ?? c.pageStart, c.pageStart), Math.max(cur?.[1] ?? c.pageEnd, c.pageEnd)];
    }
    expect(RULE_PAGES).toEqual(expected);
  });
  it('labels a section with its page', () => {
    expect(citeLabel('9.12')).toBe('9.12 · p. 22');
  });
  it('falls back to the bare id for an unknown section', () => {
    expect(citeLabel('99.9')).toBe('99.9');
  });
});
