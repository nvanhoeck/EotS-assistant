import { describe, it, expect } from 'vitest';
import {
  answerQuestion, checkReinforcement, goBack, nextQuestion, questionFor, reinforcementReminders,
  type ReinforcementAnswers,
} from '../../src/helper/logic/reinforcement';
import type { GameContext } from '../../src/helper/types';
import { allPaths } from './paths';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const run = (a: ReinforcementAnswers, c: GameContext = ctx()) => checkReinforcement(a, c);
const text = (steps: { text: string }[]) => steps.map((s) => s.text).join(' | ');

describe('question flow', () => {
  it('starts with the side, then the unit class', () => {
    expect(nextQuestion({}, ctx())!.key).toBe('side');
    expect(nextQuestion({ side: 'allied' }, ctx())!.key).toBe('unitClass');
  });
  it('asks Allied ground units for nationality, service and delay', () => {
    let a: ReinforcementAnswers = answerQuestion(answerQuestion({}, 'side', 'allied'), 'unitClass', 'ground');
    expect(nextQuestion(a, ctx())!.key).toBe('nationality');
    a = answerQuestion(a, 'nationality', 'us');
    expect(nextQuestion(a, ctx())!.key).toBe('service');
    a = answerQuestion(a, 'service', 'army');
    expect(nextQuestion(a, ctx())!.key).toBe('delayed');
    a = answerQuestion(a, 'delayed', 'no');
    expect(nextQuestion(a, ctx())).toBeUndefined();
  });
  it('asks a US air unit whether it is a B-29, and a B-29 needs nothing more', () => {
    let a: ReinforcementAnswers = { side: 'allied', unitClass: 'air', nationality: 'us' };
    expect(nextQuestion(a, ctx())!.key).toBe('b29');
    expect(nextQuestion(answerQuestion(a, 'b29', 'yes'), ctx())).toBeUndefined();
    a = answerQuestion(a, 'b29', 'no');
    expect(nextQuestion(a, ctx())!.key).toBe('service');
  });
  it('asks a US naval unit for the ship type instead of the service', () => {
    const a: ReinforcementAnswers = { side: 'allied', unitClass: 'naval', nationality: 'us' };
    expect(nextQuestion(a, ctx())!.key).toBe('ship');
  });
  it('needs nothing after Chinese, HQ or any Japanese unit', () => {
    expect(nextQuestion({ side: 'allied', unitClass: 'ground', nationality: 'chinese' }, ctx())).toBeUndefined();
    expect(nextQuestion({ side: 'allied', unitClass: 'hq' }, ctx())).toBeUndefined();
    expect(nextQuestion({ side: 'japanese', unitClass: 'air' }, ctx())).toBeUndefined();
  });
  it('changing an earlier answer clears the later ones', () => {
    const a = answerQuestion({ side: 'allied', unitClass: 'ground', nationality: 'us', service: 'army', delayed: 'no' }, 'side', 'japanese');
    expect(a).toEqual({ side: 'japanese' });
  });
  it('goBack removes the last answer', () => {
    expect(goBack({ side: 'allied', unitClass: 'ground' })).toEqual({ side: 'allied' });
    expect(goBack({})).toEqual({});
  });
  it('every question offers a "Not sure" option except side and unit class', () => {
    for (const a of allPaths(ctx())) {
      for (const key of ['nationality', 'b29', 'service', 'ship', 'delayed'] as const) {
        if (a[key] === undefined) continue;
        const q = questionFor(key, a, ctx());
        expect(q.options.some((o) => o.value === 'unsure')).toBe(true);
      }
    }
  });
  it('the delay question explains what the game context says', () => {
    const a: ReinforcementAnswers = { side: 'allied', unitClass: 'ground', nationality: 'us', service: 'army' };
    expect(nextQuestion(a, ctx({ wieLevel: 2 }))!.hint).toMatch(/level 2/);
    expect(nextQuestion(a, ctx({ wieLevel: 0 }))!.hint).toMatch(/no effect/);
    expect(nextQuestion(a, ctx())!.hint).toMatch(/level 1\+/);
  });
});

describe('where a unit can be placed (10.1, 6.12)', () => {
  it('Commonwealth ground: Commonwealth or Joint HQ, in a port', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'commonwealth', delayed: 'no' });
    expect(r.verdict).toBe('place');
    expect(r.where).toHaveLength(1);
    expect(r.where[0].text).toMatch(/port/);
    expect(r.where[0].text).toMatch(/Commonwealth or Joint HQ/);
    expect(r.where[0].cite).toContain('6.12');
    expect(r.sentToEurope).toBeUndefined();
  });
  it('US ground and naval: US or Joint HQ', () => {
    for (const unitClass of ['ground', 'naval'] as const) {
      const r = run({ side: 'allied', unitClass, nationality: 'us', service: 'army', ship: 'other', delayed: 'no' });
      expect(r.where[0].text).toMatch(/US or Joint HQ/);
      expect(r.where[0].text).toMatch(/port/);
    }
  });
  it('US air: any friendly HQ, on an airfield', () => {
    const r = run({ side: 'allied', unitClass: 'air', nationality: 'us', b29: 'no', service: 'navy', delayed: 'no' });
    expect(r.where[0].text).toMatch(/any friendly HQ/);
    expect(r.where[0].text).toMatch(/airfield/);
  });
  it('Commonwealth air: Commonwealth or Joint HQ only', () => {
    const r = run({ side: 'allied', unitClass: 'air', nationality: 'commonwealth', delayed: 'no' });
    expect(r.where[0].text).toMatch(/Commonwealth or Joint HQ/);
    expect(r.where[0].text).not.toMatch(/any friendly HQ/);
  });
  it('a Chinese unit goes only to Kunming (2407)', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'chinese' });
    expect(r.verdict).toBe('place');
    expect(r.where).toHaveLength(1);
    expect(r.where[0].text).toMatch(/Kunming/);
    expect(r.where[0].text).toMatch(/2407/);
  });
  it('an unsure nationality lists both possibilities', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'unsure', delayed: 'no' });
    expect(r.where).toHaveLength(2);
    expect(text(r.where)).toMatch(/If US/);
    expect(text(r.where)).toMatch(/If Commonwealth/);
  });
  it('any Japanese HQ places any Japanese unit; Japanese never wait on the Delay box', () => {
    const r = run({ side: 'japanese', unitClass: 'naval' });
    expect(r.verdict).toBe('place');
    expect(r.where[0].text).toMatch(/any Japanese HQ/);
    expect(r.doFirst[0].text).toMatch(/Allied player has placed/);
    expect(text(r.notes)).toMatch(/never delayed or diverted/);
    expect(r.sentToEurope).toBeUndefined();
  });
  it('an HQ goes in a port, can never be delayed and places others only in its own hex', () => {
    const r = run({ side: 'allied', unitClass: 'hq' });
    expect(r.verdict).toBe('place');
    expect(r.headline).toMatch(/never be delayed/);
    expect(r.where[0].text).toMatch(/port/);
    expect(text(r.notes)).toMatch(/only in the hex it occupies/);
    expect(r.sentToEurope).toBeUndefined();
  });
  it('a B-29 can never be delayed', () => {
    const r = run({ side: 'allied', unitClass: 'air', nationality: 'us', b29: 'yes' });
    expect(r.verdict).toBe('place');
    expect(r.headline).toMatch(/B-29/);
    expect(text(r.notes)).toMatch(/B-29/);
  });
  it('always lists the map checks and the ZOI restriction', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'us', service: 'army', delayed: 'no' });
    expect(r.mapChecks.join(' ')).toMatch(/supply-eligible port/);
    expect(r.mapChecks.join(' ')).toMatch(/Activation Range/);
    expect(text(r.restrictions)).toMatch(/un-neutralized enemy ZOI/);
  });
});

describe('delay and Sent to Europe (10.12, 10.21-10.24)', () => {
  const base = { side: 'allied', unitClass: 'ground', nationality: 'us', delayed: 'yes' } as const;
  it('a delayed US Army unit rolls on the W.I.E. range', () => {
    const r = run({ ...base, service: 'army' }, ctx({ wieLevel: 2 }));
    expect(r.verdict).toBe('delay');
    expect(r.sentToEurope!.eligible).toBe('yes');
    expect(r.sentToEurope!.range).toMatch(/0–3/);
    expect(text(r.doFirst)).toMatch(/Delayed Reinforcement box/);
  });
  it('uses the printed range for every W.I.E. level', () => {
    const range = (wieLevel: 0 | 1 | 2 | 3 | 4) => run({ ...base, service: 'army' }, ctx({ wieLevel })).sentToEurope!.range;
    expect(range(0)).toMatch(/no die roll/i);
    expect(range(1)).toMatch(/0–1/);
    expect(range(3)).toMatch(/0–5/);
    expect(range(4)).toMatch(/0–7/);
  });
  it('lists every level when W.I.E. is not set', () => {
    const r = run({ ...base, service: 'army' }).sentToEurope!.range;
    for (const s of ['0–1', '0–3', '0–5', '0–7']) expect(r).toContain(s);
  });
  it('Marines, Navy, and Commonwealth units are exempt', () => {
    expect(run({ ...base, service: 'marine' }).sentToEurope!.eligible).toBe('no');
    expect(run({ ...base, service: 'navy' }).sentToEurope!.eligible).toBe('no');
    expect(run({ side: 'allied', unitClass: 'ground', nationality: 'commonwealth', delayed: 'yes' }).sentToEurope!.eligible).toBe('no');
  });
  it('only a US CVE among ships is eligible', () => {
    const ship = (s: 'cve' | 'other' | 'unsure') =>
      run({ side: 'allied', unitClass: 'naval', nationality: 'us', ship: s, delayed: 'yes' }, ctx({ wieLevel: 4 })).sentToEurope!;
    expect(ship('cve').eligible).toBe('yes');
    expect(ship('cve').range).toMatch(/0–7/);
    expect(ship('other').eligible).toBe('no');
    expect(ship('unsure').eligible).toBe('maybe');
  });
  it('US Army air units are eligible', () => {
    const r = run({ side: 'allied', unitClass: 'air', nationality: 'us', b29: 'no', service: 'army', delayed: 'yes' });
    expect(r.sentToEurope!.eligible).toBe('yes');
  });
  it('an unsure nationality or service gives "maybe", not a confident answer', () => {
    expect(run({ ...base, nationality: 'unsure' }).sentToEurope!.eligible).toBe('maybe');
    expect(run({ ...base, service: 'unsure' }).sentToEurope!.eligible).toBe('maybe');
  });
  it('an unsure delay answer is "depends" and still shows the Sent to Europe rules', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'us', service: 'army', delayed: 'unsure' });
    expect(r.verdict).toBe('depends');
    expect(r.sentToEurope!.eligible).toBe('yes');
    expect(text(r.doFirst)).toMatch(/instead of placing it/);
  });
  it('a delayed air unit of unsure nationality might be a B-29, so it depends', () => {
    expect(run({ side: 'allied', unitClass: 'air', nationality: 'unsure', delayed: 'yes' }).verdict).toBe('depends');
    expect(run({ side: 'allied', unitClass: 'air', nationality: 'us', b29: 'unsure', service: 'army', delayed: 'yes' }).verdict).toBe('depends');
  });
  it('a plain delay with no Sent to Europe exposure skips the die-roll step', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'commonwealth', delayed: 'yes' });
    expect(text(r.doFirst)).not.toMatch(/Sent to Europe/);
  });
  it('mentions the Inter-Service Rivalry exception and roll modifier', () => {
    const r = run({ side: 'allied', unitClass: 'ground', nationality: 'us', service: 'army', delayed: 'yes' }, ctx({ wieLevel: 2 }));
    expect(text(r.notes)).toMatch(/only US Army units go into the box/);
    expect(r.sentToEurope!.text).toMatch(/subtract 1 while US Inter-Service Rivalry/);
  });
  it('rejects incomplete answers', () => {
    expect(() => run({})).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  const contexts = [ctx(), ctx({ wieLevel: 0 }), ctx({ wieLevel: 3 })];
  it('reaches a well-formed result without throwing', () => {
    for (const c of contexts) {
      const paths = allPaths(c);
      expect(paths.length).toBeGreaterThan(20);
      for (const a of paths) {
        const r = run(a, c);
        expect(r.headline.length).toBeGreaterThan(5);
        expect(r.where.length).toBeGreaterThan(0);
        expect(r.doFirst.length).toBeGreaterThan(0);
        expect(r.mapChecks.length).toBeGreaterThan(0);
        expect(['place', 'delay', 'depends']).toContain(r.verdict);
      }
    }
  });
  it('never calls a unit that might be undelayable "delay"', () => {
    for (const a of allPaths(ctx())) {
      const r = run(a, ctx());
      if (r.verdict === 'delay') {
        expect(a.unitClass).not.toBe('hq');
        expect(a.b29).not.toBe('yes');
        expect(a.b29).not.toBe('unsure');
        expect(a.unitClass === 'air' && a.nationality === 'unsure').toBe(false);
      }
    }
  });
});

describe('reinf-delay reminder (10.21)', () => {
  const r = reinforcementReminders.find((x) => x.id === 'reinf-delay')!;
  it('applies when W.I.E. is 1 or more, is not now at 0, unknown when unset', () => {
    expect(r.status(ctx({ wieLevel: 1 }))).toBe('applies');
    expect(r.status(ctx({ wieLevel: 4 }))).toBe('applies');
    expect(r.status(ctx({ wieLevel: 0 }))).toBe('notNow');
    expect(r.status(ctx())).toBe('unknown');
  });
  it('explains itself', () => {
    expect(r.detail!(ctx({ wieLevel: 2 }))).toMatch(/level 2/);
    expect(r.detail!(ctx({ wieLevel: 0 }))).toMatch(/no effect/);
    expect(r.detail!(ctx())).toBeUndefined();
  });
});
