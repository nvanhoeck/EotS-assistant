import type { Reminder, Step } from '../types';
import { gameYear } from './initiative';

export type CombatKind = 'airNaval' | 'ground';

const s = (text: string, ...cite: string[]): Step => ({ text, cite });

/** The ratings of the two Combat Results Tables, as multiples of 1/4 to keep the arithmetic exact. */
function quarters(kind: CombatKind, modifiedRoll: number): number {
  if (kind === 'airNaval') {
    if (modifiedRoll <= 2) return 1; // 1/4
    if (modifiedRoll <= 5) return 2; // 1/2
    return 4; // 1 for 6-8, and for 9 or greater
  }
  if (modifiedRoll <= 2) return 2; // 1/2 (less than zero, 0, 1 or 2)
  if (modifiedRoll <= 6) return 4; // 1
  if (modifiedRoll <= 8) return 6; // 1 1/2
  return 8; // 2
}

/** 8.2 B (air-naval) and 8.4 A (ground). */
export function effectivenessRating(kind: CombatKind, modifiedRoll: number): number {
  return quarters(kind, modifiedRoll) / 4;
}

export interface CombatInput {
  kind: CombatKind;
  /** Total attack strength in the battle (an integer). */
  strength: number;
  /** The unmodified die roll, 0-9. */
  roll: number;
  /** Sum of all die roll modifiers that apply to this roll. */
  modifier: number;
}

export interface CombatResult {
  modifiedRoll: number;
  rating: number;
  hits: number;
  /** Air-naval only: an unmodified 9 (events can also give one). */
  critical: boolean;
}

export function resolveCombat(i: CombatInput): CombatResult {
  if (!Number.isInteger(i.roll) || i.roll < 0 || i.roll > 9) throw new RangeError('die roll must be a whole number from 0 to 9');
  if (!Number.isInteger(i.strength) || i.strength < 0) throw new RangeError('strength must be a whole number, 0 or more');
  const modifiedRoll = i.roll + i.modifier;
  const q = quarters(i.kind, modifiedRoll);
  return {
    modifiedRoll,
    rating: q / 4,
    hits: Math.ceil((i.strength * q) / 4),
    critical: i.kind === 'airNaval' && i.roll === 9,
  };
}

/** 8.2 A: air units using their extended range in battle count half their attack strength, rounded up. */
export function halveRoundUp(strength: number): number {
  return Math.ceil(strength / 2);
}

export interface AirNavalInput {
  /** False when no air or naval unit survives on either side. */
  anySurvivors: boolean;
  offStrength: number;
  reaStrength: number;
  reaHasAirOrCarrier: boolean;
  offHasSurvivingAirOrCarrier: boolean;
}

export type Side = 'offensives' | 'reaction';

export function airNavalWinner(i: AirNavalInput): { winner: Side; reason: Step } {
  if (!i.anySurvivors) {
    return { winner: 'offensives', reason: s('No air or naval units survive, so the result is an Offensives player victory.', '8.31') };
  }
  if (i.reaHasAirOrCarrier && !i.offHasSurvivingAirOrCarrier) {
    return {
      winner: 'reaction',
      reason: s('The Reaction player has air or carrier units and the Offensives player has no surviving air or carrier units: the Reaction player wins regardless of the attack strengths.', '8.3'),
    };
  }
  if (i.offStrength > i.reaStrength) {
    return { winner: 'offensives', reason: s(`The Offensives player has the higher total (${i.offStrength} against ${i.reaStrength}).`, '8.3') };
  }
  if (i.offStrength < i.reaStrength) {
    return { winner: 'reaction', reason: s(`The Reaction player has the higher total (${i.reaStrength} against ${i.offStrength}).`, '8.3') };
  }
  return { winner: 'reaction', reason: s(`Tied at ${i.offStrength}: in case of a tie the Reaction player wins.`, '8.3') };
}

export interface AfterAirNavalFlags {
  /** Offensive ground units entered the hex by land movement (not amphibious assault). */
  landMovedGround: boolean;
  /** Ground units of both sides remain in the hex. */
  groundRemains: boolean;
}

export function afterAirNaval(winner: Side, f: AfterAirNavalFlags): Step[] {
  if (winner === 'reaction') {
    const out = [s('The battle is concluded. Move on to any remaining battles, or to post battle movement if this was the last.', '8.32')];
    if (f.landMovedGround) {
      out.push(s('Exception: if Offensive ground units entered the hex by land movement, immediately conduct a ground battle before other battles are resolved.', '8.32', '8.13'));
    }
    out.push(s('Offensive ground units that entered by amphibious assault do not fight the ground battle at all, because the Offensives player lost the air-naval battle.', '8.13'));
    return out;
  }
  if (f.groundRemains) {
    return [
      s('Conduct the ground combat. If the Offensives player loses it, the battle is concluded and its ground units retreat or withdraw. If it wins, the battle is won and it gains control of the hex.', '8.33'),
    ];
  }
  return [s('No opposing ground units remain: the battle is won and the Offensives player gains control of the hex.', '8.33')];
}

export interface GroundInput {
  offSurvives: boolean;
  reaSurvives: boolean;
  offStepsLost: number;
  reaStepsLost: number;
}

export interface GroundResult {
  winner: Side;
  /** The side that must retreat, when both sides still have ground units. */
  retreating?: Side;
  steps: Step[];
}

const RETREAT_OFF = s('A retreating Offensive unit that entered by ground movement retreats into the hex from which it entered. One that entered by amphibious assault conducts post battle movement like a naval unit.', '8.5');
const RETREAT_REA = s('A retreating Reaction unit is moved by the Offensives player into an adjacent named location friendly to it if possible; otherwise into an adjacent hex with no Offensives unit that is not a hex an Offensives ground unit entered from. If neither is possible, or the battle hex is a one-hex island, it is eliminated.', '8.5');

/** 8.4 C */
export function groundWinner(i: GroundInput): GroundResult {
  if (!i.offSurvives && !i.reaSurvives) {
    return {
      winner: 'reaction',
      steps: [s('Both sides were eliminated. The Reaction player maintains control of the hex, but all the forces are still eliminated.', '8.4')],
    };
  }
  if (i.offSurvives && !i.reaSurvives) {
    return { winner: 'offensives', steps: [s('Only the Offensives player has ground units left: it wins and now controls the hex. Its air and naval units can use post battle movement to move there.', '8.4')] };
  }
  if (!i.offSurvives && i.reaSurvives) {
    return { winner: 'reaction', steps: [s('Only the Reaction player has ground units left: it wins and keeps control of the hex.', '8.4')] };
  }
  if (i.reaStepsLost > i.offStepsLost) {
    return {
      winner: 'offensives',
      retreating: 'reaction',
      steps: [s(`Both sides still have ground units. The Reaction player took more step losses (${i.reaStepsLost} against ${i.offStepsLost}), so its units retreat.`, '8.4'), RETREAT_REA],
    };
  }
  const tie = i.reaStepsLost === i.offStepsLost;
  return {
    winner: 'reaction',
    retreating: 'offensives',
    steps: [
      s(
        tie
          ? `Both sides still have ground units and lost the same number of steps (${i.offStepsLost}). In a tie the Reaction player wins and the Offensives player retreats.`
          : `Both sides still have ground units. The Offensives player took more step losses (${i.offStepsLost} against ${i.reaStepsLost}), so its units retreat.`,
        '8.4',
      ),
      RETREAT_OFF,
    ],
  };
}

export const battleReminders: Reminder[] = [
  {
    id: 'bat-year-mod',
    pages: ['battle#air-naval'],
    text: 'Air-naval die roll modifier for the Allied player when any US air or carrier unit is present: +1 on 1943 turns and +3 on 1944 and 1945 turns.',
    condition: 'Game turns 5 to 12, with at least one US air or aircraft carrier unit in the battle.',
    cite: ['8.2'],
    status(ctx) {
      if (ctx.turn === undefined) return 'unknown';
      return gameYear(ctx.turn) >= 1943 ? 'applies' : 'notNow';
    },
    detail(ctx) {
      if (ctx.turn === undefined) return undefined;
      const year = gameYear(ctx.turn);
      if (year < 1943) return `Only from 1943 (turn 5); it is turn ${ctx.turn} (${year}).`;
      return `Turn ${ctx.turn} (${year}): Allied air-naval die roll ${year === 1943 ? '+1' : '+3'} if any US air or carrier unit is present.`;
    },
  },
  {
    id: 'bat-order',
    pages: ['battle#sequence'],
    text: 'Each battle is two steps: air-naval combat first, then ground combat. The Offensives player chooses the order in which battle hexes are resolved.',
    condition: 'Every declared battle.',
    cite: ['8.0', '6.28'],
    status: () => 'unknown',
  },
];
