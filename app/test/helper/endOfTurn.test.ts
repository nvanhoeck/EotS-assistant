import { describe, it, expect } from 'vitest';
import {
  answerEnd, checkEndOfTurn, endOfTurnReminders, endQuestionFor, goBackEnd, nextEndQuestion, type EndAnswers,
} from '../../src/helper/logic/endOfTurn';
import type { GameContext } from '../../src/helper/types';
import { allEndPaths } from './paths';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const text = (r: ReturnType<typeof checkEndOfTurn>) => [r.headline, ...r.steps.map((s) => s.text)].join(' | ');

describe('question flow', () => {
  it('asks Japan’s surrender, then the Negotiations box, then whether it is the last turn', () => {
    let a: EndAnswers = {};
    expect(nextEndQuestion(a, ctx())!.key).toBe('japanSurrendered');
    a = answerEnd(a, 'japanSurrendered', 'no');
    expect(nextEndQuestion(a, ctx())!.key).toBe('pwZero');
    a = answerEnd(a, 'pwZero', 'no');
    expect(nextEndQuestion(a, ctx())!.key).toBe('lastTurn');
    expect(nextEndQuestion(answerEnd(a, 'lastTurn', 'no'), ctx())).toBeUndefined();
  });
  it('a surrender or an empty Negotiations box ends the questions', () => {
    expect(nextEndQuestion({ japanSurrendered: 'yes' }, ctx())).toBeUndefined();
    expect(nextEndQuestion({ japanSurrendered: 'no', pwZero: 'yes' }, ctx())).toBeUndefined();
  });
  it('changing an earlier answer clears later ones; goBack removes the last', () => {
    expect(answerEnd({ japanSurrendered: 'no', pwZero: 'no', lastTurn: 'no' }, 'japanSurrendered', 'yes')).toEqual({ japanSurrendered: 'yes' });
    expect(goBackEnd({ japanSurrendered: 'no', pwZero: 'no' })).toEqual({ japanSurrendered: 'no' });
  });
  it('the last-turn question uses the game status for its hint', () => {
    expect(endQuestionFor('lastTurn', ctx({ turn: 12 })).hint).toMatch(/turn 12 is the last turn of the full Campaign/);
    expect(endQuestionFor('lastTurn', ctx({ turn: 7 })).hint).toMatch(/1943 scenario/);
    expect(endQuestionFor('lastTurn', ctx({ turn: 5 })).hint).toMatch(/Campaign: turn 12/);
    expect(endQuestionFor('lastTurn', ctx()).hint).toMatch(/Campaign: turn 12/);
  });
});

describe('outcomes (4.5, 16.1-16.3)', () => {
  const run = (a: EndAnswers) => checkEndOfTurn(a);
  it('Japan surrendering ends the game: the Allies win', () => {
    const r = run({ japanSurrendered: 'yes' });
    expect(r.outcome).toBe('alliesWin');
    expect(r.steps[0].cite).toContain('16.1');
  });
  it('US Political Will in the Negotiations box ends the game: Japan wins', () => {
    expect(run({ japanSurrendered: 'no', pwZero: 'yes' }).outcome).toBe('japanWins');
  });
  it('the last turn: the winner comes from the victory conditions', () => {
    const r = run({ japanSurrendered: 'no', pwZero: 'no', lastTurn: 'yes' });
    expect(r.outcome).toBe('scoreGame');
    expect(text(r)).toMatch(/four consecutive turns/);
    expect(text(r)).toMatch(/1 or zero resource hexes/);
    expect(text(r)).toMatch(/B-29 is in range of Tokyo/);
    expect(text(r)).toMatch(/victory points/);
  });
  it('otherwise the game goes on: advance the marker and tidy up', () => {
    const r = run({ japanSurrendered: 'no', pwZero: 'no', lastTurn: 'no' });
    expect(r.outcome).toBe('continue');
    expect(text(r)).toMatch(/Advance the game turn marker/);
    expect(text(r)).toMatch(/Tokyo Express/);
    expect(text(r)).toMatch(/China Offensive/);
    expect(text(r)).toMatch(/Amphibious Shipping Point/);
  });
  it('unsure answers give "depends"', () => {
    expect(run({ japanSurrendered: 'no', pwZero: 'unsure', lastTurn: 'no' }).outcome).toBe('depends');
    expect(run({ japanSurrendered: 'no', pwZero: 'no', lastTurn: 'unsure' }).outcome).toBe('depends');
  });
  it('rejects incomplete answers', () => {
    expect(() => run({})).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  it('reaches a well-formed result', () => {
    const paths = allEndPaths(ctx());
    expect(paths.length).toBeGreaterThan(5);
    for (const a of paths) {
      const r = checkEndOfTurn(a);
      expect(['alliesWin', 'japanWins', 'scoreGame', 'continue', 'depends']).toContain(r.outcome);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('reminders', () => {
  const r = (id: string) => endOfTurnReminders.find((x) => x.id === id)!;
  it('last turn: applies on turn 12, explained on the yearly scenarios’ last turns', () => {
    expect(r('eot-last-turn').status(ctx({ turn: 12 }))).toBe('applies');
    expect(r('eot-last-turn').status(ctx({ turn: 6 }))).toBe('unknown');
    expect(r('eot-last-turn').status(ctx())).toBe('unknown');
    expect(r('eot-last-turn').detail!(ctx({ turn: 12 }))).toMatch(/last turn of the full Campaign/);
    expect(r('eot-last-turn').detail!(ctx({ turn: 7 }))).toMatch(/1943 scenario/);
    expect(r('eot-last-turn').detail!(ctx({ turn: 6 }))).toBeUndefined();
  });
  it('the other reminders are board checks, with text, condition and citation', () => {
    for (const x of endOfTurnReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
    expect(r('eot-negotiations').status(ctx({ turn: 3 }))).toBe('unknown');
    expect(r('eot-markers').status(ctx({ turn: 3 }))).toBe('unknown');
  });
});
