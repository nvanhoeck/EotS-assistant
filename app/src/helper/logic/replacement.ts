import type { GameContext, Reminder, Step } from '../types';
import { answerIn, goBackIn } from './flow';
import type { Side } from './reinforcement';

export type ReplacementUnit = 'ground' | 'naval' | 'air';

export interface ReplacementAnswers {
  side?: Side;
  unitClass?: ReplacementUnit;
  state?: 'reduced' | 'eliminated';
  dotted?: 'yes' | 'no' | 'unsure';
  nationality?: 'us' | 'commonwealth' | 'chinese' | 'dutch' | 'unsure';
}
export type ReplacementKey = keyof ReplacementAnswers;
export const REPLACEMENT_ORDER: ReplacementKey[] = ['side', 'unitClass', 'state', 'dotted', 'nationality'];

export interface ReplacementQuestion {
  key: ReplacementKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

/** Whether a question is relevant given the answers before it in REPLACEMENT_ORDER. */
function applies(key: ReplacementKey, a: ReplacementAnswers): boolean {
  switch (key) {
    case 'side':
    case 'unitClass':
    case 'state':
    case 'dotted':
      return true;
    case 'nationality':
      return a.dotted !== 'yes' && a.side === 'allied';
  }
}

export function replacementQuestionFor(key: ReplacementKey, _a: ReplacementAnswers, _ctx: GameContext): ReplacementQuestion {
  switch (key) {
    case 'side':
      return { key, prompt: 'Whose unit is it?', options: [{ value: 'allied', label: 'Allied' }, { value: 'japanese', label: 'Japanese' }] };
    case 'unitClass':
      return {
        key,
        prompt: 'What kind of unit?',
        options: [{ value: 'ground', label: 'Ground' }, { value: 'naval', label: 'Naval' }, { value: 'air', label: 'Air' }],
      };
    case 'state':
      return {
        key,
        prompt: 'Where is the unit?',
        options: [
          { value: 'reduced', label: 'On the map, reduced strength (flip to full)' },
          { value: 'eliminated', label: 'In the eliminated pile (bring it back)' },
        ],
      };
    case 'dotted':
      return {
        key,
        prompt: 'Is there a single dot on the counter?',
        hint: 'Pre-War units marked with a single dot cannot receive replacements unless an event says so (11.1).',
        options: [{ value: 'yes', label: 'Yes, one dot' }, { value: 'no', label: 'No dot' }, UNSURE],
      };
    case 'nationality':
      return {
        key,
        prompt: 'Which nationality?',
        options: [
          { value: 'us', label: 'US' },
          { value: 'commonwealth', label: 'Commonwealth' },
          { value: 'chinese', label: 'Chinese' },
          { value: 'dutch', label: 'Dutch' },
          UNSURE,
        ],
      };
  }
}

export function nextReplacementQuestion(a: ReplacementAnswers, ctx: GameContext): ReplacementQuestion | undefined {
  for (const key of REPLACEMENT_ORDER) {
    if (applies(key, a) && a[key] === undefined) return replacementQuestionFor(key, a, ctx);
  }
  return undefined;
}

export function answerReplacement(a: ReplacementAnswers, key: ReplacementKey, value: string): ReplacementAnswers {
  return answerIn(REPLACEMENT_ORDER, a, key, value);
}

export function goBackReplacement(a: ReplacementAnswers): ReplacementAnswers {
  return goBackIn(REPLACEMENT_ORDER, a);
}

export type ReplacementVerdict = 'yes' | 'no' | 'depends';

export interface ReplacementResult {
  verdict: ReplacementVerdict;
  headline: string;
  /** How many replacements of this kind the player gets, and when. */
  availability: Step[];
  /** What using one on this unit costs. */
  cost: Step[];
  /** The supply or placement conditions. */
  where: Step[];
  /** Conditions only the player can judge on the board. */
  mapChecks: string[];
  notes: Step[];
  /** Helper pages that explain the placement rules in full. */
  links: string[];
}

const step = (text: string, ...cite: string[]): Step => ({ text, cite });
const empty = (): Omit<ReplacementResult, 'verdict' | 'headline'> => ({ availability: [], cost: [], where: [], mapChecks: [], notes: [], links: [] });
const refused = (headline: string, notes: Step[]): ReplacementResult => ({ ...empty(), verdict: 'no', headline, notes });

const SUPPLY_WHERE = step('The unit must be in supply and not in an un-neutralized enemy ZOI.', '11.0', '6.21');
const SUPPLY_CHECKS = ['The unit is in supply.', 'No un-neutralized enemy ZOI covers its hex.'];

function returnChecks(site: string): string[] {
  return [
    `The hex is a friendly, supply-eligible ${site}.`,
    'It is within Activation Range of a suitable HQ that started the turn on the map.',
    'No un-neutralized enemy ZOI covers the hex.',
    'Stacking limits are not exceeded.',
  ];
}

const NAVAL_US_OK = (turn: number | undefined) => turn === undefined || turn !== 1;
const NAVAL_CW_OK = (turn: number | undefined) => turn === undefined || [6, 9, 12].includes(turn);

function allied(a: ReplacementAnswers, ctx: GameContext): ReplacementResult {
  const unit = a.unitClass!;
  const reduced = a.state === 'reduced';
  const site = unit === 'air' ? 'airfield' : 'port';
  const turn = ctx.turn;
  const r = { ...empty(), verdict: 'yes' as ReplacementVerdict, headline: '' };
  const code = unit === 'ground' ? '11.31' : unit === 'air' ? '11.32' : '11.33';
  let blocked: string | undefined;

  if (unit === 'ground') {
    r.availability.push(step('The Allies receive 2 ground replacements per game turn, starting with turn 2. Use them this turn or lose them (they go to Europe).', code));
    if (turn === 1) blocked = 'No Allied ground replacements on turn 1';
  } else if (unit === 'air') {
    r.availability.push(step('The Allies receive 5 air replacements per game turn. Unused ones are lost (they go to Europe).', code));
  } else {
    if (a.nationality !== 'commonwealth') {
      r.availability.push(step('US naval replacements: 1 or 2 per turn as the Replacements Chart says, none on turn 1, and only while the Allies control Oahu (5808). Unused ones are lost.', code));
      r.mapChecks.push('The Allies control Oahu (5808).');
    }
    if (a.nationality !== 'us') {
      r.availability.push(step('Commonwealth naval replacement: 1 on game turns 6, 9 and 12, if the Allies control any one of Colombo (1307), Trincomalee (1308), Singapore (2015), Hong Kong (2709) or Townsville (3727).', code));
      r.mapChecks.push('The Allies control Colombo, Trincomalee, Singapore, Hong Kong or Townsville.');
    }
    if (a.nationality === 'us' && !NAVAL_US_OK(turn)) blocked = 'No US naval replacements on turn 1';
    else if (a.nationality === 'commonwealth' && !NAVAL_CW_OK(turn)) blocked = `Commonwealth naval replacements only come on turns 6, 9 and 12; it is turn ${turn}`;
    else if (a.nationality === 'unsure' && !NAVAL_US_OK(turn) && !NAVAL_CW_OK(turn)) blocked = 'No Allied naval replacements this turn';
  }

  if (reduced) {
    r.cost.push(step('1 replacement flips the unit to its full-strength side.', code, '11.0'));
    r.where.push(SUPPLY_WHERE);
    r.mapChecks.push(...SUPPLY_CHECKS);
    r.headline = `Eligible: 1 ${unit} replacement flips it to full strength`;
  } else {
    r.cost.push(step('1 replacement brings it back at reduced strength. 2 replacements bring it back at full strength.', code, '11.0'));
    r.where.push(
      step(
        `It returns like a reinforcement: in a friendly, supply-eligible ${site} within Activation Range of a suitable HQ, never in an un-neutralized enemy ZOI. US ground and naval units need a US or Joint HQ, Commonwealth units a Commonwealth or Joint HQ, US air units any friendly HQ.`,
        '11.0', '10.1', '6.12',
      ),
    );
    r.mapChecks.push(...returnChecks(site));
    r.links.push('reinforcements');
    r.headline = 'Eligible: 1 replacement returns it at reduced strength, 2 at full strength';
  }
  r.notes.push(step('The Allied player uses replacements first, then the Japanese player.', '11.0'));

  if (blocked) return { ...r, verdict: 'no', headline: blocked };
  return r;
}

function chinese(a: ReplacementAnswers, ctx: GameContext): ReplacementResult {
  const reduced = a.state === 'reduced';
  const r = { ...empty(), verdict: 'yes' as ReplacementVerdict, headline: '' };
  r.availability.push(step('If China has not surrendered, the Allies get 1 Chinese replacement on each odd-numbered game turn. An unused one is lost.', '11.34'));
  r.notes.push(step('Other replacements may not be used for Chinese units.', '11.34'));
  if (reduced) {
    r.cost.push(step('1 Chinese replacement flips a reduced Chinese army to full strength.', '11.34'));
    r.where.push(SUPPLY_WHERE);
    r.mapChecks.push(...SUPPLY_CHECKS);
    r.headline = 'Eligible: the Chinese replacement flips it to full strength';
  } else {
    r.cost.push(step('1 Chinese replacement brings an eliminated Chinese army back, only at reduced strength.', '11.34'));
    r.where.push(step('Place it in Kunming (2407). Kunming cannot be attacked, so it is always available, but a Chinese replacement can be placed there only if Kunming is a supply source.', '11.34', '13.75'));
    r.mapChecks.push('Kunming (2407) is a supply source (the Burma Road is open, or the HUMP is active with a supply-eligible Northern India airfield).');
    r.headline = 'Eligible: the Chinese replacement returns it to Kunming at reduced strength';
  }
  if (ctx.surrendered.includes('china')) return { ...r, verdict: 'no', headline: 'China has surrendered: no Chinese replacements' };
  if (ctx.turn !== undefined && ctx.turn % 2 === 0) {
    return { ...r, verdict: 'no', headline: `No Chinese replacement this turn: they come on odd-numbered turns, and it is turn ${ctx.turn}` };
  }
  return r;
}

function japanese(a: ReplacementAnswers): ReplacementResult {
  const unit = a.unitClass!;
  const reduced = a.state === 'reduced';
  if (unit === 'air') {
    return refused('Japan has no scheduled air replacements (event cards only)', [
      step('There are no scheduled replacements for Japanese air units. Japan gets a small number only by playing certain Event cards. They can be saved for future use.', '11.22', '11.0'),
    ]);
  }
  const r = { ...empty(), verdict: 'yes' as ReplacementVerdict, headline: '' };
  if (unit === 'ground') {
    r.availability.push(step('There are no scheduled Japanese ground replacements. In the Replacement segment Japan can take up to 2 steps from the China Divisions track; with none left it gets no ground replacements. Event cards can add more.', '11.23'));
    r.cost.push(
      reduced
        ? step('1 division from China flips a reduced unit that is in supply to full strength.', '11.23')
        : step('1 division from China brings it back at reduced strength; 2 divisions bring it back at full strength. The points must be used immediately.', '11.23'),
    );
    r.cost.push(step('At most 2 divisions per Replacement segment in total. Move the China Divisions marker down for each one taken.', '11.23'));
  } else {
    r.availability.push(step('Japan receives a limited number of naval replacement steps, as the Replacements Chart says.', '11.21'));
    r.cost.push(
      reduced
        ? step('1 naval replacement step flips a reduced naval unit to full strength.', '11.21')
        : step('An eligible eliminated naval unit comes back: 1 step returns it at reduced strength, 2 steps at full strength.', '11.21', '11.0'),
    );
    r.notes.push(step('Unused Japanese naval replacement steps are not lost: carried over from turn to turn. Track them with the naval replacement marker on the Strategic track.', '11.21'));
  }
  if (reduced) {
    r.where.push(SUPPLY_WHERE);
    r.mapChecks.push(...SUPPLY_CHECKS);
    r.headline = `Possible: costs ${unit === 'ground' ? '1 division from China' : '1 naval replacement step'} to flip it to full strength`;
  } else {
    r.where.push(step('It returns like a reinforcement: in a friendly, supply-eligible port within Activation Range of any Japanese HQ, never in an un-neutralized enemy ZOI.', '11.0', '10.1', '6.12'));
    r.mapChecks.push(...returnChecks('port'));
    r.links.push('reinforcements');
    r.headline = unit === 'ground' ? 'Possible: 1 division returns it at reduced strength, 2 at full strength' : 'Possible, if you have the naval replacement steps';
  }
  r.notes.push(step('The Allied player uses replacements first, then the Japanese player.', '11.0'));
  return r;
}

export function checkReplacement(a: ReplacementAnswers, ctx: GameContext): ReplacementResult {
  if (!a.side || !a.unitClass || !a.state) throw new Error('incomplete answers');
  if (a.dotted === 'yes') {
    return refused('This unit cannot receive replacements', [
      step('Pre-War units marked with a single dot on the front of the counter cannot accept replacements. When eliminated they are removed from the game for good.', '11.1'),
    ]);
  }
  if (a.side === 'allied' && a.nationality === 'dutch') {
    return refused('Dutch units never receive replacements', [
      step('There are no replacements for Dutch units. Once eliminated they are removed from the game for good.', '11.35'),
    ]);
  }
  const r = a.side === 'japanese' ? japanese(a) : a.nationality === 'chinese' ? chinese(a, ctx) : allied(a, ctx);

  const unsure: Step[] = [];
  if (a.dotted === 'unsure') unsure.push(step('If the counter has a single dot it cannot receive replacements at all.', '11.1'));
  if (a.nationality === 'unsure') unsure.push(step('Dutch units get no replacements, and a Chinese army uses the Chinese replacement instead.', '11.34', '11.35'));
  if (r.verdict === 'yes' && unsure.length > 0) {
    return { ...r, verdict: 'depends', headline: 'It depends on your "Not sure" answers', notes: [...unsure, ...r.notes] };
  }
  return r;
}

const odd = (turn: number) => turn % 2 === 1;

export const replacementReminders: Reminder[] = [
  {
    id: 'repl-lost',
    pages: ['replacements#general'],
    text: 'Allied replacements that are not used in the turn they arrive are lost, unless a rule or Event card says otherwise. Japanese air and naval replacements can be saved; Japanese ground replacements from China must be used immediately.',
    condition: 'Every Replacement segment.',
    cite: ['11.0', '11.21', '11.23'],
    status: () => 'unknown',
  },
  {
    id: 'repl-allotment',
    pages: ['replacements#allied-ground', 'replacements#allied-air'],
    text: 'Allied replacements each turn: 2 ground (from turn 2), 5 air, and naval ones as the Replacements Chart says. Use them in this segment or lose them.',
    condition: 'Every Replacement segment.',
    cite: ['11.31', '11.32', '11.33'],
    status: (ctx) => (ctx.turn === undefined || ctx.turn < 2 ? 'unknown' : 'applies'),
    detail(ctx) {
      if (ctx.turn === undefined) return undefined;
      return ctx.turn < 2
        ? 'On turn 1 the Allies get no ground replacements and no US naval replacements.'
        : `Turn ${ctx.turn}: 2 ground, 5 air, naval per the chart.`;
    },
  },
  {
    id: 'repl-chinese',
    pages: ['replacements#chinese', 'national-china#allied-effects'],
    text: 'One Chinese replacement on each odd-numbered turn while China has not surrendered: flip a reduced Chinese army, or bring an eliminated one back at reduced strength in Kunming (2407).',
    condition: 'Odd-numbered game turn, and China has not surrendered.',
    cite: ['11.34'],
    status(ctx) {
      if (ctx.surrendered.includes('china')) return 'notNow';
      if (ctx.turn === undefined) return 'unknown';
      return odd(ctx.turn) ? 'applies' : 'notNow';
    },
    detail(ctx) {
      if (ctx.surrendered.includes('china')) return 'China has surrendered.';
      if (ctx.turn === undefined) return undefined;
      return odd(ctx.turn) ? `Turn ${ctx.turn} is odd-numbered: you get a Chinese replacement.` : `Only on odd-numbered turns; it is turn ${ctx.turn}.`;
    },
  },
  {
    id: 'repl-cw-naval',
    pages: ['replacements#allied-naval'],
    text: 'Commonwealth naval replacement: 1 on turns 6, 9 and 12 if the Allies control Colombo (1307), Trincomalee (1308), Singapore (2015), Hong Kong (2709) or Townsville (3727).',
    condition: 'Game turn 6, 9 or 12, and the Allies control one of those hexes.',
    cite: ['11.33'],
    status(ctx) {
      if (ctx.turn === undefined) return 'unknown';
      return [6, 9, 12].includes(ctx.turn) ? 'applies' : 'notNow';
    },
    detail: (ctx) => (ctx.turn !== undefined && ![6, 9, 12].includes(ctx.turn) ? `Only on turns 6, 9 and 12; it is turn ${ctx.turn}.` : undefined),
  },
  {
    id: 'repl-oahu',
    pages: ['replacements#allied-naval'],
    text: 'US naval replacements (1 or 2 per turn as the chart says) need Oahu (5808) under Allied control, and are not given on turn 1.',
    condition: 'Every turn except turn 1, while the Allies control Oahu.',
    cite: ['11.33'],
    status: (ctx) => (ctx.turn === 1 ? 'notNow' : 'unknown'),
    detail: (ctx) => (ctx.turn === 1 ? 'No US naval replacements on turn 1.' : undefined),
  },
  {
    id: 'repl-japan-china',
    pages: ['replacements#japan-ground'],
    text: 'Japan can take up to 2 steps from the China Divisions track for ground replacements. Lower the marker by 1 for each division taken.',
    condition: 'Every Replacement segment, while Japan has divisions left in China.',
    cite: ['11.23'],
    status: () => 'unknown',
  },
];
