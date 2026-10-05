import type { Reminder, Step } from '../types';
import { answerIn, goBackIn } from './flow';

export interface ActivationAnswers {
  hq?: 'us' | 'commonwealth' | 'joint' | 'japanese';
  unit?: 'us' | 'commonwealth' | 'chinese' | 'dutch' | 'japanese';
  usAir?: 'yes' | 'no' | 'unsure';
  isr?: 'yes' | 'no' | 'unsure';
}
export type ActivationKey = keyof ActivationAnswers;
export const ACTIVATION_ORDER: ActivationKey[] = ['hq', 'unit', 'usAir', 'isr'];

export interface ActivationQuestion {
  key: ActivationKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

function applies(key: ActivationKey, a: ActivationAnswers): boolean {
  switch (key) {
    case 'hq':
    case 'unit':
      return true;
    case 'usAir':
      return a.hq === 'commonwealth' && a.unit === 'us';
    case 'isr':
      return (a.hq === 'us' && a.unit === 'us') || (a.hq === 'japanese' && a.unit === 'japanese');
  }
}

export function activationQuestionFor(key: ActivationKey): ActivationQuestion {
  switch (key) {
    case 'hq':
      return {
        key,
        prompt: 'Which HQ is conducting the offensive?',
        hint: 'US: Central, South, Southwest. Commonwealth: Malaya, SEAC. Joint: ANZAC, ABDA.',
        options: [
          { value: 'us', label: 'US HQ' },
          { value: 'commonwealth', label: 'Commonwealth HQ' },
          { value: 'joint', label: 'Joint HQ' },
          { value: 'japanese', label: 'Japanese HQ' },
        ],
      };
    case 'unit':
      return {
        key,
        prompt: 'Which unit do you want to activate?',
        options: [
          { value: 'us', label: 'US unit (Army or Navy)' },
          { value: 'commonwealth', label: 'Commonwealth unit' },
          { value: 'chinese', label: 'Chinese unit' },
          { value: 'dutch', label: 'Dutch unit' },
          { value: 'japanese', label: 'Japanese unit' },
        ],
      };
    case 'usAir':
      return { key, prompt: 'Is the US unit an air unit?', options: [{ value: 'yes', label: 'Yes, air' }, { value: 'no', label: 'No, ground or naval' }, UNSURE] };
    case 'isr':
      return { key, prompt: 'Is Inter-Service Rivalry in effect for that side?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, UNSURE] };
  }
}

export function nextActivationQuestion(a: ActivationAnswers): ActivationQuestion | undefined {
  for (const key of ACTIVATION_ORDER) {
    if (applies(key, a) && a[key] === undefined) return activationQuestionFor(key);
  }
  return undefined;
}

export function answerActivation(a: ActivationAnswers, key: ActivationKey, value: string): ActivationAnswers {
  return answerIn(ACTIVATION_ORDER, a, key, value);
}

export function goBackActivation(a: ActivationAnswers): ActivationAnswers {
  return goBackIn(ACTIVATION_ORDER, a);
}

/** 7.21: the Operations value or the event’s Logistics value, plus the HQ’s Efficiency rating (which 6.25 and 13.79 can modify). */
export function activatableUnits(value: number, efficiency: number): number {
  return Math.max(0, value + efficiency);
}

export type ActivationVerdict = 'yes' | 'no' | 'depends';

export interface ActivationResult {
  verdict: ActivationVerdict;
  headline: string;
  steps: Step[];
  notes: Step[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });

const HQ_LABEL = { us: 'A US HQ', commonwealth: 'A Commonwealth HQ', joint: 'A Joint HQ', japanese: 'A Japanese HQ' } as const;
const UNIT_LABEL = { us: 'US units', commonwealth: 'Commonwealth units', chinese: 'Chinese units', dutch: 'Dutch units', japanese: 'Japanese units' } as const;

const CONDITIONS: Step[] = [
  s('The unit must be in supply and have an unblocked activation path from the HQ to the unit, no longer than the HQ’s Command Range (opposing air ZOI and enemy-occupied hexes can block the path).', '7.21', '6.3'),
  s('Event card text can override the HQ nationality limits.', '7.21'),
];
const DUTCH_NOTE = s('Only Joint HQs can activate Dutch units.', '7.21', '6.12');

export function checkActivation(a: ActivationAnswers): ActivationResult {
  if (nextActivationQuestion(a)) throw new Error('incomplete answers');
  const hq = a.hq!;
  const unit = a.unit!;

  let allowed: boolean | 'maybe';
  let rule: Step;
  if (hq === 'japanese') {
    allowed = unit === 'japanese';
    rule = s('Japanese HQs can activate any Japanese unit, and nothing else.', '7.21', '6.12');
  } else if (unit === 'japanese') {
    allowed = false;
    rule = s('Allied HQs can only activate Allied units.', '7.21');
  } else if (hq === 'joint') {
    allowed = true;
    rule = s('Joint HQs can activate any Allied unit.', '7.21');
  } else if (hq === 'us') {
    allowed = unit === 'us' || unit === 'chinese';
    rule = s('US HQs can activate US units (both Army and Navy) and Chinese units.', '7.21');
  } else {
    // Commonwealth HQ
    if (unit === 'us') allowed = a.usAir === 'yes' ? true : a.usAir === 'no' ? false : 'maybe';
    else allowed = unit === 'commonwealth' || unit === 'chinese';
    rule = s('Commonwealth HQs can activate Commonwealth units, Chinese units, and US air units (both Army and Marine air units).', '7.21');
  }

  const notes: Step[] = [];
  if (unit === 'chinese') notes.push(s('Chinese Army units can be activated by any Allied HQ in range.', '13.75'));
  if (unit === 'dutch') {
    notes.push(DUTCH_NOTE);
  }

  let verdict: ActivationVerdict = allowed === 'maybe' ? 'depends' : allowed ? 'yes' : 'no';

  if (verdict === 'yes' && a.isr !== undefined) {
    if (a.isr === 'unsure') {
      verdict = 'depends';
      notes.push(s('If Inter-Service Rivalry is in effect, this HQ can activate only one of the two kinds of unit in an offensive.', hq === 'us' ? '14.1' : '14.2'));
    } else if (a.isr === 'yes') {
      notes.push(
        hq === 'us'
          ? s('Inter-Service Rivalry: a US HQ cannot activate both US Army units and US Navy units in the same offensive or in reaction to it: only US Army units OR US Navy units, though other Allied units are not restricted.', '14.1')
          : s('Inter-Service Rivalry: a Japanese HQ cannot activate both army and naval units in the same offensive or in reaction to it.', '14.2'),
      );
    }
  }

  const headline =
    verdict === 'depends'
      ? 'It depends on your “Not sure” answer'
      : verdict === 'yes'
        ? `${HQ_LABEL[hq]} can activate ${UNIT_LABEL[unit]}`
        : `${HQ_LABEL[hq]} cannot activate ${UNIT_LABEL[unit]}`;

  return { verdict, headline, steps: [rule, ...(verdict === 'no' ? [] : CONDITIONS)].concat(verdict === 'no' ? [CONDITIONS[1]] : []), notes };
}

export const offensiveReminders: Reminder[] = [
  {
    id: 'off-battle-hexes',
    pages: ['offensives#declare'],
    text: 'An OC offensive can declare only one battle hex (a Special Reaction can add more). An EC offensive can declare any number. Any hex with both Offensive and Reaction units, including HQs, must be a battle hex.',
    condition: 'After Offensive movement, when you declare battle hexes.',
    cite: ['7.24', '7.1'],
    status: () => 'unknown',
  },
  {
    id: 'off-air-first',
    pages: ['offensives#movement'],
    text: 'Move air and carrier units first to neutralize opposing air ZOI, so ground units can move with fewer limits. Moving ground units first can block amphibious assaults and strategic movement.',
    condition: 'Before moving amphibious or strategic units into the area of an opposing air ZOI.',
    cite: ['7.23', '6.4'],
    status: () => 'unknown',
  },
  {
    id: 'off-surprise',
    pages: ['offensives#reaction'],
    text: 'Surprise Attack: there is no Reaction move and the Offensives player resolves the battles (after the Reaction player has had a chance to play Attack cards). Only with Intercept or Ambush can the Reaction player activate units, through one in-supply HQ, with at most one ASP.',
    condition: 'After the intelligence condition is settled.',
    cite: ['7.26', '7.2'],
    status: () => 'unknown',
  },
];
