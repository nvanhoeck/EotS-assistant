import { describe, it, expect } from 'vitest';
import { columnText, prefersColumns, reflow, ruleIdsOf } from '../src/ingest/columns.js';

/** Builds `pdftotext -layout` output: left and right column side by side with a gutter. */
function layoutPage(left: string[], right: string[], leftWidth = 40, gap = 4): string {
  const rows = Math.max(left.length, right.length);
  const out: string[] = [];
  for (let i = 0; i < rows; i++) out.push((left[i] ?? '').padEnd(leftWidth + gap) + (right[i] ?? ''));
  return out.join('\n');
}

const filler = (n: number, tag: string) => Array.from({ length: n }, (_, i) => `${tag} filler line ${i + 1}`);

describe('columnText', () => {
  const left = [...filler(14, 'left'), '11.5 Allied Strategy Cards', '11.51 Allied Draw', 'The Allied player receives a draw,'];
  const right = [
    'except during the first three turns.',
    '',
    '11.52 Allied Draw Limitations',
    'The Allied player loses one draw for:',
    '',
    'A. If China surrenders.',
    'B. If India surrenders.',
    ...filler(12, 'right'),
  ];
  const page = layoutPage(left, right);

  it('reads the whole left column before the right column', () => {
    const text = columnText(page)!;
    expect(text).not.toBeNull();
    const at = (s: string) => text.indexOf(s);
    expect(at('11.51 Allied Draw')).toBeGreaterThan(-1);
    expect(at('The Allied player receives a draw,')).toBeLessThan(at('except during the first three turns.'));
    expect(at('except during the first three turns.')).toBeLessThan(at('11.52 Allied Draw Limitations'));
    expect(at('11.52 Allied Draw Limitations')).toBeLessThan(at('A. If China surrenders.'));
    expect(at('left filler line 14')).toBeLessThan(at('11.5 Allied Strategy Cards'));
  });
  it('keeps the list under the rule that introduces it', () => {
    const lines = columnText(page)!.split('\n');
    const i = lines.indexOf('11.52 Allied Draw Limitations');
    expect(lines.slice(i, i + 5)).toEqual([
      '11.52 Allied Draw Limitations',
      'The Allied player loses one draw for:',
      '',
      'A. If China surrenders.',
      'B. If India surrenders.',
    ]);
  });
  it('drops the running header and footer lines', () => {
    const withHeader = `24  Empire of the Sun (v2.0)\n\n${page}\n\n    © 2007 GMT Games, LLC`;
    const text = columnText(withHeader)!;
    expect(text).not.toContain('Empire of the Sun');
    expect(text).not.toContain('GMT Games');
  });
  it('returns null for a single-column page', () => {
    const single = filler(30, 'one column of text that runs across the whole width of the page').join('\n');
    expect(columnText(single)).toBeNull();
  });
  it('returns null when a full-width line breaks the gutter', () => {
    const wide = layoutPage(filler(12, 'left'), filler(12, 'right')).split('\n');
    wide[5] = 'A table or a map caption that spans the full width of both columns on this line';
    wide.push(...wide.slice(0, 4));
    expect(columnText(wide.join('\n'))).toBeNull();
  });
  it('returns null for a short page', () => {
    expect(columnText(layoutPage(filler(4, 'left'), filler(4, 'right')))).toBeNull();
  });
  it('returns null when only one side has text', () => {
    expect(columnText(layoutPage(filler(20, 'left'), []))).toBeNull();
  });
});

describe('reflow', () => {
  it('joins wrapped lines into one paragraph', () => {
    expect(reflow('The Allied player\nreceives a draw of\n7 cards.')).toBe('The Allied player receives a draw of 7 cards.');
  });
  it('removes a hyphen at a line end', () => {
    expect(reflow('conducted exten-\nsive operations')).toBe('conducted extensive operations');
  });
  it('splits paragraphs at blank lines', () => {
    expect(reflow('First paragraph.\n\nSecond paragraph.')).toBe('First paragraph.\nSecond paragraph.');
  });
  it('starts a new line at a rule number and at lettered list items', () => {
    const text = 'is lost.\n11.52 Allied Draw Limitations\nThe Allied loses:\nA. If China surrenders.\nB. If India surrenders.';
    expect(reflow(text)).toBe(
      'is lost.\n11.52 Allied Draw Limitations The Allied loses:\nA. If China surrenders.\nB. If India surrenders.',
    );
  });
  it('does not split on a number or initial in the middle of a sentence', () => {
    expect(reflow('see rule\n9.21) for details\nof the U.S. Navy')).toBe('see rule 9.21) for details of the U.S. Navy');
  });
  it('starts a new line at a PLAY NOTE', () => {
    expect(reflow('end of the rule.\nPLAY NOTE: Do this first.')).toBe('end of the rule.\nPLAY NOTE: Do this first.');
  });
});

describe('prefersColumns', () => {
  const flowOrder = ['11.22 Submarine', 'text', '11.52 Allied Draw Limitations', 'A. If China', '11.33 B29 Cards', '11.4 Passing', '11.51 Allied Draw'].join('\n');
  const columnOrder = ['11.22 Submarine', 'text', '11.33 B29 Cards', '11.4 Passing', '11.51 Allied Draw', '11.52 Allied Draw Limitations', 'A. If China'].join('\n');

  it('prefers the column reading when it has the same rules in better order', () => {
    expect(prefersColumns(flowOrder, columnOrder)).toBe(true);
  });
  it('keeps the default reading when the order is no better', () => {
    expect(prefersColumns(columnOrder, flowOrder)).toBe(false);
    expect(prefersColumns(columnOrder, columnOrder)).toBe(false);
  });
  it('keeps the default reading when the column reading loses or adds a rule', () => {
    const lost = columnOrder.replace('11.4 Passing\n', '');
    const added = columnOrder + '\n11.99 Extra';
    expect(prefersColumns(flowOrder, lost)).toBe(false);
    expect(prefersColumns(flowOrder, added)).toBe(false);
  });
  it('ignores lines that only mention a rule number', () => {
    expect(ruleIdsOf('see 11.52 for details\n11.4 Passing\nA. 11.99 not a rule start')).toEqual(['11.4']);
  });
});
