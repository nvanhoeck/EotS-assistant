import { describe, it, expect } from 'vitest';
import { contextSummary, emptyContext, parseContext, reduceContext } from '../../src/helper/context';

describe('reduceContext', () => {
  it('sets numbers and clamps them to their limits', () => {
    expect(reduceContext(emptyContext, { type: 'set', field: 'turn', value: 0 }).turn).toBe(1);
    expect(reduceContext(emptyContext, { type: 'set', field: 'wieLevel', value: 9 }).wieLevel).toBe(4);
    expect(reduceContext(emptyContext, { type: 'set', field: 'japanResourceHexes', value: 20 }).japanResourceHexes).toBe(14);
    expect(reduceContext(emptyContext, { type: 'set', field: 'alliedAsps', value: -2 }).alliedAsps).toBe(0);
    expect(reduceContext(emptyContext, { type: 'set', field: 'capturedNet', value: -3 }).capturedNet).toBe(-3);
    expect(reduceContext(emptyContext, { type: 'set', field: 'turn', value: 3.6 }).turn).toBe(4);
  });
  it('clears a field with undefined or NaN', () => {
    const c = reduceContext(emptyContext, { type: 'set', field: 'turn', value: 5 });
    expect(reduceContext(c, { type: 'set', field: 'turn', value: undefined }).turn).toBeUndefined();
    expect(reduceContext(c, { type: 'set', field: 'turn', value: NaN }).turn).toBeUndefined();
  });
  it('toggles surrendered nations, kept in nation order', () => {
    let c = reduceContext(emptyContext, { type: 'toggleSurrender', nation: 'india' });
    c = reduceContext(c, { type: 'toggleSurrender', nation: 'australia' });
    expect(c.surrendered).toEqual(['australia', 'india']);
    expect(reduceContext(c, { type: 'toggleSurrender', nation: 'india' }).surrendered).toEqual(['australia']);
  });
  it('toggles used flags', () => {
    const c = reduceContext(emptyContext, { type: 'toggleUsed', flag: 'alaskaScored' });
    expect(c.used).toEqual(['alaskaScored']);
    expect(reduceContext(c, { type: 'toggleUsed', flag: 'alaskaScored' }).used).toEqual([]);
  });
  it('next turn adds one and resets the per-turn fields only', () => {
    const c = { ...emptyContext, turn: 5, wieLevel: 2 as const, japanResourceHexes: 6, alliedAsps: 3, capturedNet: 2 };
    expect(reduceContext(c, { type: 'nextTurn' })).toEqual({
      surrendered: [], used: [], turn: 6, wieLevel: 2, japanResourceHexes: 6,
    });
  });
  it('next turn with no turn set leaves the turn unset', () => {
    expect(reduceContext({ ...emptyContext, capturedNet: 1 }, { type: 'nextTurn' }).turn).toBeUndefined();
  });
  it('reset returns a fresh empty context', () => {
    const c = reduceContext({ ...emptyContext, turn: 5, used: ['alaskaScored'] }, { type: 'reset' });
    expect(c).toEqual({ surrendered: [], used: [] });
  });
});

describe('parseContext', () => {
  it('falls back to empty for non-objects', () => {
    for (const bad of [null, undefined, 'x', 7, []]) expect(parseContext(bad)).toEqual({ surrendered: [], used: [] });
  });
  it('drops wrong types, unknown ids and clamps numbers', () => {
    const parsed = parseContext({
      turn: '5', wieLevel: 9, japanResourceHexes: 3, alliedAsps: Infinity, capturedNet: 2,
      surrendered: ['china', 'atlantis', 7], used: ['alaskaScored', 'bogus'],
    });
    expect(parsed).toEqual({
      wieLevel: 4, japanResourceHexes: 3, capturedNet: 2, surrendered: ['china'], used: ['alaskaScored'],
    });
  });
  it('round-trips through JSON', () => {
    const c = { ...emptyContext, turn: 6, wieLevel: 1 as const, surrendered: ['china' as const], used: ['hawaiiScored' as const], capturedNet: -1 };
    expect(parseContext(JSON.parse(JSON.stringify(c)))).toEqual(c);
  });
});

describe('contextSummary', () => {
  it('says so when nothing is set', () => {
    expect(contextSummary(emptyContext)).toBe('No game status set');
  });
  it('lists what is set', () => {
    expect(contextSummary({ ...emptyContext, turn: 6, wieLevel: 2, japanResourceHexes: 3 })).toBe('Turn 6 · W.I.E. 2 · Japan 3 resource hexes');
    expect(contextSummary({ ...emptyContext, wieLevel: 0 })).toBe('W.I.E. none');
  });
});
