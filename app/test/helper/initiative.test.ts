import { describe, it, expect } from 'vitest';
import { gameYear, initiative, initiativeReminders, tieBreaker } from '../../src/helper/logic/initiative';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const text = (r: ReturnType<typeof initiative>) => [...r.steps, ...(r.futureOffensive ? [r.futureOffensive] : [])].map((s) => s.text).join(' | ');

describe('gameYear / tieBreaker (4.21, scenario turn ranges)', () => {
  it('maps turns to years: 1 = 1941, 2-4 = 1942, 5-7 = 1943, 8-10 = 1944, 11-12 = 1945', () => {
    expect([1, 2, 4, 5, 7, 8, 10, 11, 12].map(gameYear)).toEqual([1941, 1942, 1942, 1943, 1943, 1944, 1944, 1945, 1945]);
  });
  it('Japan wins ties in 1941-1942 (turns 1-4), the Allies in 1943-1945 (turns 5-12)', () => {
    expect([1, 2, 4].map(tieBreaker)).toEqual(['japan', 'japan', 'japan']);
    expect([5, 8, 12].map(tieBreaker)).toEqual(['allies', 'allies', 'allies']);
    expect(tieBreaker(undefined)).toBeUndefined();
  });
});

describe('initiative', () => {
  it('the player with the most cards goes first', () => {
    const r = initiative({ japanCards: 6, alliedCards: 5 });
    expect(r.first).toBe('japan');
    expect(r.tied).toBe(false);
    expect(initiative({ japanCards: 4, alliedCards: 7 }).first).toBe('allies');
  });
  it('the player with fewer cards can take it with a Future Offensives card played as an EC', () => {
    const r = initiative({ japanCards: 6, alliedCards: 5 });
    expect(r.overridableBy).toBe('allies');
    expect(text(r)).toMatch(/Future Offensives card as an EC/);
    expect(text(r)).toMatch(/Allied player/);
  });
  it('says so plainly when the player with fewer cards holds one', () => {
    const r = initiative({ japanCards: 6, alliedCards: 5, fewerHasFutureOffensive: true });
    expect(r.first).toBe('japan');
    expect(text(r)).toMatch(/You said they hold one/);
  });
  it('a tie goes to Japan in 1942 and to the Allies in 1943', () => {
    expect(initiative({ japanCards: 5, alliedCards: 5, turn: 3 })).toMatchObject({ first: 'japan', tied: true });
    expect(initiative({ japanCards: 5, alliedCards: 5, turn: 6 })).toMatchObject({ first: 'allies', tied: true });
    expect(text(initiative({ japanCards: 5, alliedCards: 5, turn: 6 }))).toMatch(/1943/);
  });
  it('a tie without a known turn gives the rule and no answer', () => {
    const r = initiative({ japanCards: 5, alliedCards: 5 });
    expect(r.first).toBeUndefined();
    expect(r.tied).toBe(true);
    expect(text(r)).toMatch(/turns 1–4/);
    expect(r.overridableBy).toBeUndefined();
  });
  it('reminds you not to count a designated Future Offensives card', () => {
    expect(text(initiative({ japanCards: 5, alliedCards: 6 }))).toMatch(/not count/);
  });
});

describe('reminders', () => {
  const r = (id: string) => initiativeReminders.find((x) => x.id === id)!;
  it('tie-break applies once the turn is known', () => {
    expect(r('init-tiebreak').status(ctx())).toBe('unknown');
    expect(r('init-tiebreak').status(ctx({ turn: 2 }))).toBe('applies');
    expect(r('init-tiebreak').detail!(ctx({ turn: 2 }))).toBe('Turn 2 (1942): on a tie the Japanese player goes first.');
    expect(r('init-tiebreak').detail!(ctx({ turn: 9 }))).toBe('Turn 9 (1944): on a tie the Allied player goes first.');
    expect(r('init-tiebreak').detail!(ctx())).toBeUndefined();
  });
  it('the Future Offensives reminder is a board check', () => {
    expect(r('init-future').status(ctx({ turn: 3 }))).toBe('unknown');
  });
  it('every reminder has text, a condition and a citation', () => {
    for (const x of initiativeReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
