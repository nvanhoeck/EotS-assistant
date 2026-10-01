import { describe, it, expect } from 'vitest';
import { stripNoise } from '../src/ingest/noise.js';

describe('stripNoise', () => {
  it('removes end matter from the 20.0 line on and extracts errata', () => {
    const pages = [
      'cover',
      '4.0 Rules\nkeep me',
      '20.0 Designer’s Notes\nessay text\nAllen, Louis',
      'Index\nPRINTING NOTE: corner triangle. CARD ERRATA: card 27 no effect.\nGAME DESIGNER x',
    ];
    const r = stripNoise(pages);
    expect(r.pages).toHaveLength(4);
    expect(r.pages[1]).toContain('keep me');
    expect(r.pages[2]).toBe('');
    expect(r.pages[3]).toBe('');
    expect(r.errata).toEqual([
      { page: 4, text: 'PRINTING NOTE: corner triangle. CARD ERRATA: card 27 no effect.' },
    ]);
    expect(r.stats.endMatterLines).toBe(6);
  });

  it('keeps the part of the page before 20.0', () => {
    const r = stripNoise(['c', 'before\n20.0 Designer’s Notes\ngone']);
    expect(r.pages[1]).toBe('before');
  });

  it('removes nothing when there is no 20.0 line', () => {
    const pages = ['c', 'a\nb', 'Index'];
    const r = stripNoise(pages);
    expect(r.pages).toEqual(pages);
    expect(r.errata).toEqual([]);
    expect(r.stats.endMatterLines).toBe(0);
  });

  it('removes DESIGN NOTE lines, continuations and the follow-up paragraph', () => {
    const r = stripNoise([
      'c',
      [
        '4.1 Rule',
        'DESIGN NOTE: blah blah',
        'continues here in lowercase',
        'The system will recreate the outcomes from the campaigns more.',
        'Example: ordinary text',
        'DESIGN NOTE: another',
        'Example of play: kept',
        'Next.',
      ].join('\n'),
    ]);
    expect(r.pages[1].split('\n')).toEqual([
      '4.1 Rule',
      'Example: ordinary text',
      'Example of play: kept',
      'Next.',
    ]);
    expect(r.stats.designNoteLines).toBe(4);
  });

  it('drops the four commentary sidenotes but keeps other notes', () => {
    const r = stripNoise([
      'c',
      [
        'PLAY NOTE: This is an important concept in the game',
        'PLAY NOTE: There are only a handful of x',
        'HISTORICAL NOTE: history',
        'PLAY NOTE: Surrender markers have been supplied for y',
        'PLAY NOTE: Moving air first',
        'PLAYER NOTE: keep this',
      ].join('\n'),
    ]);
    expect(r.pages[1]).toBe('PLAY NOTE: Moving air first\nPLAYER NOTE: keep this');
    expect(r.stats.sidenoteLines).toBe(4);
  });
});
