import { describe, it, expect } from 'vitest';
import { validateCitations, toCitation } from '../src/orchestrate/citations.js';
import type { Chunk } from '../src/types.js';

const chunk: Chunk = {
  id: '8.31',
  sectionId: '8.31',
  label: '8.31 No Surviving Air or Naval Units',
  headingPath: ['8.0 Battle Resolution', '8.3 Determining The Winner'],
  pageStart: 20,
  pageEnd: 20,
  text: '8.31 No Surviving Air or Naval Units If no air or naval units survive the battle, then the Offensives player wins.',
  crossRefs: [],
  conditionals: [],
  part: 0,
};

describe('validateCitations', () => {
  it('verifies an exact quote (case, spacing and quotes tolerant)', () => {
    const { citations, unverified } = validateCitations(
      [{ sectionId: '8.31', quote: 'If  NO air or naval units survive the battle' }],
      [chunk],
    );
    expect(unverified).toBe(0);
    expect(citations[0]).toMatchObject({ verified: true, pageStart: 20, sectionId: '8.31' });
  });
  it('keeps the section but marks the citation unverified when the quote is not in the text', () => {
    const { citations, unverified } = validateCitations([{ sectionId: '8.31', quote: 'the moon is made of cheese' }], [chunk]);
    expect(unverified).toBe(1);
    expect(citations[0]).toMatchObject({ verified: false, quote: '' });
  });
  it('drops citations to sections that were not retrieved', () => {
    const { citations, unverified } = validateCitations([{ sectionId: '99.9', quote: 'whatever it says here' }], [chunk]);
    expect(citations).toEqual([]);
    expect(unverified).toBe(1);
  });
  it('deduplicates identical citations', () => {
    const q = 'if no air or naval units survive the battle';
    const { citations } = validateCitations(
      [{ sectionId: '8.31', quote: q }, { sectionId: '8.31', quote: q }],
      [chunk],
    );
    expect(citations).toHaveLength(1);
  });
});

describe('toCitation', () => {
  it('copies page and heading metadata from the chunk', () => {
    expect(toCitation(chunk, true, 'q')).toMatchObject({
      label: chunk.label,
      headingPath: chunk.headingPath,
      pageEnd: 20,
      text: chunk.text,
    });
  });
});
