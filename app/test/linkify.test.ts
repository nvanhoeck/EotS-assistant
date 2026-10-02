import { describe, it, expect } from 'vitest';
import { splitReferences } from '../src/linkify';

const refs = (s: ReturnType<typeof splitReferences>) => s.filter((x) => x.ref).map((x) => x.ref);
const rejoin = (s: ReturnType<typeof splitReferences>) => s.map((x) => x.text).join('');

describe('splitReferences', () => {
  it('links known ids and keeps all the text', () => {
    const text = 'Allied reinforcements (WIE, see 9.21), then section 7.35.';
    const out = splitReferences(text, ['9.21', '7.35']);
    expect(refs(out)).toEqual(['9.21', '7.35']);
    expect(rejoin(out)).toBe(text);
  });
  it('does not confuse ids that are prefixes of each other', () => {
    const text = 'see 4.11 and 4.1.';
    const out = splitReferences(text, ['4.1', '4.11']);
    expect(refs(out)).toEqual(['4.11', '4.1']);
    expect(rejoin(out)).toBe(text);
  });
  it('ignores numbers that merely contain a known id', () => {
    expect(refs(splitReferences('page 14.11 and 4.11.5 and 4.110', ['4.11']))).toEqual([]);
  });
  it('links consecutive ids and ids at the start or end of the text', () => {
    const out = splitReferences('9.21, 9.22/9.23', ['9.21', '9.22', '9.23']);
    expect(refs(out)).toEqual(['9.21', '9.22', '9.23']);
    expect(out[0]).toEqual({ text: '9.21', ref: '9.21' });
  });
  it('links lettered sub-rule ids', () => {
    expect(refs(splitReferences('see 9.21.A for details', ['9.21', '9.21.A']))).toEqual(['9.21.A']);
  });
  it('returns plain text when there is nothing to link', () => {
    expect(splitReferences('no refs here 4.11', [])).toEqual([{ text: 'no refs here 4.11' }]);
    expect(splitReferences('', ['4.11'])).toEqual([]);
  });
});
