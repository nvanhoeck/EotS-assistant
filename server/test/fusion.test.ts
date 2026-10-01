import { describe, it, expect } from 'vitest';
import { cosine, topCosine, rrf } from '../src/retrieve/fusion.js';
import { intentMajors, majorOf } from '../src/retrieve/intent.js';

describe('fusion', () => {
  it('cosine of identical vectors is 1 and orthogonal is 0', () => {
    expect(cosine([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it('topCosine orders by similarity', () => {
    const r = topCosine([1, 0], [[0, 1], [1, 0.1], [1, 1]], 2);
    expect(r.map((x) => x.index)).toEqual([1, 2]);
  });
  it('rrf rewards items ranked well in both lists', () => {
    const f = rrf([[1, 2, 3], [3, 1, 4]]);
    const order = [...f.entries()].sort((a, b) => b[1] - a[1]).map(([i]) => i);
    expect(order[0]).toBe(1);
  });
});

describe('intent', () => {
  it('maps question words to rule majors', () => {
    expect(intentMajors('How do I set up the game?').has(2)).toBe(true);
    expect(intentMajors('who wins the battle').has(8)).toBe(true);
    expect(intentMajors('what is the sequence of play').has(4)).toBe(true);
    expect(intentMajors('banana').size).toBe(0);
  });
  it('only treats "sequence of play" as the turn sequence, not any "sequence of X"', () => {
    expect([...intentMajors('What is the sequence of combat?')]).toEqual([8]);
    expect(intentMajors('What is the sequence of an offensive?').has(4)).toBe(false);
    expect(intentMajors('what is the sequence of play').has(3)).toBe(true);
  });
  it('extracts the major from a section id', () => {
    expect(majorOf('4.11')).toBe(4);
    expect(majorOf('10.0')).toBe(10);
  });
});
