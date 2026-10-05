import { describe, it, expect } from 'vitest';
import {
  activatableUnits, activationQuestionFor, answerActivation, checkActivation, goBackActivation, nextActivationQuestion,
  offensiveReminders, type ActivationAnswers,
} from '../../src/helper/logic/activation';
import { allActivationPaths } from './paths';

const text = (r: ReturnType<typeof checkActivation>) => [r.headline, ...r.steps.map((s) => s.text), ...r.notes.map((s) => s.text)].join(' | ');

describe('activatableUnits (6.21)', () => {
  it('is the OC or Logistics value plus the HQ efficiency', () => {
    expect(activatableUnits(3, 1)).toBe(4);
    expect(activatableUnits(2, 0)).toBe(2);
  });
  it('never goes below zero', () => {
    expect(activatableUnits(-5, 1)).toBe(0);
  });
});

describe('question flow', () => {
  it('starts with the HQ and then the unit', () => {
    expect(nextActivationQuestion({})!.key).toBe('hq');
    expect(nextActivationQuestion({ hq: 'us' })!.key).toBe('unit');
  });
  it('asks a Commonwealth HQ whether a US unit is an air unit', () => {
    expect(nextActivationQuestion({ hq: 'commonwealth', unit: 'us' })!.key).toBe('usAir');
    expect(nextActivationQuestion({ hq: 'commonwealth', unit: 'chinese' })).toBeUndefined();
  });
  it('asks about Inter-Service Rivalry only for a US HQ with a US unit, or a Japanese HQ with a Japanese unit', () => {
    expect(nextActivationQuestion({ hq: 'us', unit: 'us' })!.key).toBe('isr');
    expect(nextActivationQuestion({ hq: 'japanese', unit: 'japanese' })!.key).toBe('isr');
    expect(nextActivationQuestion({ hq: 'joint', unit: 'us' })).toBeUndefined();
    expect(nextActivationQuestion({ hq: 'us', unit: 'chinese' })).toBeUndefined();
  });
  it('changing an earlier answer clears later ones; goBack removes the last', () => {
    expect(answerActivation({ hq: 'us', unit: 'us', isr: 'yes' }, 'hq', 'joint')).toEqual({ hq: 'joint' });
    expect(goBackActivation({ hq: 'us', unit: 'us' })).toEqual({ hq: 'us' });
  });
  it('the sub-questions offer "Not sure"', () => {
    for (const key of ['usAir', 'isr'] as const) expect(activationQuestionFor(key).options.some((o) => o.value === 'unsure')).toBe(true);
  });
});

describe('who can activate what (6.21 A-D, 7.53)', () => {
  const run = (a: ActivationAnswers) => checkActivation(a);
  it('Japanese HQs activate any Japanese unit and nothing else', () => {
    expect(run({ hq: 'japanese', unit: 'japanese', isr: 'no' }).verdict).toBe('yes');
    expect(run({ hq: 'japanese', unit: 'us' }).verdict).toBe('no');
  });
  it('Allied HQs never activate Japanese units', () => {
    for (const hq of ['us', 'commonwealth', 'joint'] as const) expect(run({ hq, unit: 'japanese' }).verdict).toBe('no');
  });
  it('US HQs: US and Chinese units, not Commonwealth or Dutch', () => {
    expect(run({ hq: 'us', unit: 'us', isr: 'no' }).verdict).toBe('yes');
    expect(run({ hq: 'us', unit: 'chinese' }).verdict).toBe('yes');
    expect(run({ hq: 'us', unit: 'commonwealth' }).verdict).toBe('no');
    expect(run({ hq: 'us', unit: 'dutch' }).verdict).toBe('no');
  });
  it('Commonwealth HQs: Commonwealth, Chinese and US air units only', () => {
    expect(run({ hq: 'commonwealth', unit: 'commonwealth' }).verdict).toBe('yes');
    expect(run({ hq: 'commonwealth', unit: 'chinese' }).verdict).toBe('yes');
    expect(run({ hq: 'commonwealth', unit: 'us', usAir: 'yes' }).verdict).toBe('yes');
    expect(run({ hq: 'commonwealth', unit: 'us', usAir: 'no' }).verdict).toBe('no');
    expect(run({ hq: 'commonwealth', unit: 'us', usAir: 'unsure' }).verdict).toBe('depends');
    expect(run({ hq: 'commonwealth', unit: 'dutch' }).verdict).toBe('no');
  });
  it('Joint HQs activate any Allied unit, and only they activate Dutch units', () => {
    for (const unit of ['us', 'commonwealth', 'chinese', 'dutch'] as const) expect(run({ hq: 'joint', unit }).verdict).toBe('yes');
    expect(text(run({ hq: 'joint', unit: 'dutch' }))).toMatch(/Only Joint HQs can activate Dutch units/);
  });
  it('mentions the chart discrepancy for Dutch units', () => {
    expect(text(run({ hq: 'commonwealth', unit: 'dutch' }))).toMatch(/printed.*chart/);
  });
  it('Inter-Service Rivalry: a US HQ activates Army OR Naval units, a Japanese HQ army OR naval', () => {
    expect(text(run({ hq: 'us', unit: 'us', isr: 'yes' }))).toMatch(/Army units OR US Naval units/);
    expect(text(run({ hq: 'japanese', unit: 'japanese', isr: 'yes' }))).toMatch(/army and naval/);
    expect(text(run({ hq: 'us', unit: 'us', isr: 'no' }))).not.toMatch(/Inter-Service/);
    expect(run({ hq: 'us', unit: 'us', isr: 'unsure' }).verdict).toBe('depends');
  });
  it('always states the supply and range conditions and the event exception', () => {
    const r = run({ hq: 'joint', unit: 'us' });
    expect(text(r)).toMatch(/in supply/);
    expect(text(r)).toMatch(/range/);
    expect(text(r)).toMatch(/event card/i);
  });
  it('rejects incomplete answers', () => {
    expect(() => run({})).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  it('reaches a well-formed result', () => {
    const paths = allActivationPaths();
    expect(paths.length).toBeGreaterThan(15);
    for (const a of paths) {
      const r = checkActivation(a);
      expect(['yes', 'no', 'depends']).toContain(r.verdict);
      expect(r.headline.length).toBeGreaterThan(5);
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('reminders', () => {
  it('are board checks with text, a condition and a citation', () => {
    for (const x of offensiveReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
      expect(x.status({ surrendered: [], used: [] })).toBe('unknown');
    }
  });
});
