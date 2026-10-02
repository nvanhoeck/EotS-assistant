import { describe, it, expect } from 'vitest';
import { DEFAULT_SIZE_INDEX, TEXT_SIZES, stepSize } from '../src/textSize';

describe('text size', () => {
  it('has three steps and defaults to the middle (about 18pt)', () => {
    expect(TEXT_SIZES).toHaveLength(3);
    expect(TEXT_SIZES[DEFAULT_SIZE_INDEX]).toBe(18);
  });
  it('steps within bounds', () => {
    expect(stepSize(1, 1)).toBe(2);
    expect(stepSize(2, 1)).toBe(2);
    expect(stepSize(1, -1)).toBe(0);
    expect(stepSize(0, -1)).toBe(0);
  });
});
