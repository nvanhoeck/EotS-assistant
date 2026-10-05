import { describe, it, expect } from 'vitest';
import { nationalTopicReminders } from '../../src/helper/logic/nationalTopics';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const r = (id: string) => nationalTopicReminders.find((x) => x.id === id)!;

describe('China OC offensive (12.72)', () => {
  it('Japan can only conduct one on an even-numbered turn', () => {
    expect(r('china-oc').status(ctx({ turn: 4 }))).toBe('applies');
    expect(r('china-oc').status(ctx({ turn: 5 }))).toBe('notNow');
    expect(r('china-oc').status(ctx())).toBe('unknown');
    expect(r('china-oc').detail!(ctx({ turn: 5 }))).toMatch(/even-numbered turns; it is turn 5/);
    expect(r('china-oc').detail!(ctx({ turn: 4 }))).toMatch(/one China OC Offensive/);
    expect(r('china-oc').detail!(ctx())).toBeUndefined();
  });
  it('is not now once China has surrendered', () => {
    expect(r('china-oc').status(ctx({ turn: 4, surrendered: ['china'] }))).toBe('notNow');
    expect(r('china-oc').detail!(ctx({ turn: 4, surrendered: ['china'] }))).toMatch(/China has surrendered/);
  });
});

describe('other reminders', () => {
  it('Inter-Service Rivalry and India are board checks', () => {
    for (const id of ['isr-us', 'isr-japan', 'india-stability']) expect(r(id).status(ctx({ turn: 3 }))).toBe('unknown');
  });
  it('have text, a condition and a citation', () => {
    for (const x of nationalTopicReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
