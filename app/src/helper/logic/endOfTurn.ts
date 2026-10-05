import type { GameContext, Reminder, Step } from '../types';
import { answerIn, goBackIn } from './flow';

export interface EndAnswers {
  japanSurrendered?: 'yes' | 'no';
  pwZero?: 'yes' | 'no' | 'unsure';
  lastTurn?: 'yes' | 'no' | 'unsure';
}
export type EndKey = keyof EndAnswers;
export const END_ORDER: EndKey[] = ['japanSurrendered', 'pwZero', 'lastTurn'];

export interface EndQuestion {
  key: EndKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

/** Last game turn of each scenario, from the scenario rules in section 17. */
const LAST_TURNS: Record<number, string> = {
  4: 'the 1942 scenario',
  7: 'the 1943 scenario (and the 1942–1943 scenario)',
  10: 'the 1944 scenario',
};

function applies(key: EndKey, a: EndAnswers): boolean {
  switch (key) {
    case 'japanSurrendered':
      return true;
    case 'pwZero':
      return a.japanSurrendered === 'no';
    case 'lastTurn':
      return a.japanSurrendered === 'no' && a.pwZero !== 'yes' && a.pwZero !== undefined;
  }
}

export function endQuestionFor(key: EndKey, ctx: GameContext): EndQuestion {
  switch (key) {
    case 'japanSurrendered':
      return { key, prompt: 'Has Japan surrendered?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] };
    case 'pwZero':
      return {
        key,
        prompt: 'Is the US Political Will marker in the Negotiations (Zero) box?',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, UNSURE],
      };
    case 'lastTurn': {
      let hint = 'Last turns: full Campaign: turn 12. Yearly scenarios: 1942 turn 4, 1943 turn 7, 1944 turn 10.';
      if (ctx.turn === 12) hint = 'Game status says turn 12: turn 12 is the last turn of the full Campaign.';
      else if (ctx.turn !== undefined && LAST_TURNS[ctx.turn]) {
        hint = `Game status says turn ${ctx.turn}: that is the last turn of ${LAST_TURNS[ctx.turn]}, but not of the full Campaign (turn 12).`;
      }
      return { key, prompt: 'Is this the last turn of your scenario?', hint, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, UNSURE] };
    }
  }
}

export function nextEndQuestion(a: EndAnswers, ctx: GameContext): EndQuestion | undefined {
  for (const key of END_ORDER) {
    if (applies(key, a) && a[key] === undefined) return endQuestionFor(key, ctx);
  }
  return undefined;
}

export function answerEnd(a: EndAnswers, key: EndKey, value: string): EndAnswers {
  return answerIn(END_ORDER, a, key, value);
}

export function goBackEnd(a: EndAnswers): EndAnswers {
  return goBackIn(END_ORDER, a);
}

export type EndOutcome = 'alliesWin' | 'japanWins' | 'scoreGame' | 'continue' | 'depends';

export interface EndResult {
  outcome: EndOutcome;
  headline: string;
  steps: Step[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });

const HOUSEKEEPING: Step[] = [
  s('Advance the game turn marker and start a new game turn.', '4.5'),
  s('Flip or remove the markers the rules call for: for example flip a China Offensive marker to its other side, and remove the Tokyo Express marker.', '4.5', '13.31'),
  s('Reset the Amphibious Shipping Point used markers to the full level.', '9.3'),
  s('Any HQ on the game turn record track returns in the next Reinforcement segment as a normal reinforcement.', '7.54', '7.56'),
];

export function checkEndOfTurn(a: EndAnswers): EndResult {
  if (a.japanSurrendered === undefined) throw new Error('incomplete answers');
  if (a.japanSurrendered === 'yes') {
    return { outcome: 'alliesWin', headline: 'The game ends: the Allies win', steps: [s('If Japan surrenders the game ends immediately and the Allied player wins.', '16.1', '4.5')] };
  }
  if (a.pwZero === undefined) throw new Error('incomplete answers');
  if (a.pwZero === 'yes') {
    return {
      outcome: 'japanWins',
      headline: 'The game ends: Japan wins',
      steps: [s('If the US Political Will marker is in the Zero (Negotiations) box in any End of Turn phase, the game ends and the Japanese player wins.', '4.5', '16.1')],
    };
  }
  if (a.lastTurn === undefined) throw new Error('incomplete answers');
  if (a.pwZero === 'unsure' || a.lastTurn === 'unsure') {
    return {
      outcome: 'depends',
      headline: 'It depends on your “Not sure” answers',
      steps: [
        s('Negotiations box (Zero): Japan wins at once.', '16.1'),
        s('Last turn of the scenario: decide the winner by the victory conditions.', '4.5'),
        s('Otherwise: advance the turn marker and tidy up.', '4.5'),
      ],
    };
  }
  if (a.lastTurn === 'yes') {
    return {
      outcome: 'scoreGame',
      headline: 'Last turn: work out the winner',
      steps: [
        s('Full Campaign (turn 12): the Allies win only if Japan has been successfully strategically bombed on four consecutive turns, has 1 or zero resource hexes, and a B-29 is in range of Tokyo, or Japan has surrendered. Otherwise Japan wins.', '16.2', '16.3'),
        s('Yearly scenarios (1942, 1943, 1944): the Japanese gain victory points listed in the scenario rules. Allied Decisive: 2 or less. Allied Tactical: 3 to 5. Japanese Tactical: 6 to 9. Japanese Decisive: 10 or more.', '17.27', '17.38', '17.48'),
      ],
    };
  }
  return { outcome: 'continue', headline: 'The game goes on: tidy up and start the next turn', steps: HOUSEKEEPING };
}

export const endOfTurnReminders: Reminder[] = [
  {
    id: 'eot-negotiations',
    pages: ['end-of-turn#checks'],
    text: 'Check the US Political Will marker first: in the Zero (Negotiations) box at the End of Turn phase, the game ends and Japan wins.',
    condition: 'Every End of Turn phase.',
    cite: ['4.5', '16.1'],
    links: ['us-political-will'],
    status: () => 'unknown',
  },
  {
    id: 'eot-last-turn',
    pages: ['end-of-turn#victory'],
    text: 'On the last turn of the game, decide the winner. Full Campaign (turn 12): the Allies win only with four consecutive successful strategic bombings, 1 or zero Japanese resource hexes, and a B-29 in range of Tokyo, or if Japan surrendered; otherwise Japan wins.',
    condition: 'The last game turn of the scenario being played.',
    cite: ['16.2', '16.3', '4.5'],
    status: (ctx) => (ctx.turn === 12 ? 'applies' : 'unknown'),
    detail(ctx) {
      if (ctx.turn === 12) return 'Turn 12 is the last turn of the full Campaign.';
      if (ctx.turn !== undefined && LAST_TURNS[ctx.turn]) return `Turn ${ctx.turn} is the last turn of ${LAST_TURNS[ctx.turn]}, but not of the full Campaign.`;
      return undefined;
    },
  },
  {
    id: 'eot-markers',
    pages: ['end-of-turn#markers'],
    text: 'Flip or remove markers as the rules indicate: a China Offensive marker goes to its other side, and the Tokyo Express marker is removed when the game turn ends.',
    condition: 'Every End of Turn phase.',
    cite: ['4.5', '13.31'],
    status: () => 'unknown',
  },
];
