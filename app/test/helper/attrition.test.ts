import { describe, it, expect } from 'vitest';
import {
  answerAttrition, attritionQuestionFor, attritionReminders, checkAttrition, goBackAttrition, nextAttritionQuestion,
  type AttritionAnswers,
} from '../../src/helper/logic/attrition';
import { allAttritionPaths } from './paths';

const text = (r: ReturnType<typeof checkAttrition>) => [r.headline, ...r.steps.map((s) => s.text), ...r.notes.map((s) => s.text)].join(' | ');

describe('question flow', () => {
  it('naval units need nothing more', () => {
    expect(nextAttritionQuestion({ unitClass: 'naval' })).toBeUndefined();
  });
  it('a supplied unit needs nothing more', () => {
    expect(nextAttritionQuestion({ unitClass: 'ground', supplied: 'yes' })).toBeUndefined();
  });
  it('an unsupplied unit is asked about emergency supply, strength, and HQ range for reduced ones', () => {
    let a: AttritionAnswers = { unitClass: 'air', supplied: 'no' };
    expect(nextAttritionQuestion(a)!.key).toBe('emergency');
    a = answerAttrition(a, 'emergency', 'no');
    expect(nextAttritionQuestion(a)!.key).toBe('strength');
    expect(nextAttritionQuestion(answerAttrition(a, 'strength', 'full'))).toBeUndefined();
    expect(nextAttritionQuestion(answerAttrition(a, 'strength', 'reduced'))!.key).toBe('hqRange');
    expect(nextAttritionQuestion(answerAttrition(a, 'strength', 'oneSided'))!.key).toBe('hqRange');
  });
  it('emergency supply ends the questions', () => {
    expect(nextAttritionQuestion({ unitClass: 'ground', supplied: 'no', emergency: 'yes' })).toBeUndefined();
  });
  it('an unsure supply answer ends the questions', () => {
    expect(nextAttritionQuestion({ unitClass: 'ground', supplied: 'unsure' })).toBeUndefined();
  });
  it('changing an earlier answer clears the later ones; goBack removes the last', () => {
    expect(answerAttrition({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'full' }, 'supplied', 'yes')).toEqual({ unitClass: 'ground', supplied: 'yes' });
    expect(goBackAttrition({ unitClass: 'ground', supplied: 'no' })).toEqual({ unitClass: 'ground' });
  });
  it('supply and HQ range offer "Not sure"', () => {
    for (const key of ['supplied', 'hqRange'] as const) expect(attritionQuestionFor(key).options.some((o) => o.value === 'unsure')).toBe(true);
  });
});

describe('outcomes (4.4, 13.4)', () => {
  const run = (a: AttritionAnswers) => checkAttrition(a);
  it('naval units are unaffected', () => {
    expect(run({ unitClass: 'naval' }).outcome).toBe('none');
    expect(text(run({ unitClass: 'naval' }))).toMatch(/Naval units are not affected/);
  });
  it('a supplied unit is unaffected', () => {
    expect(run({ unitClass: 'ground', supplied: 'yes' }).outcome).toBe('none');
  });
  it('an emergency supply route prevents attrition', () => {
    const r = run({ unitClass: 'air', supplied: 'no', emergency: 'yes' });
    expect(r.outcome).toBe('none');
    expect(text(r)).toMatch(/China Airlift|Tokyo Express/);
  });
  it('an unsupplied full-strength unit flips to its reduced side', () => {
    const r = run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'full' });
    expect(r.outcome).toBe('flip');
    expect(text(r)).toMatch(/reduced side/);
  });
  it('an unsupplied reduced unit within range of any friendly HQ stays reduced, supplied HQ or not', () => {
    const r = run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'reduced', hqRange: 'yes' });
    expect(r.outcome).toBe('stay');
    expect(text(r)).toMatch(/whether or not the HQ is supplied/);
  });
  it('an unsupplied reduced unit out of range of every friendly HQ is eliminated', () => {
    const r = run({ unitClass: 'air', supplied: 'no', emergency: 'no', strength: 'reduced', hqRange: 'no' });
    expect(r.outcome).toBe('eliminated');
  });
  it('a one-sided unit counts as reduced', () => {
    const r = run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'oneSided', hqRange: 'no' });
    expect(r.outcome).toBe('eliminated');
    expect(text(r)).toMatch(/only one side/);
    expect(run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'oneSided', hqRange: 'yes' }).outcome).toBe('stay');
  });
  it('the range check says the path cannot be blocked by enemy units or an opposing ZOI', () => {
    const r = run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'reduced', hqRange: 'yes' });
    expect(r.mapChecks.join(' ')).toMatch(/enemy units or an opposing ZOI/);
  });
  it('unsure answers give "depends"', () => {
    expect(run({ unitClass: 'ground', supplied: 'unsure' }).outcome).toBe('depends');
    expect(run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'reduced', hqRange: 'unsure' }).outcome).toBe('depends');
  });
  it('notes that attrition is applied simultaneously', () => {
    expect(text(run({ unitClass: 'ground', supplied: 'no', emergency: 'no', strength: 'full' }))).toMatch(/at the same time/);
  });
  it('rejects incomplete answers', () => {
    expect(() => run({})).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  it('reaches a well-formed result', () => {
    const paths = allAttritionPaths();
    expect(paths.length).toBeGreaterThan(10);
    for (const a of paths) {
      const r = checkAttrition(a);
      expect(['none', 'flip', 'stay', 'eliminated', 'depends']).toContain(r.outcome);
      expect(r.headline.length).toBeGreaterThan(5);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('reminders', () => {
  it('have text, a condition and a citation', () => {
    for (const x of attritionReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
      expect(x.status({ surrendered: [], used: [] })).toBe('unknown');
    }
  });
});
