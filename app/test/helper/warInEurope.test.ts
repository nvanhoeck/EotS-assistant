import { describe, it, expect } from 'vitest';
import { WIE_LEVELS, effectsAt, wieLevelForTrack, warInEuropeReminders } from '../../src/helper/logic/warInEurope';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const text = (level: 0 | 1 | 2 | 3 | 4) => effectsAt(level).map((s) => s.text).join(' | ');

describe('track value to level (15.1-15.5, 15.7)', () => {
  it('maps the printed ranges', () => {
    expect([3, 2, 1].map(wieLevelForTrack)).toEqual([0, 0, 0]);
    expect([0, -1, -2].map(wieLevelForTrack)).toEqual([1, 1, 1]);
    expect([-3, -4].map(wieLevelForTrack)).toEqual([2, 2]);
    expect([-5, -6].map(wieLevelForTrack)).toEqual([3, 3]);
    expect(wieLevelForTrack(-7)).toBe(4);
  });
  it('clamps at the track limits: never above +3 or below −7', () => {
    expect(wieLevelForTrack(9)).toBe(0);
    expect(wieLevelForTrack(-12)).toBe(4);
  });
});

describe('effects (15.1-15.5)', () => {
  it('no effect has none', () => {
    expect(effectsAt(0)).toEqual([]);
  });
  it('levels 1 to 4 delay Allied reinforcements and set the Sent to Europe range', () => {
    for (const level of [1, 2, 3, 4] as const) expect(text(level)).toMatch(/Allied reinforcements are delayed/);
    expect(text(1)).toMatch(/0–1/);
    expect(text(2)).toMatch(/0–3/);
    expect(text(3)).toMatch(/0–5/);
    expect(text(4)).toMatch(/0–7/);
  });
  it('levels 3 and 4 also cost the Allied ASP reinforcement', () => {
    expect(text(2)).not.toMatch(/Amphibious Shipping/);
    expect(text(3)).toMatch(/Amphibious Shipping Point reinforcement/);
    expect(text(4)).toMatch(/Amphibious Shipping Point reinforcement/);
  });
  it('level 4 also costs a card and moves US Political Will', () => {
    expect(text(3)).not.toMatch(/one card fewer/);
    expect(text(4)).toMatch(/one card fewer/);
    expect(text(4)).toMatch(/Political Will marker one box to the left/);
  });
  it('level table lists all five levels in order', () => {
    expect(WIE_LEVELS.map((l) => l.level)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('reminder', () => {
  const r = warInEuropeReminders.find((x) => x.id === 'wie-level')!;
  it('applies from level 1', () => {
    expect(r.status(ctx({ wieLevel: 0 }))).toBe('notNow');
    expect(r.status(ctx({ wieLevel: 1 }))).toBe('applies');
    expect(r.status(ctx())).toBe('unknown');
    expect(r.detail!(ctx({ wieLevel: 3 }))).toMatch(/Level 3: /);
    expect(r.detail!(ctx({ wieLevel: 0 }))).toMatch(/no effect/i);
    expect(r.detail!(ctx())).toBeUndefined();
  });
});
