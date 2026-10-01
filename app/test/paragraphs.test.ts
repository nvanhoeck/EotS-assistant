import { describe, it, expect } from 'vitest';
import { dropLead, toParagraphs } from '../src/paragraphs';

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
    const fill = (tag: string, n: number) =>
      Array.from({ length: n }, (_, i) => `${tag} sentence number ${i + 1}.`).join(' ');
    // Sized so that, without the abbreviation guard, a piece boundary falls right after "e.g." and "U.S.".
    const text = `${fill('Filler', 15)} Units move, e.g. Japanese naval units. ${fill('Reserve', 12)} Then the U.S. Navy may react.`;
    expect(text.length).toBeGreaterThan(600);
    const pieces = toParagraphs(text).map((p) => p.text);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.some((p) => p.endsWith('e.g.') || p.endsWith('U.S.'))).toBe(false);
    expect(pieces.some((p) => p.startsWith('Japanese') || p.startsWith('Navy'))).toBe(false);
    expect(pieces.some((p) => p.includes('e.g. Japanese'))).toBe(true);
    expect(pieces.some((p) => p.includes('U.S. Navy'))).toBe(true);
    expect(pieces.join(' ')).toBe(text);
  });
  it('returns nothing for empty text', () => {
    expect(toParagraphs('')).toEqual([]);
    expect(toParagraphs(' \n ')).toEqual([]);
  });
});

describe('dropLead', () => {
  it('removes a lead equal to the section id, keeps others', () => {
    const ps = [{ lead: '4.1', text: 'a' }, { lead: '4.2', text: 'b' }, { lead: null, text: 'c' }];
    expect(dropLead(ps, '4.1')).toEqual([{ lead: null, text: 'a' }, { lead: '4.2', text: 'b' }, { lead: null, text: 'c' }]);
  });
});
