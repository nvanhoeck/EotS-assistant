import { describe, it, expect } from 'vitest';
import { splitPages, cleanPage } from '../src/ingest/extract.js';

describe('splitPages', () => {
  it('splits on form feed and drops the trailing empty page', () => {
    expect(splitPages('a\fb\f')).toEqual(['a', 'b']);
  });
  it('keeps a non-empty last page', () => {
    expect(splitPages('a\fb')).toEqual(['a', 'b']);
  });
});

describe('cleanPage', () => {
  it('removes running header/footer lines and blank lines', () => {
    const raw =
      'Empire of the Sun (v2.0)\n� 2007 GMT Games, LLC\n\n4.4 Deal Strategy Cards Segment\nBody text.\nJapanese U.S. � 2007 GMT Games, LLC\n';
    expect(cleanPage(raw)).toBe('4.4 Deal Strategy Cards Segment\nBody text.');
  });
});
