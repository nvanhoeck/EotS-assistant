import type { GameContext, Reminder } from '../types';

export const JAPAN_MIN_DRAW = 4;
export const JAPAN_MAX_DRAW = 7;
export const ALLIED_MIN_DRAW = 4;

const inReserves = (turn: number | undefined) => turn !== undefined && turn >= 2 && turn <= 4;

/** Base Japanese draw before submarine warfare and bombing (11.11, 11.12). */
export function japaneseBaseDraw(turn: number | undefined, resourceHexes: number | undefined): number | undefined {
  if (inReserves(turn)) return JAPAN_MAX_DRAW;
  if (resourceHexes === undefined) return undefined;
  return Math.min(JAPAN_MAX_DRAW, Math.ceil(resourceHexes / 2));
}

/** 11.21 (one card for a successful submarine attack), 11.32 and 11.33 (one per bombing success, at most two). */
export function japaneseDraw(base: number, submarineHit: boolean, bombingHits: number): number {
  const cut = (submarineHit ? 1 : 0) + Math.min(2, Math.max(0, bombingHits));
  return Math.max(JAPAN_MIN_DRAW, base - cut);
}

/** 11.4 */
export function japanesePasses(cards: number): number {
  if (cards >= 7) return 0;
  return cards === 6 ? 1 : 2;
}

export interface AlliedDraw {
  baseCards: number;
  basePasses: number;
  conditions: string[];
  cards: number;
  extraPasses: number;
  /** True when the W.I.E. level was not set, so level 4 was assumed not to apply. */
  wieAssumed: boolean;
}

/** 11.51 and 11.52 */
export function alliedDraw(ctx: GameContext): AlliedDraw | undefined {
  const t = ctx.turn;
  if (t === undefined) return undefined;
  const [baseCards, basePasses] = t <= 1 ? [0, 0] : t === 2 ? [5, 2] : t === 3 ? [6, 1] : [7, 0];
  const conditions: string[] = [];
  if (ctx.surrendered.includes('china')) conditions.push('China has surrendered');
  if (ctx.surrendered.includes('india')) conditions.push('India has surrendered');
  if (ctx.surrendered.includes('australia')) conditions.push('Australia has surrendered');
  if (ctx.wieLevel === 4) conditions.push('War in Europe is at level 4');
  return {
    baseCards,
    basePasses,
    conditions,
    cards: t <= 1 ? 0 : Math.max(ALLIED_MIN_DRAW, baseCards - conditions.length),
    extraPasses: Math.min(2, conditions.length),
    wieAssumed: ctx.wieLevel === undefined,
  };
}

export const strategicWarfareReminders: Reminder[] = [
  {
    id: 'sw-japan-draw',
    pages: ['strategic-warfare#japan-cards'],
    text: 'Japanese base draw: one card per 2 resource hexes under Japanese control, rounded up. Turns 2–4 are always 7. After submarine warfare and bombing it is never fewer than 4.',
    condition: 'Every Strategic Warfare segment.',
    cite: ['11.11', '11.12', '11.4'],
    status: (ctx) => (japaneseBaseDraw(ctx.turn, ctx.japanResourceHexes) === undefined ? 'unknown' : 'applies'),
    detail(ctx) {
      const base = japaneseBaseDraw(ctx.turn, ctx.japanResourceHexes);
      if (base === undefined) return undefined;
      return inReserves(ctx.turn)
        ? `Base draw now: ${base} cards (strategic reserves, turns 2–4).`
        : `Base draw now: ${base} cards (${ctx.japanResourceHexes} resource hexes).`;
    },
  },
];
