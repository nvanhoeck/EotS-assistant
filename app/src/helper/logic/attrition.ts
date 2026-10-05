import type { Reminder, Step } from '../types';
import { answerIn, goBackIn } from './flow';

export interface AttritionAnswers {
  unitClass?: 'ground' | 'air' | 'naval';
  supplied?: 'yes' | 'no' | 'unsure';
  emergency?: 'yes' | 'no';
  strength?: 'full' | 'reduced' | 'oneSided';
  hqRange?: 'yes' | 'no' | 'unsure';
}
export type AttritionKey = keyof AttritionAnswers;
export const ATTRITION_ORDER: AttritionKey[] = ['unitClass', 'supplied', 'emergency', 'strength', 'hqRange'];

export interface AttritionQuestion {
  key: AttritionKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

function applies(key: AttritionKey, a: AttritionAnswers): boolean {
  const unsupplied = a.unitClass !== 'naval' && a.supplied === 'no';
  switch (key) {
    case 'unitClass':
      return true;
    case 'supplied':
      return a.unitClass !== 'naval';
    case 'emergency':
      return unsupplied;
    case 'strength':
      return unsupplied && a.emergency === 'no';
    case 'hqRange':
      return unsupplied && a.emergency === 'no' && (a.strength === 'reduced' || a.strength === 'oneSided');
  }
}

export function attritionQuestionFor(key: AttritionKey): AttritionQuestion {
  switch (key) {
    case 'unitClass':
      return {
        key,
        prompt: 'What kind of unit?',
        options: [{ value: 'ground', label: 'Ground' }, { value: 'air', label: 'Air' }, { value: 'naval', label: 'Naval' }],
      };
    case 'supplied':
      return {
        key,
        prompt: 'Is the unit supplied?',
        hint: 'A unit is supplied if an unblocked supply path of the right length runs from a supplied activating HQ (see the Supply page).',
        options: [{ value: 'yes', label: 'Yes, supplied' }, { value: 'no', label: 'No, unsupplied' }, UNSURE],
      };
    case 'emergency':
      return {
        key,
        prompt: 'Is it in a hex with an emergency supply route?',
        hint: 'The China Airlift (the Hump) to Kunming, or the Tokyo Express marker.',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
      };
    case 'strength':
      return {
        key,
        prompt: 'Which side is up?',
        options: [
          { value: 'full', label: 'Full strength' },
          { value: 'reduced', label: 'Reduced strength' },
          { value: 'oneSided', label: 'A one-sided unit (for example Dutch regiments, the US Marine Wake unit)' },
        ],
      };
    case 'hqRange':
      return {
        key,
        prompt: 'Is it within range of any friendly HQ?',
        hint: 'The HQ can be supplied or not. Enemy units, opposing ZOI and unplayable hexsides do not block the path.',
        options: [{ value: 'yes', label: 'Yes, in range' }, { value: 'no', label: 'No, out of range' }, UNSURE],
      };
  }
}

export function nextAttritionQuestion(a: AttritionAnswers): AttritionQuestion | undefined {
  for (const key of ATTRITION_ORDER) {
    if (applies(key, a) && a[key] === undefined) return attritionQuestionFor(key);
  }
  return undefined;
}

export function answerAttrition(a: AttritionAnswers, key: AttritionKey, value: string): AttritionAnswers {
  return answerIn(ATTRITION_ORDER, a, key, value);
}

export function goBackAttrition(a: AttritionAnswers): AttritionAnswers {
  return goBackIn(ATTRITION_ORDER, a);
}

export type AttritionOutcome = 'none' | 'flip' | 'stay' | 'eliminated' | 'depends';

export interface AttritionResult {
  outcome: AttritionOutcome;
  headline: string;
  steps: Step[];
  mapChecks: string[];
  notes: Step[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });
const SIMULTANEOUS = s('Attrition is calculated and applied to all units at the same time, so opposing units can attrit each other.', '6.24');

export function checkAttrition(a: AttritionAnswers): AttritionResult {
  if (nextAttritionQuestion(a)) throw new Error('incomplete answers');
  const r = (outcome: AttritionOutcome, headline: string, steps: Step[], mapChecks: string[] = []): AttritionResult => ({
    outcome, headline, steps, mapChecks, notes: [SIMULTANEOUS],
  });

  if (a.unitClass === 'naval') {
    return r('none', 'No effect: naval units are not affected by attrition', [s('Naval units are not affected by attrition.', '4.4', '6.24')]);
  }
  if (a.supplied === 'yes') {
    return r('none', 'No effect: the unit is supplied', [s('Only unsupplied ground and air units suffer attrition.', '4.4', '6.24')]);
  }
  if (a.supplied === 'unsure') {
    return r('depends', 'It depends on whether the unit is supplied', [
      s('If it is supplied: no effect.', '4.4'),
      s('If it is not supplied and at full strength: flip it to its reduced side.', '6.24'),
      s('If it is not supplied and already reduced: it stays reduced if within range of any friendly HQ, otherwise it is eliminated.', '6.24'),
      s('An emergency supply route (China Airlift, Tokyo Express) in its hex prevents attrition.', '6.24'),
    ]);
  }
  if (a.emergency === 'yes') {
    return r('none', 'No effect: an emergency supply route covers the hex', [
      s('An emergency supply route (the China Airlift, or the Tokyo Express) prevents attrition in the affected hex.', '6.24', '6.23'),
    ]);
  }
  if (a.strength === 'full') {
    return r('flip', 'Flip it to its reduced side', [s('An unsupplied full-strength air or ground unit is flipped to its reduced strength side.', '4.4', '6.24')]);
  }

  const oneSided = a.strength === 'oneSided';
  const reducedNote = oneSided ? [s('A unit with only one side is considered to be on its reduced side.', '6.24')] : [];
  const check = ['Count from any friendly HQ (supplied or not) to the unit. Enemy units, opposing ZOI and unplayable hexsides do not block the path.'];
  if (a.hqRange === 'yes') {
    return r('stay', 'It stays on its reduced side', [
      s('An unsupplied reduced unit within range of any friendly HQ stays reduced, whether or not the HQ is supplied.', '6.24'),
      ...reducedNote,
    ], check);
  }
  if (a.hqRange === 'no') {
    return r('eliminated', 'It is eliminated', [
      s('An unsupplied reduced unit that is not within range of any friendly HQ is eliminated.', '4.4', '6.24'),
      ...reducedNote,
    ], check);
  }
  return r('depends', 'It depends on the HQ range', [
    s('Within range of any friendly HQ: it stays reduced.', '6.24'),
    s('Out of range of every friendly HQ: it is eliminated.', '6.24'),
    ...reducedNote,
  ], check);
}

export const attritionReminders: Reminder[] = [
  {
    id: 'attr-rules',
    pages: ['attrition#rules'],
    text: 'Attrition: every ground and air unit checks its supply. Unsupplied full-strength units flip to reduced. Unsupplied reduced units are eliminated unless within range of a friendly HQ. Naval units are unaffected.',
    condition: 'Every Attrition phase.',
    cite: ['4.4', '6.24'],
    links: ['supply'],
    status: () => 'unknown',
  },
  {
    id: 'attr-tokyo-express',
    pages: ['attrition#rules'],
    text: 'The Tokyo Express marker stays in its hex until the hex becomes Allied controlled, another Japanese card moves it, or the game turn ends. Air, ground and naval units (not HQs) in its hex are in supply, and it prevents attrition there.',
    condition: 'A Tokyo Express marker is on the map.',
    cite: ['6.23', '6.24'],
    status: () => 'unknown',
  },
];
