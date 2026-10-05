import { describe, it, expect } from 'vitest';
import {
  SURRENDER_RULES, checkSurrender, nationalStatusReminders, ruleFor, type SurrenderTarget,
} from '../../src/helper/logic/nationalStatus';
import type { GameContext } from '../../src/helper/types';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const all = (id: SurrenderTarget, value: boolean) => ruleFor(id).conditions.map(() => value);
const text = (r: ReturnType<typeof checkSurrender>) => [r.headline, ...r.consequences.map((s) => s.text), ...r.effects.map((s) => s.text)].join(' | ');

describe('surrender rules (12.2-12.9)', () => {
  it('covers the six nations the checker handles', () => {
    expect(SURRENDER_RULES.map((r) => r.id)).toEqual(['philippines', 'malaya', 'dei', 'burma', 'australia', 'japan']);
  });
  it('lists the conditions the rulebook gives', () => {
    expect(ruleFor('philippines').conditions.map((c) => c.text).join(' ')).toMatch(/Manila \(2813\)[\s\S]*Davao \(2915\)/);
    expect(ruleFor('malaya').conditions.map((c) => c.text).join(' ')).toMatch(/Singapore \(2015\)[\s\S]*Kuantan \(2014\)/);
    expect(ruleFor('dei').conditions.map((c) => c.text).join(' ')).toMatch(/seven resource[\s\S]*Tjilatjap \(2019\)/);
    expect(ruleFor('burma').conditions).toHaveLength(4);
    expect(ruleFor('burma').conditions.map((c) => c.text).join(' ')).toMatch(/Rangoon \(2008\)[\s\S]*Mandalay \(2106\)[\s\S]*Lashio \(2206\)[\s\S]*Myitkyina \(2305\)/);
    expect(ruleFor('australia').conditions[0].text).toMatch(/mainland Australia/);
    expect(ruleFor('australia').conditions[0].text).toMatch(/not the Mandates/);
  });
  it('Japan surrenders on either condition; every other nation needs all of them', () => {
    expect(ruleFor('japan').mode).toBe('any');
    for (const r of SURRENDER_RULES.filter((x) => x.id !== 'japan')) expect(r.mode).toBe('all');
  });
});

describe('checkSurrender', () => {
  it('surrenders when every condition holds', () => {
    for (const id of ['philippines', 'malaya', 'dei', 'burma', 'australia'] as const) {
      const r = checkSurrender(id, all(id, true), ctx());
      expect(r.status).toBe('surrenders');
      expect(r.missing).toEqual([]);
    }
  });
  it('does not surrender while one condition is missing, and says which', () => {
    const r = checkSurrender('philippines', [true, false], ctx());
    expect(r.status).toBe('notYet');
    expect(r.missing).toHaveLength(1);
    expect(r.missing[0].text).toMatch(/Davao/);
    expect(checkSurrender('burma', [true, true, true, false], ctx()).missing[0].text).toMatch(/Myitkyina/);
    expect(checkSurrender('dei', [false, false], ctx()).missing).toHaveLength(2);
  });
  it('treats missing checkboxes as not met', () => {
    expect(checkSurrender('malaya', [], ctx()).status).toBe('notYet');
  });
  it('a nation can only surrender once', () => {
    const r = checkSurrender('malaya', all('malaya', true), ctx({ surrendered: ['malaya'] }));
    expect(r.status).toBe('already');
    expect(text(r)).toMatch(/only surrender once/);
    expect(text(r)).toMatch(/regain control/);
  });
  it('Japan surrendering ends the game', () => {
    const r = checkSurrender('japan', [true, false], ctx());
    expect(r.status).toBe('gameOver');
    expect(r.headline).toMatch(/Allies win/);
    expect(checkSurrender('japan', [false, true], ctx()).status).toBe('gameOver');
    expect(checkSurrender('japan', [false, false], ctx()).status).toBe('notYet');
  });
  it('lists what happens to units and bases', () => {
    expect(text(checkSurrender('philippines', [true, true], ctx()))).toMatch(/Remove all Allied ground units in Philippine hexes/);
    expect(text(checkSurrender('malaya', [true, true], ctx()))).toMatch(/No Allied units are removed/);
    expect(text(checkSurrender('dei', [true, true], ctx()))).toMatch(/Dutch units are removed/);
    expect(text(checkSurrender('burma', all('burma', true), ctx()))).toMatch(/Burma \(B\)/);
    expect(text(checkSurrender('australia', [true], ctx()))).toMatch(/Australian reinforcements/);
  });
  it('every Allied surrender gives Japan the unoccupied airfields and ports', () => {
    for (const id of ['philippines', 'malaya', 'dei', 'burma', 'australia'] as const) {
      expect(text(checkSurrender(id, all(id, true), ctx()))).toMatch(/airfields and ports/);
    }
  });
  it('shows the US Political Will cost, with the recapture note for asterisked nations', () => {
    expect(text(checkSurrender('australia', [true], ctx()))).toMatch(/US Political Will −2/);
    expect(text(checkSurrender('malaya', [true, true], ctx()))).toMatch(/US Political Will −1.*given back/);
    expect(text(checkSurrender('burma', all('burma', true), ctx()))).toMatch(/US Political Will −1/);
  });
  it('Australia also costs the Allies a card that does not come back', () => {
    const t = text(checkSurrender('australia', [true], ctx()));
    expect(t).toMatch(/one card fewer/);
    expect(t).toMatch(/does not recover/);
  });
  it('flags the extra −2 when this is the last of the listed nations', () => {
    const others = ['australia', 'burma', 'china', 'dei', 'india', 'philippines'] as const;
    expect(text(checkSurrender('malaya', [true, true], ctx({ surrendered: [...others] })))).toMatch(/another −2/);
    expect(text(checkSurrender('malaya', [true, true], ctx()))).not.toMatch(/another −2/);
  });
});

describe('reminders', () => {
  const r = (id: string) => nationalStatusReminders.find((x) => x.id === id)!;
  it('W.I.E. level 4 moves the US Political Will marker', () => {
    expect(r('pw-wie4').status(ctx({ wieLevel: 4 }))).toBe('applies');
    expect(r('pw-wie4').status(ctx({ wieLevel: 3 }))).toBe('notNow');
    expect(r('pw-wie4').status(ctx())).toBe('unknown');
    expect(r('pw-wie4').detail!(ctx({ wieLevel: 2 }))).toMatch(/level 2/);
    expect(r('pw-wie4').detail!(ctx({ wieLevel: 4 }))).toMatch(/one box to the left/);
  });
  it('the segment reminder is a board check', () => {
    expect(r('ns-segment').status(ctx({ turn: 3 }))).toBe('unknown');
  });
  it('every reminder has text, a condition and a citation', () => {
    for (const x of nationalStatusReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
