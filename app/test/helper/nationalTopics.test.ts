import { describe, it, expect } from 'vitest';
import { nationalTopicReminders } from '../../src/helper/logic/nationalTopics';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const r = (id: string) => nationalTopicReminders.find((x) => x.id === id)!;

describe('China OC offensive (13.72)', () => {
  it('is a board check on any turn (once per two turns, never on consecutive turns)', () => {
    for (const turn of [3, 4, undefined]) expect(r('china-oc').status(ctx({ turn }))).toBe('unknown');
    expect(r('china-oc').detail!(ctx({ turn: 4 }))).toBeUndefined();
    expect(r('china-oc').text).toMatch(/not on consecutive game turns/);
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
