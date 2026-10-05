import { NATIONS, USED_FLAGS, type GameContext, type NationId, type UsedFlag, type WieLevel } from './types';

export const emptyContext: GameContext = { surrendered: [], used: [] };

export type NumberField = 'turn' | 'wieLevel' | 'japanResourceHexes' | 'alliedAsps' | 'capturedNet';

export const LIMITS: Record<NumberField, { min: number; max: number }> = {
  turn: { min: 1, max: 30 },
  wieLevel: { min: 0, max: 4 },
  japanResourceHexes: { min: 0, max: 14 },
  alliedAsps: { min: 0, max: 99 },
  capturedNet: { min: -50, max: 50 },
};

export type ContextAction =
  | { type: 'set'; field: NumberField; value: number | undefined }
  | { type: 'toggleSurrender'; nation: NationId }
  | { type: 'toggleUsed'; flag: UsedFlag }
  | { type: 'nextTurn' }
  | { type: 'reset' };

function clamp(field: NumberField, value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const { min, max } = LIMITS[field];
  return Math.min(max, Math.max(min, Math.round(value)));
}

function toggle<T>(list: T[], item: T, order: T[]): T[] {
  const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  return order.filter((x) => next.includes(x));
}

export function reduceContext(ctx: GameContext, action: ContextAction): GameContext {
  switch (action.type) {
    case 'set':
      return { ...ctx, [action.field]: clamp(action.field, action.value) } as GameContext;
    case 'toggleSurrender':
      return { ...ctx, surrendered: toggle(ctx.surrendered, action.nation, NATIONS.map((n) => n.id)) };
    case 'toggleUsed':
      return { ...ctx, used: toggle(ctx.used, action.flag, USED_FLAGS.map((f) => f.id)) };
    case 'nextTurn':
      return {
        ...ctx,
        turn: ctx.turn === undefined ? undefined : clamp('turn', ctx.turn + 1),
        alliedAsps: undefined,
        capturedNet: undefined,
      };
    case 'reset':
      return { surrendered: [], used: [] };
  }
}

/** Validates stored JSON: anything unexpected is dropped rather than trusted. */
export function parseContext(raw: unknown): GameContext {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { surrendered: [], used: [] };
  const r = raw as Record<string, unknown>;
  const num = (f: NumberField) => (typeof r[f] === 'number' ? clamp(f, r[f] as number) : undefined);
  const surrendered = Array.isArray(r.surrendered)
    ? NATIONS.map((n) => n.id).filter((id) => (r.surrendered as unknown[]).includes(id))
    : [];
  const used = Array.isArray(r.used) ? USED_FLAGS.map((f) => f.id).filter((id) => (r.used as unknown[]).includes(id)) : [];
  return {
    turn: num('turn'),
    wieLevel: num('wieLevel') as WieLevel | undefined,
    japanResourceHexes: num('japanResourceHexes'),
    alliedAsps: num('alliedAsps'),
    capturedNet: num('capturedNet'),
    surrendered,
    used,
  };
}

export function contextSummary(ctx: GameContext): string {
  const parts: string[] = [];
  if (ctx.turn !== undefined) parts.push(`Turn ${ctx.turn}`);
  if (ctx.wieLevel !== undefined) parts.push(ctx.wieLevel === 0 ? 'W.I.E. none' : `W.I.E. ${ctx.wieLevel}`);
  if (ctx.japanResourceHexes !== undefined) parts.push(`Japan ${ctx.japanResourceHexes} resource hexes`);
  return parts.length ? parts.join(' · ') : 'No game status set';
}
