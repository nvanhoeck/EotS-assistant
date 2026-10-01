import { describe, it, expect } from 'vitest';
import { toParagraphs } from '../src/paragraphs';

describe('toParagraphs', () => {
  it('splits on line breaks and drops empties', () => {
    expect(toParagraphs('First part.\n\nSecond part.\n')).toEqual([
      { lead: null, text: 'First part.' },
      { lead: null, text: 'Second part.' },
    ]);
  });
  it('pulls a leading rule number out as the run-in lead', () => {
    expect(toParagraphs('4.11 Reinforcement Segment Each player receives units.')).toEqual([
      { lead: '4.11', text: 'Reinforcement Segment Each player receives units.' },
    ]);
    expect(toParagraphs('9.21.A Lettered rule.')[0].lead).toBe('9.21.A');
  });
  it('does not treat a decimal in the middle of the text as a lead', () => {
    expect(toParagraphs('Roll 4.5 times.')).toEqual([{ lead: null, text: 'Roll 4.5 times.' }]);
  });
  it('collapses hard-wrapped whitespace inside a paragraph', () => {
    expect(toParagraphs('one   two\tthree')).toEqual([{ lead: null, text: 'one two three' }]);
  });
  it('breaks a very long paragraph at sentence ends without losing text', () => {
    const text = Array.from({ length: 30 }, (_, i) => `This is sentence number ${i + 1}.`).join(' ');
    const out = toParagraphs(text);
    expect(out.length).toBeGreaterThan(1);
    expect(out.every((p) => p.text.length <= 500 && p.text.endsWith('.'))).toBe(true);
    expect(out.map((p) => p.text).join(' ')).toBe(text);
  });
  it('does not split after abbreviations such as e.g. or U.S.', () => {
    const filler = Array.from({ length: 20 }, (_, i) => `Filler sentence number ${i + 1}.`).join(' ');
    const text = `${filler} Units move, e.g. Japanese naval units. The U.S. Navy may react.`;
    const joined = toParagraphs(text).map((p) => p.text);
    expect(joined.some((p) => p.includes('e.g. Japanese'))).toBe(true);
    expect(joined.some((p) => p.includes('U.S. Navy'))).toBe(true);
  });
  it('returns nothing for empty text', () => {
    expect(toParagraphs('')).toEqual([]);
    expect(toParagraphs(' \n ')).toEqual([]);
  });
});
