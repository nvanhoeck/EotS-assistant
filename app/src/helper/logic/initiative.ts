import type { Reminder, Step } from '../types';

export type Player = 'japan' | 'allies';

/** Turn 1 is December 1941; the 1942, 1943 and 1944 scenarios cover turns 2-4, 5-7 and 8-10; the campaign has 12 turns. */
export function gameYear(turn: number): number {
  if (turn <= 1) return 1941;
  if (turn <= 4) return 1942;
  if (turn <= 7) return 1943;
  if (turn <= 10) return 1944;
  return 1945;
}

/** 4.21: on a tie Japan goes first in 1941-1942, the Allies in 1943-1945. */
export function tieBreaker(turn: number | undefined): Player | undefined {
  if (turn === undefined) return undefined;
  return gameYear(turn) <= 1942 ? 'japan' : 'allies';
}

const name = (p: Player) => (p === 'japan' ? 'Japanese' : 'Allied');
const other = (p: Player): Player => (p === 'japan' ? 'allies' : 'japan');
const step = (text: string, ...cite: string[]): Step => ({ text, cite });

export interface InitiativeInput {
  japanCards: number;
  alliedCards: number;
  turn?: number;
  /** The player with fewer cards holds a designated Future Offensives card (from an earlier turn). */
  fewerHasFutureOffensive?: boolean;
}

export interface InitiativeResult {
  /** Who goes first under 4.21. Undefined only for a tie when the turn is not known. */
  first?: Player;
  tied: boolean;
  /** The player who can still take the initiative with a Future Offensives card. */
  overridableBy?: Player;
  steps: Step[];
  futureOffensive?: Step;
}

export function initiative(i: InitiativeInput): InitiativeResult {
  const steps: Step[] = [step('Count the cards in each hand. A card designated as a Future Offensives card does not count.', '4.21', '6.29')];

  if (i.japanCards !== i.alliedCards) {
    const first: Player = i.japanCards > i.alliedCards ? 'japan' : 'allies';
    const fewer = other(first);
    steps.push(step(`The ${name(first)} player has more cards (${first === 'japan' ? i.japanCards : i.alliedCards} against ${first === 'japan' ? i.alliedCards : i.japanCards}) and goes first.`, '4.21'));
    const futureOffensive = step(
      i.fewerHasFutureOffensive
        ? `The ${name(fewer)} player can still go first by playing their Future Offensives card as an EC for their first card. You said they hold one; if they do this, ${name(fewer)} goes first instead.`
        : `The ${name(fewer)} player can go first anyway by playing a designated Future Offensives card as an EC for their first card. It can only be played as an EC to win the initiative this way.`,
      '4.21', '6.29',
    );
    return { first, tied: false, overridableBy: fewer, steps, futureOffensive };
  }

  const tb = tieBreaker(i.turn);
  if (tb === undefined) {
    steps.push(step(`Tied at ${i.japanCards}. On a tie the Japanese player goes first in 1941 and 1942 (turns 1–4) and the Allied player in 1943 to 1945 (turns 5–12). Set the turn in the game status to see which applies.`, '4.21'));
    return { tied: true, steps };
  }
  steps.push(step(`Tied at ${i.japanCards}. In ${gameYear(i.turn!)} the ${name(tb)} player goes first.`, '4.21'));
  return { first: tb, tied: true, steps };
}

export const initiativeReminders: Reminder[] = [
  {
    id: 'init-tiebreak',
    pages: ['initiative#initiative'],
    text: 'On a tie in cards, the Japanese player goes first in 1941 and 1942 (turns 1–4) and the Allied player in 1943 to 1945 (turns 5–12).',
    condition: 'Both players hold the same number of Strategy cards.',
    cite: ['4.21'],
    status: (ctx) => (ctx.turn === undefined ? 'unknown' : 'applies'),
    detail(ctx) {
      const tb = tieBreaker(ctx.turn);
      if (tb === undefined || ctx.turn === undefined) return undefined;
      return `Turn ${ctx.turn} (${gameYear(ctx.turn)}): on a tie the ${name(tb)} player goes first.`;
    },
  },
  {
    id: 'init-future',
    pages: ['initiative#future'],
    text: 'A Future Offensives card does not count toward hand size or initiative. It cannot be played in the turn it was designated, nor as your last card of the Offensives phase.',
    condition: 'You or your opponent has a designated Future Offensives card.',
    cite: ['6.29'],
    status: () => 'unknown',
  },
];
