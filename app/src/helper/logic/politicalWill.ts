import type { GameContext, NationId, Reminder } from '../types';

export interface SurrenderEntry {
  id: NationId;
  label: string;
  value: number;
  /** The rulebook's asterisk: recapturing the nation gives the value back. */
  recapture: boolean;
}

/** 16.41 */
export const SURRENDER_PW: SurrenderEntry[] = [
  { id: 'australia', label: 'Australia', value: 2, recapture: true },
  { id: 'burma', label: 'Burma', value: 1, recapture: true },
  { id: 'china', label: 'China', value: 2, recapture: false },
  { id: 'dei', label: 'Dutch East Indies', value: 1, recapture: true },
  { id: 'india', label: 'India', value: 2, recapture: false },
  { id: 'malaya', label: 'Malaya', value: 1, recapture: true },
  { id: 'philippines', label: 'Philippines', value: 1, recapture: true },
];
export const ALL_SURRENDERED_PW = 2;

export const PROGRESS_FROM_TURN = 4;
export const PROGRESS_MAX_TARGET = 4;

export interface Progress {
  active: boolean;
  target?: number;
  net: number;
  remaining?: number;
  met?: boolean;
}

/** 16.47: from turn 4 the Allies must hold min(4, ASPs after the Reinforcement segment) newly captured hexes. */
export function progressOfWar(ctx: GameContext): Progress {
  const active = ctx.turn !== undefined && ctx.turn >= PROGRESS_FROM_TURN;
  const net = ctx.capturedNet ?? 0;
  if (!active || ctx.alliedAsps === undefined) return { active, net };
  const target = Math.min(PROGRESS_MAX_TARGET, ctx.alliedAsps);
  const remaining = Math.max(0, target - net);
  return { active, target, net, remaining, met: remaining === 0 };
}

export function progressDetail(ctx: GameContext): string | undefined {
  if (ctx.turn === undefined) return undefined;
  if (ctx.turn < PROGRESS_FROM_TURN) return `Starts on turn ${PROGRESS_FROM_TURN}; it is turn ${ctx.turn}.`;
  const p = progressOfWar(ctx);
  if (p.target === undefined) return 'Enter your Allied ASPs (after the Reinforcement segment) to see the target.';
  return `Target ${p.target} · net ${p.net} · ${p.remaining === 0 ? 'target met' : `${p.remaining} to go`}`;
}

const resourceInRange = (turn: number) => turn >= 5 && turn <= 12;

export const politicalWillReminders: Reminder[] = [
  {
    id: 'pw-resource',
    pages: ['strategic-warfare#japan-cards', 'us-political-will#strategic-warfare'],
    text: 'Japan controls 3 or fewer resource hexes during turns 5–12: US Political Will +3. Only once per game.',
    condition: 'Any game turn from 5 to 12, Japan controls 3 or fewer of the 14 resource hexes, and it has not happened before.',
    cite: ['16.43', '11.11'],
    links: ['us-political-will'],
    status(ctx) {
      if (ctx.used.includes('resourcePwScored')) return 'notNow';
      if (ctx.turn !== undefined && !resourceInRange(ctx.turn)) return 'notNow';
      if (ctx.japanResourceHexes !== undefined && ctx.japanResourceHexes > 3) return 'notNow';
      return ctx.turn !== undefined && ctx.japanResourceHexes !== undefined ? 'applies' : 'unknown';
    },
    detail(ctx) {
      if (ctx.used.includes('resourcePwScored')) return 'Already scored this game.';
      if (ctx.turn !== undefined && !resourceInRange(ctx.turn)) return `Only on turns 5–12; it is turn ${ctx.turn}.`;
      if (ctx.japanResourceHexes !== undefined && ctx.japanResourceHexes > 3) {
        return `Japan controls ${ctx.japanResourceHexes} resource hexes; it needs 3 or fewer.`;
      }
      if (ctx.turn !== undefined && ctx.japanResourceHexes !== undefined) {
        return `Turn ${ctx.turn}, Japan controls ${ctx.japanResourceHexes}: raise US Political Will by 3 and mark it as used.`;
      }
      return undefined;
    },
  },
  {
    id: 'pw-bombing',
    pages: ['strategic-warfare#bombing', 'us-political-will#strategic-warfare'],
    text: 'US Strategic Bombing cut the Japanese draw by one or more cards: move US Political Will one box to the right, even if the draw was already at the minimum. At most once per turn.',
    condition: 'A US B-29 bombing run reduced the Japanese card draw this turn.',
    cite: ['16.43', '11.32', '11.31'],
    links: ['us-political-will'],
    status: (ctx) => (ctx.turn !== undefined && ctx.turn < 9 ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.turn !== undefined && ctx.turn < 9 ? 'No B-29 group is available before turn 9.' : undefined),
  },
  {
    id: 'pw-progress',
    pages: ['reinforcements#end', 'us-political-will#progress'],
    text: 'From turn 4 the Allies must capture and keep Japanese-controlled hexes (named location, resource, port or airfield) equal to the smaller of 4 and their ASPs after the Reinforcement segment, or US Political Will −1. Note your ASPs now.',
    condition: 'Game turn 4 or later; checked at the end of the US Political Will segment.',
    cite: ['16.47', '9.3'],
    links: ['us-political-will'],
    status(ctx) {
      if (ctx.turn === undefined) return 'unknown';
      return ctx.turn >= PROGRESS_FROM_TURN ? 'applies' : 'notNow';
    },
    detail: progressDetail,
  },
  {
    id: 'pw-alaska',
    pages: ['us-political-will#occupation'],
    text: 'A Japanese unit stays on any Aleutian hex (4600–5100) through three consecutive US Political Will segments: US Political Will −1. Only once per game.',
    condition: 'Three consecutive US Political Will segments with a Japanese unit on an Aleutian hex; not scored before.',
    cite: ['16.42'],
    status: (ctx) => (ctx.used.includes('alaskaScored') ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.used.includes('alaskaScored') ? 'Already scored this game.' : undefined),
  },
  {
    id: 'pw-hawaii',
    pages: ['us-political-will#occupation'],
    text: 'A Japanese unit stays on a major Hawaiian island (5708, 5808, 5908) or Midway (5108) through two consecutive US Political Will segments: US Political Will −1. Only once per game.',
    condition: 'Two consecutive US Political Will segments with a Japanese unit on those hexes; not scored before.',
    cite: ['16.42'],
    status: (ctx) => (ctx.used.includes('hawaiiScored') ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.used.includes('hawaiiScored') ? 'Already scored this game.' : undefined),
  },
  {
    id: 'pw-casualties',
    pages: ['us-political-will#casualties'],
    text: 'In an Allied offensive the whole attacking ground force was eliminated and it included a US division or corps that can receive replacements: US Political Will −1. At most once per game turn.',
    condition: 'Allies are the Offensives player, every attacking ground unit is eliminated, and at least one is a US XX or XXX unit that can receive replacements.',
    cite: ['16.45'],
    status: () => 'unknown',
  },
  {
    id: 'pw-navy',
    pages: ['us-political-will#naval'],
    text: 'At the end of the game turn: no US carrier on the map, US Political Will −1; no US naval unit of any kind either, another −1.',
    condition: 'Checked at the end of every game turn.',
    cite: ['16.46'],
    status: () => 'unknown',
  },
];
