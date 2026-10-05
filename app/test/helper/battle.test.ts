import { describe, it, expect } from 'vitest';
import {
  afterAirNaval, airNavalWinner, battleReminders, effectivenessRating, groundWinner, halveRoundUp, resolveCombat,
} from '../../src/helper/logic/battle';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const text = (steps: { text: string }[]) => steps.map((s) => s.text).join(' | ');

describe('combat effectiveness rating (8.2 B, 8.4 A)', () => {
  it('air-naval: 0-2 = 1/4, 3-5 = 1/2, 6-8 = 1, 9 or more = 1', () => {
    expect([0, 1, 2].map((r) => effectivenessRating('airNaval', r))).toEqual([0.25, 0.25, 0.25]);
    expect([3, 4, 5].map((r) => effectivenessRating('airNaval', r))).toEqual([0.5, 0.5, 0.5]);
    expect([6, 7, 8].map((r) => effectivenessRating('airNaval', r))).toEqual([1, 1, 1]);
    expect([9, 10, 14].map((r) => effectivenessRating('airNaval', r))).toEqual([1, 1, 1]);
  });
  it('air-naval: a negative modified roll still counts as 1/4', () => {
    expect(effectivenessRating('airNaval', -2)).toBe(0.25);
  });
  it('ground: less than 0 to 2 = 1/2, 3-6 = 1, 7-8 = 1.5, 9 or more = 2', () => {
    expect([-3, 0, 1, 2].map((r) => effectivenessRating('ground', r))).toEqual([0.5, 0.5, 0.5, 0.5]);
    expect([3, 4, 5, 6].map((r) => effectivenessRating('ground', r))).toEqual([1, 1, 1, 1]);
    expect([7, 8].map((r) => effectivenessRating('ground', r))).toEqual([1.5, 1.5]);
    expect([9, 12].map((r) => effectivenessRating('ground', r))).toEqual([2, 2]);
  });
});

describe('resolveCombat', () => {
  it('reproduces the rulebook example: strength 47 gives 12, 24 or 47 hits', () => {
    expect(resolveCombat({ kind: 'airNaval', strength: 47, roll: 2, modifier: 0 }).hits).toBe(12);
    expect(resolveCombat({ kind: 'airNaval', strength: 47, roll: 4, modifier: 0 }).hits).toBe(24);
    expect(resolveCombat({ kind: 'airNaval', strength: 47, roll: 6, modifier: 0 }).hits).toBe(47);
    expect(resolveCombat({ kind: 'airNaval', strength: 47, roll: 8, modifier: 0 }).hits).toBe(47);
  });
  it('rounds hits up', () => {
    expect(resolveCombat({ kind: 'ground', strength: 5, roll: 0, modifier: 0 }).hits).toBe(3);
    expect(resolveCombat({ kind: 'ground', strength: 7, roll: 7, modifier: 0 }).hits).toBe(11);
    expect(resolveCombat({ kind: 'ground', strength: 10, roll: 7, modifier: 0 }).hits).toBe(15);
    expect(resolveCombat({ kind: 'ground', strength: 9, roll: 9, modifier: 0 }).hits).toBe(18);
  });
  it('applies the modifier before reading the table', () => {
    const r = resolveCombat({ kind: 'ground', strength: 10, roll: 5, modifier: -3 });
    expect(r.modifiedRoll).toBe(2);
    expect(r.rating).toBe(0.5);
    expect(r.hits).toBe(5);
    expect(resolveCombat({ kind: 'airNaval', strength: 20, roll: 4, modifier: 3 }).rating).toBe(1);
  });
  it('a critical hit is an unmodified 9 in air-naval combat, whatever the modifier', () => {
    expect(resolveCombat({ kind: 'airNaval', strength: 10, roll: 9, modifier: -4 }).critical).toBe(true);
    expect(resolveCombat({ kind: 'airNaval', strength: 10, roll: 8, modifier: 3 }).critical).toBe(false);
    expect(resolveCombat({ kind: 'ground', strength: 10, roll: 9, modifier: 0 }).critical).toBe(false);
  });
  it('zero strength gives zero hits', () => {
    expect(resolveCombat({ kind: 'airNaval', strength: 0, roll: 9, modifier: 0 }).hits).toBe(0);
  });
  it('rejects a die roll outside 0-9 and a negative or fractional strength', () => {
    expect(() => resolveCombat({ kind: 'ground', strength: 5, roll: 10, modifier: 0 })).toThrow(RangeError);
    expect(() => resolveCombat({ kind: 'ground', strength: 5, roll: -1, modifier: 0 })).toThrow(RangeError);
    expect(() => resolveCombat({ kind: 'ground', strength: -1, roll: 3, modifier: 0 })).toThrow(RangeError);
    expect(() => resolveCombat({ kind: 'ground', strength: 2.5, roll: 3, modifier: 0 })).toThrow(RangeError);
  });
  it('halving for extended range rounds up (rulebook: 10 at extended range counts 5)', () => {
    expect(halveRoundUp(10)).toBe(5);
    expect(halveRoundUp(5)).toBe(3);
    expect(halveRoundUp(0)).toBe(0);
  });
});

describe('who wins the air-naval combat (8.3)', () => {
  const base = { anySurvivors: true, offStrength: 10, reaStrength: 8, reaHasAirOrCarrier: false, offHasSurvivingAirOrCarrier: true };
  it('the higher surviving total wins', () => {
    expect(airNavalWinner(base).winner).toBe('offensives');
    expect(airNavalWinner({ ...base, offStrength: 5 }).winner).toBe('reaction');
  });
  it('a tie goes to the Reaction player', () => {
    const r = airNavalWinner({ ...base, offStrength: 8 });
    expect(r.winner).toBe('reaction');
    expect(r.reason.text).toMatch(/tie/i);
  });
  it('the Reaction player wins automatically if it has air or carrier units and the Offensives player has none left', () => {
    const r = airNavalWinner({ ...base, offStrength: 99, reaHasAirOrCarrier: true, offHasSurvivingAirOrCarrier: false });
    expect(r.winner).toBe('reaction');
    expect(r.reason.text).toMatch(/regardless of the attack strengths/);
  });
  it('no surviving air or naval units is an Offensives player victory', () => {
    const r = airNavalWinner({ ...base, anySurvivors: false, offStrength: 0, reaStrength: 0 });
    expect(r.winner).toBe('offensives');
    expect(r.reason.cite).toContain('8.31');
  });
});

describe('what follows the air-naval combat (8.32-8.34)', () => {
  it('Reaction victory ends the battle, unless Offensive ground units came in by land movement', () => {
    expect(text(afterAirNaval('reaction', { landMovedGround: false, groundRemains: true }))).toMatch(/battle is concluded/);
    expect(text(afterAirNaval('reaction', { landMovedGround: true, groundRemains: true }))).toMatch(/immediately conduct a ground battle/);
  });
  it('Offensives victory goes to ground combat if ground units face each other, otherwise the hex is won', () => {
    expect(text(afterAirNaval('offensives', { landMovedGround: false, groundRemains: true }))).toMatch(/ground combat/);
    expect(text(afterAirNaval('offensives', { landMovedGround: false, groundRemains: false }))).toMatch(/gains control of the hex/);
  });
  it('mentions the amphibious assault rule when the Offensives player lost', () => {
    expect(text(afterAirNaval('reaction', { landMovedGround: false, groundRemains: true }))).toMatch(/amphibious assault/i);
  });
});

describe('who wins the ground combat (8.4 C)', () => {
  it('the only side left with ground units wins and controls the hex', () => {
    const a = groundWinner({ offSurvives: true, reaSurvives: false, offStepsLost: 3, reaStepsLost: 1 });
    expect(a.winner).toBe('offensives');
    expect(a.retreating).toBeUndefined();
    const b = groundWinner({ offSurvives: false, reaSurvives: true, offStepsLost: 1, reaStepsLost: 3 });
    expect(b.winner).toBe('reaction');
    expect(b.retreating).toBeUndefined();
  });
  it('with both sides left, the side that lost more steps retreats', () => {
    const a = groundWinner({ offSurvives: true, reaSurvives: true, offStepsLost: 2, reaStepsLost: 3 });
    expect(a).toMatchObject({ winner: 'offensives', retreating: 'reaction' });
    const b = groundWinner({ offSurvives: true, reaSurvives: true, offStepsLost: 3, reaStepsLost: 2 });
    expect(b).toMatchObject({ winner: 'reaction', retreating: 'offensives' });
  });
  it('a tie in step losses goes to the Reaction player', () => {
    const r = groundWinner({ offSurvives: true, reaSurvives: true, offStepsLost: 2, reaStepsLost: 2 });
    expect(r).toMatchObject({ winner: 'reaction', retreating: 'offensives' });
    expect(text(r.steps)).toMatch(/tie/i);
  });
  it('if both are wiped out the Reaction player keeps control', () => {
    const r = groundWinner({ offSurvives: false, reaSurvives: false, offStepsLost: 4, reaStepsLost: 4 });
    expect(r.winner).toBe('reaction');
    expect(r.retreating).toBeUndefined();
    expect(text(r.steps)).toMatch(/Reaction player maintains control/);
  });
  it('explains how each side retreats', () => {
    const off = groundWinner({ offSurvives: true, reaSurvives: true, offStepsLost: 3, reaStepsLost: 1 });
    expect(text(off.steps)).toMatch(/retreats into the hex from which it entered/);
    expect(text(off.steps)).toMatch(/amphibious assault/);
    const rea = groundWinner({ offSurvives: true, reaSurvives: true, offStepsLost: 1, reaStepsLost: 3 });
    expect(text(rea.steps)).toMatch(/moved by the Offensives player/);
  });
});

describe('reminders', () => {
  const r = (id: string) => battleReminders.find((x) => x.id === id)!;
  it('the Allied air-naval bonus follows the year', () => {
    expect(r('bat-year-mod').status(ctx({ turn: 4 }))).toBe('notNow');
    expect(r('bat-year-mod').status(ctx({ turn: 5 }))).toBe('applies');
    expect(r('bat-year-mod').status(ctx({ turn: 9 }))).toBe('applies');
    expect(r('bat-year-mod').status(ctx())).toBe('unknown');
    expect(r('bat-year-mod').detail!(ctx({ turn: 6 }))).toMatch(/\+1/);
    expect(r('bat-year-mod').detail!(ctx({ turn: 11 }))).toMatch(/\+3/);
    expect(r('bat-year-mod').detail!(ctx({ turn: 3 }))).toMatch(/1943/);
    expect(r('bat-year-mod').detail!(ctx())).toBeUndefined();
  });
  it('have text, a condition and a citation', () => {
    for (const x of battleReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
