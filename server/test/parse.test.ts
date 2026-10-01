import { describe, it, expect } from 'vitest';
import { parseRules } from '../src/ingest/parse.js';

const pages = [
  'cover and table of contents\n1.0 Introduction ........ 2',
  '1.0 Introduction\n1.1 Causes of the War\n1.21 Die Empire of the Sun uses a single die.\nMore on the die.',
  '1.22 Map The single map sheet.\n3.5 hexes away is still the same rule.\n12.0 National Status ........ 24',
];

describe('parseRules', () => {
  const blocks = parseRules(pages);

  it('skips page 1 and finds rule starts', () => {
    expect(blocks.map((b) => b.id)).toEqual(['1.0', '1.1', '1.21', '1.22']);
  });

  it('marks short standalone lines as headings with titles', () => {
    expect(blocks[0]).toMatchObject({ heading: true, title: 'Introduction', page: 2, pageEnd: 2 });
    expect(blocks[1]).toMatchObject({ heading: true, title: 'Causes of the War' });
  });

  it('treats long lines as inline rules and appends continuation lines', () => {
    expect(blocks[2]).toMatchObject({ heading: false, title: null, page: 2, pageEnd: 2 });
    expect(blocks[2].text).toContain('More on the die.');
  });

  it('does not start a rule on a lowercase continuation and drops dot-leader lines', () => {
    expect(blocks[3].text).toContain('3.5 hexes away');
    expect(blocks[3].text).not.toContain('National Status');
    expect(blocks[3]).toMatchObject({ page: 3, pageEnd: 3 });
  });
});
