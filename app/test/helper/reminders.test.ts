import { describe, it, expect } from 'vitest';
import { ALL_REMINDERS, appliesCount, remindersFor, remindersForPage } from '../../src/helper/reminders';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });

describe('ALL_REMINDERS', () => {
  it('have unique ids', () => {
    const ids = ALL_REMINDERS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('are all "unknown" when nothing is set, and never throw', () => {
    for (const r of ALL_REMINDERS) {
      expect(r.status(ctx())).toBe('unknown');
      expect(() => r.detail?.(ctx())).not.toThrow();
    }
  });
  it('never throw with a fully set context', () => {
    const full = ctx({ turn: 7, wieLevel: 2, japanResourceHexes: 3, alliedAsps: 3, capturedNet: 2, surrendered: ['china'], used: ['alaskaScored'] });
    for (const r of ALL_REMINDERS) {
      expect(['applies', 'notNow', 'unknown']).toContain(r.status(full));
      expect(() => r.detail?.(full)).not.toThrow();
    }
  });
});

describe('remindersFor', () => {
  it('finds reminders by exact page key', () => {
    const ids = remindersFor('strategic-warfare#bombing', ctx()).map((i) => i.reminder.id);
    expect(ids).toEqual(['pw-bombing']);
  });
  it('puts reminders that apply first, then unknown, then not-now', () => {
    const items = remindersFor('strategic-warfare#japan-cards', ctx({ turn: 3, japanResourceHexes: 2 }));
    expect(items.map((i) => [i.reminder.id, i.status])).toEqual([
      ['sw-japan-draw', 'applies'],
      ['pw-resource', 'notNow'],
    ]);
  });
  it('carries the detail line', () => {
    const [item] = remindersFor('reinforcements#end', ctx({ turn: 4, alliedAsps: 3, capturedNet: 2 }));
    expect(item.detail).toBe('Target 3 · net 2 · 1 to go');
  });
});

describe('remindersForPage / appliesCount', () => {
  it('includes every section of the page, once per reminder', () => {
    const ids = remindersForPage('us-political-will', ctx()).map((i) => i.reminder.id);
    expect(ids.sort()).toEqual(['pw-alaska', 'pw-bombing', 'pw-casualties', 'pw-hawaii', 'pw-navy', 'pw-progress', 'pw-resource', 'pw-wie4']);
  });
  it('counts only reminders that apply now', () => {
    expect(appliesCount('us-political-will', ctx())).toBe(0);
    expect(appliesCount('us-political-will', ctx({ turn: 6, japanResourceHexes: 2 }))).toBe(2);
    expect(appliesCount('reinforcements', ctx({ turn: 6, wieLevel: 1 }))).toBe(2);
    expect(appliesCount('strategic-warfare', ctx({ turn: 6, japanResourceHexes: 2 }))).toBe(2);
  });
  it('does not match a page whose id merely starts the same', () => {
    expect(remindersForPage('reinforce', ctx())).toEqual([]);
  });
});
