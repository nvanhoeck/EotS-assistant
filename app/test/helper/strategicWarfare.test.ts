import { describe, it, expect } from 'vitest';
import {
  alliedDraw, japaneseBaseDraw, japaneseDraw, japanesePasses, strategicWarfareReminders,
} from '../../src/helper/logic/strategicWarfare';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });

describe('japaneseBaseDraw (11.11, 11.12)', () => {
  it('is 7 on turns 2-4 whatever the resource hexes', () => {
    expect(japaneseBaseDraw(2, undefined)).toBe(7);
    expect(japaneseBaseDraw(4, 1)).toBe(7);
  });
  it('is one card per two resource hexes, rounded up, from turn 5', () => {
    expect(japaneseBaseDraw(5, 5)).toBe(3);
    expect(japaneseBaseDraw(5, 13)).toBe(7);
    expect(japaneseBaseDraw(5, 14)).toBe(7);
    expect(japaneseBaseDraw(5, 0)).toBe(0);
    expect(japaneseBaseDraw(1, 6)).toBe(3);
  });
  it('cannot be worked out without the hexes outside turns 2-4', () => {
    expect(japaneseBaseDraw(5, undefined)).toBeUndefined();
    expect(japaneseBaseDraw(undefined, undefined)).toBeUndefined();
  });
  it('works from the hexes alone when the turn is unknown', () => {
    expect(japaneseBaseDraw(undefined, 8)).toBe(4);
  });
});

describe('japaneseDraw', () => {
  it('never goes below 4 (11.12, 11.4)', () => {
    expect(japaneseDraw(3, false, 0)).toBe(4);
    expect(japaneseDraw(7, true, 2)).toBe(4);
  });
  it('subtracts one for a submarine hit and one per bombing hit, at most two', () => {
    expect(japaneseDraw(7, true, 0)).toBe(6);
    expect(japaneseDraw(7, false, 3)).toBe(5);
    expect(japaneseDraw(6, false, 1)).toBe(5);
    expect(japaneseDraw(7, false, -1)).toBe(7);
  });
});

describe('japanesePasses (11.4)', () => {
  it('gives 2 passes for 5 or fewer cards, 1 for 6, none for 7', () => {
    expect([7, 6, 5, 4].map(japanesePasses)).toEqual([0, 1, 2, 2]);
  });
});

describe('alliedDraw (11.51, 11.52)', () => {
  it('cannot be worked out without the turn', () => {
    expect(alliedDraw(ctx())).toBeUndefined();
  });
  it('follows the opening schedule', () => {
    expect(alliedDraw(ctx({ turn: 1 }))).toMatchObject({ cards: 0, basePasses: 0 });
    expect(alliedDraw(ctx({ turn: 2 }))).toMatchObject({ cards: 5, basePasses: 2 });
    expect(alliedDraw(ctx({ turn: 3 }))).toMatchObject({ cards: 6, basePasses: 1 });
    expect(alliedDraw(ctx({ turn: 4 }))).toMatchObject({ cards: 7, basePasses: 0 });
  });
  it('loses a card per surrendered China, India, Australia and for W.I.E. level 4', () => {
    const d = alliedDraw(ctx({ turn: 5, surrendered: ['china', 'india'] }))!;
    expect(d.cards).toBe(5);
    expect(d.extraPasses).toBe(2);
    expect(d.conditions).toEqual(['China has surrendered', 'India has surrendered']);
  });
  it('never drops below 4 cards and gains at most two extra passes', () => {
    const d = alliedDraw(ctx({ turn: 6, surrendered: ['china', 'india', 'australia'], wieLevel: 4 }))!;
    expect(d.conditions).toHaveLength(4);
    expect(d.cards).toBe(4);
    expect(d.extraPasses).toBe(2);
  });
  it('ignores other nations and applies the floor to turn 2', () => {
    expect(alliedDraw(ctx({ turn: 5, surrendered: ['burma', 'malaya'] }))!.cards).toBe(7);
    expect(alliedDraw(ctx({ turn: 2, surrendered: ['china'] }))!.cards).toBe(4);
  });
  it('says when it had to assume the W.I.E. level', () => {
    expect(alliedDraw(ctx({ turn: 5 }))!.wieAssumed).toBe(true);
    expect(alliedDraw(ctx({ turn: 5, wieLevel: 1 }))!.wieAssumed).toBe(false);
  });
});

describe('sw-japan-draw reminder', () => {
  const r = strategicWarfareReminders.find((x) => x.id === 'sw-japan-draw')!;
  it('applies once the base draw can be worked out', () => {
    expect(r.status(ctx({ japanResourceHexes: 6 }))).toBe('applies');
    expect(r.status(ctx({ turn: 3 }))).toBe('applies');
  });
  it('is unknown otherwise', () => {
    expect(r.status(ctx())).toBe('unknown');
    expect(r.status(ctx({ turn: 7 }))).toBe('unknown');
  });
  it('shows the computed base draw', () => {
    expect(r.detail!(ctx({ turn: 7, japanResourceHexes: 9 }))).toBe('Base draw now: 5 cards (9 resource hexes).');
    expect(r.detail!(ctx({ turn: 3 }))).toBe('Base draw now: 7 cards (strategic reserves, turns 2–4).');
    expect(r.detail!(ctx())).toBeUndefined();
  });
});
