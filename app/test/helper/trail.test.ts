import { describe, it, expect } from 'vitest';
import { backTextFor, currentPageId, popEntry, pushEntry, readingSection, replaceTop, type HelperEntry } from '../../src/helper/trail';

const page = (id: string): HelperEntry => ({ kind: 'page', id });
const sec = (sectionId: string): HelperEntry => ({ kind: 'section', sectionId, label: `§${sectionId}` });
const titleOf = (id: string) => `Title ${id}`;

describe('helper trail', () => {
  it('push adds; pushing the entry already on top does nothing', () => {
    expect(pushEntry([], page('a'))).toEqual([page('a')]);
    expect(pushEntry([page('a')], page('a'))).toEqual([page('a')]);
    expect(pushEntry([page('a')], sec('9.1'))).toEqual([page('a'), sec('9.1')]);
    expect(pushEntry([sec('9.1')], sec('9.1'))).toEqual([sec('9.1')]);
  });
  it('a page and a section with the same text are different entries', () => {
    expect(pushEntry([page('9.1')], sec('9.1'))).toHaveLength(2);
  });
  it('five taps in, five Backs out', () => {
    let t = pushEntry([], page('a'));
    t = pushEntry(t, page('b'));
    t = pushEntry(t, sec('9.1'));
    t = pushEntry(t, sec('7.52'));
    t = pushEntry(t, sec('13.1'));
    expect(t).toHaveLength(5);
    for (let i = 0; i < 5; i++) t = popEntry(t);
    expect(t).toEqual([]);
    expect(popEntry([])).toEqual([]);
  });
  it('replaceTop swaps the top entry (Previous/Next in the reader)', () => {
    expect(replaceTop([page('a'), sec('9.1')], sec('9.2'))).toEqual([page('a'), sec('9.2')]);
    expect(replaceTop([], sec('9.2'))).toEqual([sec('9.2')]);
  });
  it('replaceTop onto the entry below pops instead of duplicating it', () => {
    expect(replaceTop([sec('9.1'), sec('9.2')], sec('9.1'))).toEqual([sec('9.1')]);
  });
  it('currentPageId is the nearest page, even while a rulebook section is open on top', () => {
    expect(currentPageId([])).toBeUndefined();
    expect(currentPageId([page('a'), page('b')])).toBe('b');
    expect(currentPageId([page('a'), sec('9.1')])).toBe('a');
    expect(currentPageId([sec('9.1')])).toBeUndefined();
  });
  it('readingSection is the top entry only when it is a section', () => {
    expect(readingSection([page('a')])).toBeUndefined();
    expect(readingSection([page('a'), sec('9.1')])).toEqual(sec('9.1'));
    expect(readingSection([])).toBeUndefined();
  });
  it('backTextFor names where Back leads', () => {
    expect(backTextFor([], titleOf)).toBe('Home');
    expect(backTextFor([page('a')], titleOf)).toBe('Home');
    expect(backTextFor([page('a'), page('b')], titleOf)).toBe('Back to Title a');
    expect(backTextFor([page('a'), sec('9.1')], titleOf)).toBe('Back to Title a');
    expect(backTextFor([page('a'), sec('9.1'), sec('7.52')], titleOf)).toBe('Back to §9.1');
  });
});
