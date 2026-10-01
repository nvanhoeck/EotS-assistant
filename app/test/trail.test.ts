import { describe, it, expect } from 'vitest';
import { backFrom, backLabel, openSection, stepSection } from '../src/trail';

const a = { sectionId: '4.0', label: '4.0 Sequence of Play' };
const b = { sectionId: '4.1', label: '4.1 The Strategic Phase' };
const c = { sectionId: '9.0', label: '9.0 Reinforcements' };

describe('trail', () => {
  it('open pushes; opening the section already on top does nothing', () => {
    expect(openSection([], a)).toEqual([a]);
    expect(openSection([a], b)).toEqual([a, b]);
    expect(openSection([a, b], b)).toEqual([a, b]);
  });
  it('step replaces the top entry (previous/next stay in place in the history)', () => {
    expect(stepSection([a, b], c)).toEqual([a, c]);
    expect(stepSection([], c)).toEqual([c]);
  });
  it('step back onto the entry below pops instead of duplicating it', () => {
    expect(stepSection([a, b], a)).toEqual([a]);
  });
  it('back pops one entry and ends up empty (the search list)', () => {
    expect(backFrom([a, b])).toEqual([a]);
    expect(backFrom([a])).toEqual([]);
    expect(backFrom([])).toEqual([]);
  });
  it('back label names where Back leads', () => {
    expect(backLabel([a])).toBe('Back to results');
    expect(backLabel([a, b])).toBe('Back to 4.0 Sequence of Play');
  });
  it('following a reference then stepping then going back returns to where the reference was tapped', () => {
    let t = openSection([], a); // opened from search
    t = openSection(t, c); // tapped "see 9.0"
    t = stepSection(t, b); // pressed Next inside 9.0's slot
    expect(backFrom(t)).toEqual([a]);
  });
});
