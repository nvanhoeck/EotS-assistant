import { describe, it, expect } from 'vitest';
import { SURRENDER_PW, politicalWillReminders, progressDetail, progressOfWar } from '../../src/helper/logic/politicalWill';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const reminder = (id: string) => politicalWillReminders.find((r) => r.id === id)!;

describe('surrender values (16.41)', () => {
  it('matches the rulebook', () => {
    const v = Object.fromEntries(SURRENDER_PW.map((s) => [s.id, s.value]));
    expect(v).toEqual({ australia: 2, burma: 1, china: 2, dei: 1, india: 2, malaya: 1, philippines: 1 });
  });
  it('marks the recapturable nations (the asterisked ones)', () => {
    expect(SURRENDER_PW.filter((s) => s.recapture).map((s) => s.id)).toEqual(['australia', 'burma', 'dei', 'malaya', 'philippines']);
  });
});

describe('progressOfWar (16.47)', () => {
  it('is inactive before turn 4 and when the turn is unknown', () => {
    expect(progressOfWar(ctx({ turn: 3, alliedAsps: 3 })).active).toBe(false);
    expect(progressOfWar(ctx({ alliedAsps: 3 })).active).toBe(false);
  });
  it('uses the smaller of 4 and the ASPs (rulebook example: 3 ASPs, net 2)', () => {
    expect(progressOfWar(ctx({ turn: 4, alliedAsps: 3, capturedNet: 2 }))).toEqual({
      active: true, target: 3, net: 2, remaining: 1, met: false,
    });
  });
  it('caps the target at 4', () => {
    expect(progressOfWar(ctx({ turn: 6, alliedAsps: 9, capturedNet: 5 }))).toEqual({
      active: true, target: 4, net: 5, remaining: 0, met: true,
    });
  });
  it('treats an unset net as zero and reports no target without ASPs', () => {
    expect(progressOfWar(ctx({ turn: 5, alliedAsps: 2 })).remaining).toBe(2);
    const p = progressOfWar(ctx({ turn: 5 }));
    expect(p.active).toBe(true);
    expect(p.target).toBeUndefined();
  });
  it('lets a negative net raise the number still needed', () => {
    expect(progressOfWar(ctx({ turn: 5, alliedAsps: 3, capturedNet: -1 })).remaining).toBe(4);
  });
  it('a target of zero ASPs is met', () => {
    expect(progressOfWar(ctx({ turn: 5, alliedAsps: 0 })).met).toBe(true);
  });
});

describe('progressDetail', () => {
  it('describes the countdown', () => {
    expect(progressDetail(ctx({ turn: 4, alliedAsps: 3, capturedNet: 2 }))).toBe('Target 3 · net 2 · 1 to go');
    expect(progressDetail(ctx({ turn: 4, alliedAsps: 3, capturedNet: 3 }))).toBe('Target 3 · net 3 · target met');
  });
  it('asks for the ASPs, explains the start turn, and stays quiet without a turn', () => {
    expect(progressDetail(ctx({ turn: 5 }))).toMatch(/Enter your Allied ASPs/);
    expect(progressDetail(ctx({ turn: 2 }))).toBe('Starts on turn 4; it is turn 2.');
    expect(progressDetail(ctx())).toBeUndefined();
  });
});

describe('pw-resource (16.43 A)', () => {
  const s = (p: Partial<GameContext>) => reminder('pw-resource').status(ctx(p));
  it('applies on turns 5 to 12 inclusive with 3 or fewer resource hexes', () => {
    expect(s({ turn: 5, japanResourceHexes: 3 })).toBe('applies');
    expect(s({ turn: 12, japanResourceHexes: 0 })).toBe('applies');
  });
  it('is not now outside turns 5-12', () => {
    expect(s({ turn: 4, japanResourceHexes: 3 })).toBe('notNow');
    expect(s({ turn: 13, japanResourceHexes: 3 })).toBe('notNow');
  });
  it('is not now with 4 or more resource hexes, or once scored', () => {
    expect(s({ turn: 6, japanResourceHexes: 4 })).toBe('notNow');
    expect(s({ japanResourceHexes: 5 })).toBe('notNow');
    expect(s({ turn: 6, japanResourceHexes: 2, used: ['resourcePwScored'] })).toBe('notNow');
  });
  it('is unknown while the turn or the hex count is missing', () => {
    expect(s({})).toBe('unknown');
    expect(s({ turn: 6 })).toBe('unknown');
    expect(s({ japanResourceHexes: 2 })).toBe('unknown');
  });
  it('explains itself', () => {
    const d = (p: Partial<GameContext>) => reminder('pw-resource').detail!(ctx(p));
    expect(d({ turn: 4 })).toMatch(/turns 5–12; it is turn 4/);
    expect(d({ turn: 6, japanResourceHexes: 4 })).toMatch(/4 resource hexes; it needs 3 or fewer/);
    expect(d({ used: ['resourcePwScored'] })).toBe('Already scored this game.');
    expect(d({ turn: 6, japanResourceHexes: 2 })).toMatch(/raise US Political Will by 3/);
  });
});

describe('pw-progress', () => {
  const s = (p: Partial<GameContext>) => reminder('pw-progress').status(ctx(p));
  it('applies from turn 4', () => {
    expect(s({ turn: 3 })).toBe('notNow');
    expect(s({ turn: 4 })).toBe('applies');
    expect(s({})).toBe('unknown');
  });
  it('shows the countdown as its detail', () => {
    expect(reminder('pw-progress').detail!(ctx({ turn: 4, alliedAsps: 3, capturedNet: 2 }))).toBe('Target 3 · net 2 · 1 to go');
  });
});

describe('pw-bombing (16.43 B)', () => {
  const s = (p: Partial<GameContext>) => reminder('pw-bombing').status(ctx(p));
  it('cannot happen before the first B-29 group arrives on turn 9', () => {
    expect(s({ turn: 8 })).toBe('notNow');
    expect(s({ turn: 9 })).toBe('unknown');
    expect(s({})).toBe('unknown');
  });
});

describe('once-per-game occupation reminders (16.42)', () => {
  it('are greyed once scored and otherwise need a human check', () => {
    expect(reminder('pw-alaska').status(ctx({ used: ['alaskaScored'] }))).toBe('notNow');
    expect(reminder('pw-alaska').status(ctx({ used: ['hawaiiScored'] }))).toBe('unknown');
    expect(reminder('pw-hawaii').status(ctx({ used: ['hawaiiScored'] }))).toBe('notNow');
    expect(reminder('pw-hawaii').status(ctx())).toBe('unknown');
  });
});

describe('every reminder', () => {
  it('has text, a condition in words and a citation', () => {
    for (const r of politicalWillReminders) {
      expect(r.text.length).toBeGreaterThan(10);
      expect(r.condition.length).toBeGreaterThan(5);
      expect(r.cite.length).toBeGreaterThan(0);
    }
  });
});
