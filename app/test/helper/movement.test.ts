import { describe, it, expect } from 'vitest';
import { aspCost, movementAllowance, movementReminders } from '../../src/helper/logic/movement';

const text = (r: ReturnType<typeof movementAllowance>) => r.steps.map((s) => s.text).join(' | ');

describe('movementAllowance (5.11, 7.1, 7.2, 7.3, 7.4)', () => {
  it('ground: 1 movement point per OC value', () => {
    expect([1, 2, 3].map((oc) => movementAllowance({ kind: 'ground', ocValue: oc }).points)).toEqual([1, 2, 3]);
  });
  it('ground terrain costs are reported', () => {
    expect(text(movementAllowance({ kind: 'ground', ocValue: 2 }))).toMatch(/open terrain.*1.*mountain.*3.*2/);
    expect(text(movementAllowance({ kind: 'ground', ocValue: 2 }))).toMatch(/half a movement point/);
  });
  it('naval: 5 per OC value, doubled port to port', () => {
    expect([1, 2, 3].map((oc) => movementAllowance({ kind: 'naval', ocValue: oc }).points)).toEqual([5, 10, 15]);
    expect(movementAllowance({ kind: 'naval', ocValue: 2, strategic: true }).points).toBe(20);
    expect(text(movementAllowance({ kind: 'naval', ocValue: 2, strategic: true }))).toMatch(/cannot enter a battle/);
  });
  it('amphibious assault moves like a naval unit and never doubles', () => {
    expect(movementAllowance({ kind: 'amphibious', ocValue: 2 }).points).toBe(10);
    expect(movementAllowance({ kind: 'amphibious', ocValue: 2, strategic: true }).points).toBe(10);
    expect(text(movementAllowance({ kind: 'amphibious', ocValue: 2 }))).toMatch(/never doubles/);
  });
  it('strategic ground transport doubles only when it starts in a friendly port', () => {
    expect(movementAllowance({ kind: 'groundTransport', ocValue: 2 }).points).toBe(10);
    expect(movementAllowance({ kind: 'groundTransport', ocValue: 2, strategic: true }).points).toBe(20);
  });
  it('air: one leg per OC value, each up to the range', () => {
    const r = movementAllowance({ kind: 'air', ocValue: 2, airRange: 4 });
    expect(r.legs).toBe(2);
    expect(r.legLength).toBe(4);
    expect(r.points).toBe(8);
    expect(text(r)).toMatch(/friendly airfield/);
  });
  it('air strategic transport doubles the legs (rulebook example: range 4, 2 OC = 16 hexes, 4 legs)', () => {
    const r = movementAllowance({ kind: 'air', ocValue: 2, airRange: 4, strategic: true });
    expect(r.legs).toBe(4);
    expect(r.points).toBe(16);
    expect(text(r)).toMatch(/cannot be used in a battle/);
  });
  it('matches the printed chart for air units', () => {
    expect([1, 2, 3].map((oc) => movementAllowance({ kind: 'air', ocValue: oc, airRange: 6 }).points)).toEqual([6, 12, 18]);
    expect([1, 2, 3].map((oc) => movementAllowance({ kind: 'air', ocValue: oc, airRange: 8 }).points)).toEqual([8, 16, 24]);
  });
  it('rejects an OC value outside 1-3 and a missing or bad air range', () => {
    expect(() => movementAllowance({ kind: 'ground', ocValue: 0 })).toThrow(RangeError);
    expect(() => movementAllowance({ kind: 'ground', ocValue: 4 })).toThrow(RangeError);
    expect(() => movementAllowance({ kind: 'ground', ocValue: 1.5 })).toThrow(RangeError);
    expect(() => movementAllowance({ kind: 'air', ocValue: 2 })).toThrow(RangeError);
    expect(() => movementAllowance({ kind: 'air', ocValue: 2, airRange: 0 })).toThrow(RangeError);
  });
});

describe('aspCost (7.45 A)', () => {
  it('one ASP per ground unit of division size or smaller', () => {
    expect(aspCost({ size: 'division', full: true })).toBe(1);
    expect(aspCost({ size: 'division', full: false })).toBe(1);
  });
  it('corps and armies need one ASP per step', () => {
    expect(aspCost({ size: 'corps', full: true })).toBe(2);
    expect(aspCost({ size: 'corps', full: false })).toBe(1);
  });
  it('the Japanese Korean Army costs two ASP per step', () => {
    expect(aspCost({ size: 'koreanArmy', full: true })).toBe(4);
    expect(aspCost({ size: 'koreanArmy', full: false })).toBe(2);
  });
});

describe('reminders', () => {
  it('have text, a condition and a citation, and are board checks', () => {
    for (const x of movementReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
      expect(x.status({ surrendered: [], used: [] })).toBe('unknown');
    }
  });
});
