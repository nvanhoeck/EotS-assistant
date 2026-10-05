import type { GameContext, NationId, Reminder, Step } from '../types';
import { ALL_SURRENDERED_PW, SURRENDER_PW } from './politicalWill';

export type SurrenderTarget = 'philippines' | 'malaya' | 'dei' | 'burma' | 'australia' | 'japan';

export interface Condition {
  text: string;
  cite: string[];
}

export interface SurrenderRule {
  id: SurrenderTarget;
  label: string;
  /** Japan surrenders on either of its two conditions; every other nation needs all of them. */
  mode: 'all' | 'any';
  conditions: Condition[];
  /** What happens to units and bases, beyond the general rule. */
  consequences: Step[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });
const c = (text: string, ...cite: string[]): Condition => ({ text, cite });

export const SURRENDER_RULES: SurrenderRule[] = [
  {
    id: 'philippines',
    label: 'The Philippines',
    mode: 'all',
    conditions: [c('Japan controls Manila (2813).', '13.22'), c('Japan controls Davao (2915).', '13.22')],
    consequences: [
      s('Remove all Allied ground units in Philippine hexes from play in the National Status segment. A unit that is eligible to return (such as a US HQ) comes back through the reinforcement and HQ rules.', '13.22'),
      s('Any US air or naval units in Philippine hexes must use an Emergency Air or Naval move to leave. Non-US air and naval units there are eliminated.', '13.22'),
    ],
  },
  {
    id: 'malaya',
    label: 'Malaya',
    mode: 'all',
    conditions: [c('Japan controls Singapore (2015).', '13.32'), c('Japan controls Kuantan (2014).', '13.32')],
    consequences: [s('No Allied units are removed from play and no hex control changes when Malaya surrenders.', '13.32')],
  },
  {
    id: 'dei',
    label: 'The Dutch East Indies',
    mode: 'all',
    conditions: [
      c('Japan controls the seven resource spaces on Sumatra, Borneo and Java.', '13.42', '12.11'),
      c('Japan controls Tjilatjap (2019).', '13.42'),
    ],
    consequences: [
      s('All Dutch units are removed from play in the National Status segment.', '13.42'),
      s('Japan now controls all Dutch airfields and ports that do not contain US or Commonwealth ground units (an HQ alone does not count).', '13.42'),
      s('Allied air or naval units in the hexes Japan gains must immediately use air-naval emergency movement to leave the Dutch East Indies.', '13.42'),
    ],
  },
  {
    id: 'burma',
    label: 'Burma',
    mode: 'all',
    conditions: [
      c('Japan controls Rangoon (2008).', '13.52'),
      c('Japan controls Mandalay (2106).', '13.52'),
      c('Japan controls Lashio (2206).', '13.52'),
      c('Japan controls Myitkyina (2305).', '13.52'),
    ],
    consequences: [
      s('Remove all Commonwealth units that have Burma (B) in their unit designation from play in the National Status segment.', '13.52'),
      s('No hexes change control due to Burma’s surrender.', '13.52'),
    ],
  },
  {
    id: 'australia',
    label: 'Australia',
    mode: 'all',
    conditions: [c('Every Australian coastal airfield and port on mainland Australia (not the Mandates) is Japanese controlled.', '13.82')],
    consequences: [
      s('Australian units already in play are unaffected and stay available to the Allied player.', '13.82'),
      s('Australian reinforcements that would arrive after the surrender are permanently lost. Reduced Australian units on the map can still receive replacements, but if eliminated they are removed from the game.', '13.83'),
      s('Allied units can later regain the mainland hexes and use them, but that does not undo the surrender.', '13.83'),
    ],
  },
  {
    id: 'japan',
    label: 'Japan',
    mode: 'any',
    conditions: [
      c('All hexes on Honshu are Allied controlled.', '13.93'),
      c('No ultimate Japanese supply source can trace a path to a resource hex, for three consecutive National Status segments (traced like a supply line).', '13.93'),
    ],
    consequences: [s('The game is over and the Allied player wins.', '13.1', '13.93', '16.1')],
  },
];

export const ruleFor = (id: SurrenderTarget): SurrenderRule => SURRENDER_RULES.find((r) => r.id === id)!;

export interface SurrenderCheck {
  status: 'surrenders' | 'notYet' | 'already' | 'gameOver';
  headline: string;
  missing: Condition[];
  consequences: Step[];
  /** Effects on US Political Will and the Allied card draw. */
  effects: Step[];
}

const GENERAL: Step = s('Japan automatically gains control of all of the nation’s on-map airfields and ports that are not occupied by Allied units.', '13.1');

function effectsOf(id: SurrenderTarget, ctx: GameContext): Step[] {
  const out: Step[] = [];
  const pw = SURRENDER_PW.find((e) => e.id === id);
  if (pw) {
    out.push(s(`US Political Will −${pw.value}.${pw.recapture ? ' The value is given back if the Allies later recapture the nation.' : ''}`, '16.41'));
  }
  if (id === 'australia') {
    out.push(s('The Allied card draw is one card fewer, and the Allies gain a pass per card lost (up to two). It does not recover if Australia is recaptured.', '12.52', '13.1'));
  }
  const listed = SURRENDER_PW.map((e) => e.id as NationId);
  if (listed.every((n) => n === id || ctx.surrendered.includes(n))) {
    out.push(s(`Every nation on the list has now surrendered: US Political Will drops another −${ALL_SURRENDERED_PW}.`, '16.41'));
  }
  return out;
}

export function checkSurrender(id: SurrenderTarget, checked: boolean[], ctx: GameContext): SurrenderCheck {
  const rule = ruleFor(id);
  if (id !== 'japan' && ctx.surrendered.includes(id as NationId)) {
    return {
      status: 'already',
      headline: `${rule.label} has already surrendered`,
      missing: [],
      consequences: [
        s('An Allied nation can only surrender once per game.', '13.1'),
        s('If the Allies recapture the locations Japan had to capture, they regain control of the nation’s airfields and ports, except hexes with a Japanese unit of any type. Those stay Japanese until evacuated or abandoned.', '13.1'),
      ],
      effects: [],
    };
  }
  const met = rule.conditions.map((_, i) => !!checked[i]);
  const done = rule.mode === 'all' ? met.every(Boolean) : met.some(Boolean);
  const missing = rule.conditions.filter((_, i) => !met[i]);
  if (!done) {
    return { status: 'notYet', headline: `${rule.label} does not surrender yet`, missing, consequences: [], effects: [] };
  }
  if (id === 'japan') {
    return { status: 'gameOver', headline: 'Japan surrenders: the game is over and the Allies win', missing: [], consequences: rule.consequences, effects: [] };
  }
  return {
    status: 'surrenders',
    headline: `${rule.label} surrenders`,
    missing: [],
    // Malaya and Burma are the exceptions: no hexes change control (13.32, 13.52).
    consequences: id === 'malaya' || id === 'burma' ? rule.consequences : [GENERAL, ...rule.consequences],
    effects: effectsOf(id, ctx),
  };
}

export const nationalStatusReminders: Reminder[] = [
  {
    id: 'ns-segment',
    pages: ['national-status#general'],
    text: 'National Status segment: first settle who controls each hex, then check each nation’s surrender conditions. Allied nations surrender once only.',
    condition: 'Every National Status segment.',
    cite: ['4.31', '13.1', '6.5'],
    links: ['us-political-will'],
    status: () => 'unknown',
  },
];
