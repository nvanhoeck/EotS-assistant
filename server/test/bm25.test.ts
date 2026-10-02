import { describe, it, expect } from 'vitest';
import { tokenize, stem, Bm25 } from '../src/retrieve/bm25.js';

describe('tokenize/stem', () => {
  it('stems inflections to a common form', () => {
    expect(stem('battles')).toBe(stem('battle'));
    expect(stem('moving')).toBe(stem('moved'));
    expect(stem('move')).toBe(stem('moves'));
    expect(stem('units')).toBe(stem('unit'));
  });
  it('keeps rule numbers whole and drops stopwords', () => {
    expect(tokenize('What is rule 4.11 for the Allied player?')).toEqual(['rul', '4.11', 'alli', 'player']);
  });
  it('splits hyphenated words', () => {
    expect(tokenize('air-naval')).toEqual(['air', 'naval']);
  });
});

describe('Bm25', () => {
  const docs = [
    'reinforcement segment each player receives reinforcements',
    'replacement segment flip reduced units in supply',
    'battle resolution ground combat procedure',
  ].map(tokenize);
  const idx = new Bm25(docs);

  it('ranks the most relevant document first', () => {
    const r = idx.search(tokenize('how do replacements work for reduced units'), 3);
    expect(r[0].index).toBe(1);
  });
  it('returns nothing for unknown terms', () => {
    expect(idx.search(tokenize('zeppelin'), 3)).toEqual([]);
  });
});
