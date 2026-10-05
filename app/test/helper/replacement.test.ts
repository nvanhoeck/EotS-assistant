import { describe, it, expect } from 'vitest';
import {
  answerReplacement, checkReplacement, goBackReplacement, nextReplacementQuestion, replacementQuestionFor,
  replacementReminders, type ReplacementAnswers,
} from '../../src/helper/logic/replacement';
import type { GameContext } from '../../src/helper/types';
import { allReplacementPaths } from './paths';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const run = (a: ReplacementAnswers, c: GameContext = ctx()) => checkReplacement(a, c);
const text = (steps: { text: string }[]) => steps.map((s) => s.text).join(' | ');
const all = (r: ReturnType<typeof run>) => text([...r.availability, ...r.cost, ...r.where, ...r.notes]) + ' | ' + r.headline;

describe('question flow', () => {
  it('asks side, unit, where it is, then the dot', () => {
    let a: ReplacementAnswers = {};
    const keys: string[] = [];
    for (const [k, v] of [['side', 'japanese'], ['unitClass', 'ground'], ['state', 'reduced']] as const) {
      keys.push(nextReplacementQuestion(a, ctx())!.key);
      a = answerReplacement(a, k, v);
    }
    expect(keys).toEqual(['side', 'unitClass', 'state']);
    expect(nextReplacementQuestion(a, ctx())!.key).toBe('dotted');
  });
  it('ends after a Japanese unit has answered the dot question', () => {
    expect(nextReplacementQuestion({ side: 'japanese', unitClass: 'naval', state: 'eliminated', dotted: 'no' }, ctx())).toBeUndefined();
  });
  it('asks Allied units for nationality and nothing more', () => {
    const base: ReplacementAnswers = { side: 'allied', unitClass: 'ground', state: 'eliminated', dotted: 'no' };
    expect(nextReplacementQuestion(base, ctx())!.key).toBe('nationality');
    expect(nextReplacementQuestion({ ...base, nationality: 'us' }, ctx())).toBeUndefined();
    expect(nextReplacementQuestion({ ...base, nationality: 'unsure' }, ctx())).toBeUndefined();
    expect(nextReplacementQuestion({ ...base, nationality: 'chinese' }, ctx())).toBeUndefined();
    expect(nextReplacementQuestion({ ...base, nationality: 'dutch' }, ctx())).toBeUndefined();
    expect(nextReplacementQuestion({ ...base, state: 'reduced', nationality: 'us' }, ctx())).toBeUndefined();
    expect(nextReplacementQuestion({ ...base, unitClass: 'air', nationality: 'us' }, ctx())).toBeUndefined();
  });
  it('stops asking once the unit is known to have a dot', () => {
    expect(nextReplacementQuestion({ side: 'allied', unitClass: 'ground', state: 'reduced', dotted: 'yes' }, ctx())).toBeUndefined();
  });
  it('changing an earlier answer clears the later ones; goBack removes the last', () => {
    expect(answerReplacement({ side: 'allied', unitClass: 'ground', state: 'reduced', dotted: 'no', nationality: 'us' }, 'side', 'japanese')).toEqual({ side: 'japanese' });
    expect(goBackReplacement({ side: 'allied', unitClass: 'air' })).toEqual({ side: 'allied' });
    expect(goBackReplacement({})).toEqual({});
  });
  it('every question except side, unit and place offers "Not sure"', () => {
    for (const key of ['dotted', 'nationality'] as const) {
      expect(replacementQuestionFor(key, {}, ctx()).options.some((o) => o.value === 'unsure')).toBe(true);
    }
  });
});

describe('units that cannot receive replacements', () => {
  it('a single dot (11.1) rules everything out', () => {
    const r = run({ side: 'allied', unitClass: 'ground', state: 'eliminated', dotted: 'yes' });
    expect(r.verdict).toBe('no');
    expect(r.headline).toMatch(/cannot receive replacements/);
    expect(r.notes[0].cite).toContain('11.1');
  });
  it('Dutch units never do (11.35)', () => {
    const r = run({ side: 'allied', unitClass: 'naval', state: 'eliminated', dotted: 'no', nationality: 'dutch' });
    expect(r.verdict).toBe('no');
    expect(all(r)).toMatch(/Dutch/);
  });
  it('Japan has no scheduled air replacements (11.22)', () => {
    const r = run({ side: 'japanese', unitClass: 'air', state: 'reduced', dotted: 'no' });
    expect(r.verdict).toBe('no');
    expect(r.headline).toMatch(/event cards/);
  });
});

describe('Allied replacements (11.31-11.33)', () => {
  const us = (extra: Partial<ReplacementAnswers>): ReplacementAnswers => ({ side: 'allied', dotted: 'no', nationality: 'us', ...extra });
  it('a reduced ground unit flips to full for 1 replacement if supplied and out of enemy ZOI', () => {
    const r = run(us({ unitClass: 'ground', state: 'reduced' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.cost)).toMatch(/1 replacement flips/);
    expect(text(r.where)).toMatch(/in supply and not in an un-neutralized enemy ZOI/);
    expect(text(r.availability)).toMatch(/2 ground replacements per game turn, starting with turn 2/);
  });
  it('there are no Allied ground replacements on turn 1', () => {
    expect(run(us({ unitClass: 'ground', state: 'reduced' }), ctx({ turn: 1 })).verdict).toBe('no');
    expect(run(us({ unitClass: 'ground', state: 'reduced' }), ctx({ turn: 2 })).verdict).toBe('yes');
  });
  it('an eliminated ground unit returns for 1 (reduced) or 2 (full), placed like a reinforcement', () => {
    const r = run(us({ unitClass: 'ground', state: 'eliminated' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.cost)).toMatch(/2 replacements/);
    expect(text(r.where)).toMatch(/like a reinforcement/);
    expect(text(r.where)).toMatch(/port/);
    expect(r.links).toContain('reinforcements');
    expect(r.mapChecks.join(' ')).toMatch(/Activation Range/);
  });
  it('air: 5 per turn, 1 to flip or return reduced, 2 for full; returns to an airfield', () => {
    const r = run(us({ unitClass: 'air', state: 'eliminated' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.availability)).toMatch(/5 air replacements/);
    expect(text(r.cost)).toMatch(/2 replacements/);
    expect(text(r.where)).toMatch(/airfield/);
  });
  it('US naval needs Oahu and is not given on turn 1', () => {
    const a = us({ unitClass: 'naval', state: 'reduced' });
    expect(run(a, ctx({ turn: 1 })).verdict).toBe('no');
    expect(run(a, ctx({ turn: 2 })).verdict).toBe('yes');
    expect(run(a).verdict).toBe('yes');
    expect(run(a).mapChecks.join(' ')).toMatch(/Oahu/);
  });
  it('Commonwealth naval only on turns 6, 9 and 12', () => {
    const a: ReplacementAnswers = { side: 'allied', unitClass: 'naval', state: 'reduced', dotted: 'no', nationality: 'commonwealth' };
    expect(run(a, ctx({ turn: 5 })).verdict).toBe('no');
    expect(run(a, ctx({ turn: 5 })).headline).toMatch(/turns 6, 9 and 12/);
    for (const turn of [6, 9, 12]) expect(run(a, ctx({ turn })).verdict).toBe('yes');
    expect(run(a, ctx({ turn: 6 })).mapChecks.join(' ')).toMatch(/Colombo/);
  });
  it('unsure nationality for a naval unit: only ruled out when neither side gets one', () => {
    const a: ReplacementAnswers = { side: 'allied', unitClass: 'naval', state: 'reduced', dotted: 'no', nationality: 'unsure' };
    expect(run(a, ctx({ turn: 1 })).verdict).toBe('no');
    expect(run(a, ctx({ turn: 5 })).verdict).toBe('depends');
    expect(run(a, ctx({ turn: 6 })).verdict).toBe('depends');
    expect(text(run(a).availability)).toMatch(/Commonwealth naval/);
    expect(text(run(a).availability)).toMatch(/US naval/);
  });
});

describe('Chinese replacements (11.34)', () => {
  const chinese = (extra: Partial<ReplacementAnswers> = {}): ReplacementAnswers => ({
    side: 'allied', unitClass: 'ground', state: 'reduced', dotted: 'no', nationality: 'chinese', ...extra,
  });
  it('one per odd-numbered turn while China has not surrendered', () => {
    expect(run(chinese(), ctx({ turn: 3 })).verdict).toBe('yes');
    expect(run(chinese(), ctx({ turn: 4 })).verdict).toBe('no');
    expect(run(chinese(), ctx({ turn: 4 })).headline).toMatch(/odd/);
    expect(run(chinese(), ctx({ turn: 3, surrendered: ['china'] })).verdict).toBe('no');
    expect(run(chinese()).verdict).toBe('yes');
  });
  it('an eliminated army comes back reduced, in Kunming (2407), which must be a supply source', () => {
    const r = run(chinese({ state: 'eliminated' }), ctx({ turn: 3 }));
    expect(text(r.cost)).toMatch(/reduced strength/);
    expect(text(r.where)).toMatch(/Kunming \(2407\)/);
    expect(r.mapChecks.join(' ')).toMatch(/supply source/);
  });
  it('is not affected by the unit-class answer, and other replacements cannot be used for it', () => {
    const r = run(chinese({ unitClass: 'air' }), ctx({ turn: 3 }));
    expect(r.verdict).toBe('yes');
    expect(text(r.notes)).toMatch(/Other replacements may not be used/);
  });
});

describe('Japanese replacements (11.21, 11.23)', () => {
  const jp = (extra: Partial<ReplacementAnswers>): ReplacementAnswers => ({ side: 'japanese', dotted: 'no', ...extra });
  it('ground: divisions from China, 1 to flip, 1 to return reduced, 2 to return full, at most 2 in all', () => {
    const reduced = run(jp({ unitClass: 'ground', state: 'reduced' }));
    expect(reduced.verdict).toBe('yes');
    expect(text(reduced.cost)).toMatch(/1 division/);
    const eliminated = run(jp({ unitClass: 'ground', state: 'eliminated' }));
    expect(text(eliminated.cost)).toMatch(/2 divisions/);
    expect(text(eliminated.cost)).toMatch(/At most 2 divisions/);
    expect(text(eliminated.where)).toMatch(/any Japanese HQ/);
  });
  it('naval: carry over; 1 step returns an eliminated unit reduced, 2 full (11.0)', () => {
    const reduced = run(jp({ unitClass: 'naval', state: 'reduced' }));
    expect(reduced.verdict).toBe('yes');
    expect(text(reduced.notes)).toMatch(/carried over/);
    const eliminated = run(jp({ unitClass: 'naval', state: 'eliminated' }));
    expect(text(eliminated.cost)).toMatch(/1 step returns it at reduced strength, 2 steps at full/);
  });
});

describe('uncertain answers', () => {
  it('a "Not sure" about the dot makes an otherwise fine answer "depends"', () => {
    const r = run({ side: 'allied', unitClass: 'air', state: 'reduced', dotted: 'unsure', nationality: 'us' });
    expect(r.verdict).toBe('depends');
    expect(text(r.notes)).toMatch(/single dot/);
  });
  it('rejects incomplete answers', () => {
    expect(() => run({})).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  it('reaches a well-formed result without throwing, in several game states', () => {
    const states = [ctx(), ctx({ turn: 1 }), ctx({ turn: 4 }), ctx({ turn: 6 }), ctx({ turn: 9, surrendered: ['china'] })];
    for (const c of states) {
      const paths = allReplacementPaths(c);
      expect(paths.length).toBeGreaterThan(30);
      for (const a of paths) {
        const r = run(a, c);
        expect(['yes', 'no', 'depends']).toContain(r.verdict);
        expect(r.headline.length).toBeGreaterThan(5);
        if (r.verdict !== 'no') {
          expect(r.cost.length).toBeGreaterThan(0);
          expect(r.where.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('reminders', () => {
  const r = (id: string) => replacementReminders.find((x) => x.id === id)!;
  it('allotment: unknown on turn 1 and without a turn, applies from turn 2', () => {
    expect(r('repl-allotment').status(ctx())).toBe('unknown');
    expect(r('repl-allotment').status(ctx({ turn: 1 }))).toBe('unknown');
    expect(r('repl-allotment').status(ctx({ turn: 2 }))).toBe('applies');
    expect(r('repl-allotment').detail!(ctx({ turn: 2 }))).toMatch(/2 ground, 5 air/);
    expect(r('repl-allotment').detail!(ctx({ turn: 1 }))).toMatch(/no ground replacements/);
  });
  it('Chinese: odd turns while China is still in the war', () => {
    expect(r('repl-chinese').status(ctx({ turn: 5 }))).toBe('applies');
    expect(r('repl-chinese').status(ctx({ turn: 6 }))).toBe('notNow');
    expect(r('repl-chinese').status(ctx({ turn: 5, surrendered: ['china'] }))).toBe('notNow');
    expect(r('repl-chinese').status(ctx())).toBe('unknown');
    expect(r('repl-chinese').detail!(ctx({ turn: 6 }))).toMatch(/odd-numbered/);
    expect(r('repl-chinese').detail!(ctx({ surrendered: ['china'] }))).toMatch(/surrendered/);
  });
  it('Commonwealth naval: turns 6, 9 and 12 only', () => {
    for (const turn of [6, 9, 12]) expect(r('repl-cw-naval').status(ctx({ turn }))).toBe('applies');
    expect(r('repl-cw-naval').status(ctx({ turn: 7 }))).toBe('notNow');
    expect(r('repl-cw-naval').status(ctx())).toBe('unknown');
    expect(r('repl-cw-naval').detail!(ctx({ turn: 7 }))).toMatch(/it is turn 7/);
  });
  it('Oahu: not on turn 1, otherwise a board check', () => {
    expect(r('repl-oahu').status(ctx({ turn: 1 }))).toBe('notNow');
    expect(r('repl-oahu').status(ctx({ turn: 3 }))).toBe('unknown');
  });
  it('every reminder has text, a condition and a citation', () => {
    for (const x of replacementReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
