import type { GameContext, Reminder, Step } from '../types';

export type Side = 'allied' | 'japanese';
export type UnitClass = 'ground' | 'naval' | 'air' | 'hq';

export interface ReinforcementAnswers {
  side?: Side;
  unitClass?: UnitClass;
  nationality?: 'us' | 'commonwealth' | 'chinese' | 'unsure';
  b29?: 'yes' | 'no' | 'unsure';
  service?: 'army' | 'marine' | 'navy' | 'unsure';
  ship?: 'cve' | 'other' | 'unsure';
  delayed?: 'yes' | 'no' | 'unsure';
}
export type QuestionKey = keyof ReinforcementAnswers;
export const QUESTION_ORDER: QuestionKey[] = ['side', 'unitClass', 'nationality', 'b29', 'service', 'ship', 'delayed'];

export interface Question {
  key: QuestionKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

/** Whether a question is relevant given the answers before it in QUESTION_ORDER. */
function applies(key: QuestionKey, a: ReinforcementAnswers): boolean {
  const allied = a.side === 'allied';
  switch (key) {
    case 'side':
    case 'unitClass':
      return true;
    case 'nationality':
      return allied && a.unitClass !== 'hq';
    case 'b29':
      return allied && a.unitClass === 'air' && a.nationality === 'us';
    case 'service':
      return allied && a.nationality === 'us' && a.unitClass !== 'naval' && a.unitClass !== 'hq' && a.b29 !== 'yes';
    case 'ship':
      return allied && a.nationality === 'us' && a.unitClass === 'naval';
    case 'delayed':
      return allied && a.nationality !== 'chinese' && a.unitClass !== 'hq' && a.b29 !== 'yes';
  }
}

function delayHint(ctx: GameContext): string {
  if (ctx.wieLevel === undefined) return 'Delays come from War in Europe level 1+, an event, or Inter-Service Rivalry (9.21).';
  if (ctx.wieLevel === 0) return 'War in Europe has no effect. Only an event or Inter-Service Rivalry would still delay them (9.21).';
  return `War in Europe is at level ${ctx.wieLevel}, which delays all Allied reinforcements this turn (9.21).`;
}

export function questionFor(key: QuestionKey, _a: ReinforcementAnswers, ctx: GameContext): Question {
  switch (key) {
    case 'side':
      return { key, prompt: 'Whose unit is it?', options: [{ value: 'allied', label: 'Allied' }, { value: 'japanese', label: 'Japanese' }] };
    case 'unitClass':
      return {
        key,
        prompt: 'What kind of unit?',
        options: [
          { value: 'ground', label: 'Ground' },
          { value: 'naval', label: 'Naval' },
          { value: 'air', label: 'Air' },
          { value: 'hq', label: 'HQ' },
        ],
      };
    case 'nationality':
      return {
        key,
        prompt: 'Which nationality?',
        options: [
          { value: 'us', label: 'US' },
          { value: 'commonwealth', label: 'Commonwealth' },
          { value: 'chinese', label: 'Chinese (placed as if a reinforcement)' },
          UNSURE,
        ],
      };
    case 'b29':
      return {
        key,
        prompt: 'Is it a B-29 (20th or 21st Bomber Command)?',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, UNSURE],
      };
    case 'service':
      return {
        key,
        prompt: 'Which US service?',
        options: [
          { value: 'army', label: 'Army (blue)' },
          { value: 'marine', label: 'Marines' },
          { value: 'navy', label: 'Navy' },
          UNSURE,
        ],
      };
    case 'ship':
      return {
        key,
        prompt: 'Which ship type?',
        options: [{ value: 'cve', label: 'CVE (escort carrier)' }, { value: 'other', label: 'CV, CVL or any other ship' }, UNSURE],
      };
    case 'delayed':
      return {
        key,
        prompt: "Are this turn's Allied reinforcements being delayed?",
        hint: delayHint(ctx),
        options: [{ value: 'yes', label: 'Yes, delayed' }, { value: 'no', label: 'No, placed normally' }, UNSURE],
      };
  }
}

export function nextQuestion(a: ReinforcementAnswers, ctx: GameContext): Question | undefined {
  for (const key of QUESTION_ORDER) {
    if (applies(key, a) && a[key] === undefined) return questionFor(key, a, ctx);
  }
  return undefined;
}

/** Sets one answer and forgets every answer after it, which may no longer apply. */
export function answerQuestion(a: ReinforcementAnswers, key: QuestionKey, value: string): ReinforcementAnswers {
  const out: ReinforcementAnswers = {};
  for (const k of QUESTION_ORDER) {
    if (k === key) {
      (out as Record<string, string>)[k] = value;
      break;
    }
    if (a[k] !== undefined) (out as Record<string, string>)[k] = a[k] as string;
  }
  return out;
}

export function goBack(a: ReinforcementAnswers): ReinforcementAnswers {
  const out: ReinforcementAnswers = { ...a };
  for (const k of [...QUESTION_ORDER].reverse()) {
    if (out[k] !== undefined) {
      delete out[k];
      break;
    }
  }
  return out;
}

export type Verdict = 'place' | 'delay' | 'depends';

export interface SentToEurope {
  eligible: 'yes' | 'no' | 'maybe';
  range: string;
  text: string;
}

export interface ReinforcementResult {
  verdict: Verdict;
  headline: string;
  doFirst: Step[];
  where: Step[];
  restrictions: Step[];
  notes: Step[];
  /** Conditions only the player can judge on the board. */
  mapChecks: string[];
  sentToEurope?: SentToEurope;
}

const RANGES = ['no die roll', '0–1', '0–3', '0–5', '0–7'];

function steRange(level: number | undefined): string {
  if (level === undefined) return 'No die roll at no effect; level 1: 0–1; level 2: 0–3; level 3: 0–5; level 4: 0–7.';
  if (level === 0) return 'War in Europe has no effect: no die roll.';
  return `War in Europe level ${level}: sent to Europe on a roll of ${RANGES[level]}.`;
}

function steEligibility(a: ReinforcementAnswers): 'yes' | 'no' | 'maybe' {
  if (a.unitClass === 'hq' || a.b29 === 'yes') return 'no';
  if (a.nationality === 'commonwealth') return 'no';
  if (a.nationality === 'unsure') return 'maybe';
  if (a.unitClass === 'naval') return a.ship === 'cve' ? 'yes' : a.ship === 'other' ? 'no' : 'maybe';
  if (a.b29 === 'unsure') return 'maybe';
  return a.service === 'army' ? 'yes' : a.service === 'marine' || a.service === 'navy' ? 'no' : 'maybe';
}

function steInfo(a: ReinforcementAnswers, ctx: GameContext): SentToEurope {
  const eligible = steEligibility(a);
  const text =
    eligible === 'no'
      ? 'Not eligible: only US Army ground and air units and US CVE escort carriers can be sent to Europe.'
      : eligible === 'maybe'
        ? 'Depends on your "Not sure" answers: US Army ground and air units and US CVEs roll; every other unit is exempt.'
        : 'Roll one die for this unit as it enters the box. If the roll is in range it leaves play and returns as a reinforcement 3 turns later. This can happen more than once.';
  return { eligible, range: steRange(ctx.wieLevel), text };
}

const RESTRICTIONS: Step[] = [
  { text: 'Never place a reinforcement in an un-neutralized enemy ZOI.', cite: ['9.1', '7.35'] },
  { text: 'The HQ you place from must have started the turn on the map. An HQ arriving this turn can place reinforcements only in its own hex.', cite: ['9.1'] },
  { text: 'Placing a reinforcement cannot change enemy ZOI to make another placement legal.', cite: ['9.1'] },
  { text: 'Stacking and placement limits still apply.', cite: ['9.1'] },
];
const restrictionsFor = (hq: boolean): Step[] => (hq ? [RESTRICTIONS[0], RESTRICTIONS[2], RESTRICTIONS[3]] : RESTRICTIONS);

function mapChecksFor(site: string, hq: boolean): string[] {
  const checks = [`The hex is a friendly, supply-eligible ${site}.`];
  if (!hq) checks.push('It is within Activation Range of an HQ that can activate this unit, and that HQ started the turn on the map.');
  checks.push('No un-neutralized enemy ZOI covers the hex.', 'Stacking limits are not exceeded.');
  return checks;
}

const US_HQ = 'a US or Joint HQ (US: Central, South, Southwest; Joint: ANZAC, ABDA)';
const CW_HQ = 'a Commonwealth or Joint HQ (Commonwealth: Malaya, SEAC; Joint: ANZAC, ABDA)';

function alliedWhere(a: ReinforcementAnswers, site: string): Step[] {
  const place = (who: string) => `in a friendly, supply-eligible ${site} within Activation Range of ${who} that can activate it.`;
  const usWho = a.unitClass === 'air' ? 'any friendly HQ' : US_HQ;
  switch (a.nationality) {
    case 'us':
      return [{ text: `Place it ${place(usWho)}`, cite: ['9.12', '9.1'] }];
    case 'commonwealth':
      return [{ text: `Place it ${place(CW_HQ)}`, cite: ['9.12', '9.1'] }];
    default:
      return [
        { text: `If US: place it ${place(usWho)}`, cite: ['9.12', '9.1'] },
        { text: `If Commonwealth: place it ${place(CW_HQ)}`, cite: ['9.12', '9.1'] },
      ];
  }
}

function japanese(a: ReinforcementAnswers, site: string, hq: boolean): ReinforcementResult {
  return {
    verdict: 'place',
    headline: 'Place it on the map',
    doFirst: [
      { text: 'Wait until the Allied player has placed all reinforcements.', cite: ['9.1'] },
      { text: 'Place the unit as shown under "Where it can go".', cite: ['9.1'] },
    ],
    where: [
      hq
        ? { text: 'Place it in a friendly, supply-eligible port.', cite: ['9.1'] }
        : { text: `Place it in a friendly, supply-eligible ${site} within Activation Range of any Japanese HQ (every Japanese HQ can place any Japanese unit).`, cite: ['9.1', '9.13'] },
    ],
    restrictions: restrictionsFor(hq),
    notes: [
      { text: 'Japanese reinforcements are never delayed or diverted.', cite: ['4.11'] },
      { text: 'If a unit has no usable point of entry you may delay it voluntarily; it stays in the Delayed Reinforcement box until it can enter legally.', cite: ['9.14'] },
    ],
    mapChecks: mapChecksFor(site, hq),
  };
}

function chinese(): ReinforcementResult {
  return {
    verdict: 'place',
    headline: 'Place it in Kunming',
    doFirst: [{ text: 'Place the unit in Kunming (hex 2407).', cite: ['9.12'] }],
    where: [{ text: 'Kunming (hex 2407) is the only hex a Chinese unit can be placed in.', cite: ['9.12'] }],
    restrictions: restrictionsFor(true),
    notes: [{ text: 'There are no reinforcements other than US or Commonwealth; this applies when a Chinese unit has to be placed as if it were a reinforcement.', cite: ['9.12'] }],
    mapChecks: ['No un-neutralized enemy ZOI covers Kunming.', 'Stacking limits are not exceeded.'],
  };
}

function allied(a: ReinforcementAnswers, ctx: GameContext, site: string, hq: boolean): ReinforcementResult {
  const cannotDelay = hq || a.b29 === 'yes';
  const mightBeB29 = a.unitClass === 'air' && (a.b29 === 'unsure' || a.nationality === 'unsure');
  let verdict: ReinforcementResult['verdict'];
  if (cannotDelay) verdict = 'place';
  else if (a.delayed === 'yes') verdict = mightBeB29 ? 'depends' : 'delay';
  else if (a.delayed === 'no') verdict = 'place';
  else verdict = 'depends';

  const headline = cannotDelay
    ? hq
      ? 'Place the HQ on the map (HQs can never be delayed)'
      : 'Place the B-29 on the map (B-29s can never be delayed)'
    : verdict === 'place'
      ? 'Place it on the map'
      : verdict === 'delay'
        ? 'Put it in the Delayed Reinforcement box'
        : "It depends on whether this turn's reinforcements are delayed";

  const sentToEurope = !cannotDelay && verdict !== 'place' ? steInfo(a, ctx) : undefined;

  const doFirst: Step[] = [
    { text: 'Bring every unit in the Delayed Reinforcement box into play. The Allied player does this first.', cite: ['9.21'] },
  ];
  if (verdict === 'place') {
    doFirst.push({ text: 'Place the unit as shown under "Where it can go".', cite: ['9.1'] });
  } else if (verdict === 'delay') {
    doFirst.push({ text: 'Put this unit in the Delayed Reinforcement box.', cite: ['9.21'] });
    if (sentToEurope && sentToEurope.eligible !== 'no') doFirst.push({ text: 'Roll for Sent to Europe as it enters the box (see below).', cite: ['9.24'] });
  } else {
    doFirst.push({
      text: "If this turn's reinforcements are delayed (War in Europe level 1+, an event, or Inter-Service Rivalry), put the unit in the box instead of placing it.",
      cite: ['9.21'],
    });
  }

  const where: Step[] = hq
    ? [{ text: 'Place it in a friendly, supply-eligible port.', cite: ['9.1'] }]
    : alliedWhere(a, site);

  const notes: Step[] = [];
  if (hq) {
    notes.push({ text: 'HQ units can never be delayed.', cite: ['9.23'] });
    notes.push({ text: 'An HQ arriving as a reinforcement can place other reinforcements only in the hex it occupies.', cite: ['9.1'] });
  } else if (a.b29 === 'yes') {
    notes.push({ text: 'US B-29 units can never be delayed. A B-29 may bomb on the turn it arrives if it meets the conditions.', cite: ['9.23', '11.31'] });
  } else {
    notes.push({
      text: 'No usable entry point (for example no suitable HQ)? You may delay the unit voluntarily. It stays in the box until it can enter legally and may be sent to Europe each turn it waits.',
      cite: ['9.14'],
    });
  }

  return { verdict, headline, doFirst, where, restrictions: restrictionsFor(hq), notes, mapChecks: mapChecksFor(site, hq), sentToEurope };
}

export function checkReinforcement(a: ReinforcementAnswers, ctx: GameContext): ReinforcementResult {
  if (!a.side || !a.unitClass) throw new Error('incomplete answers');
  const site = a.unitClass === 'air' ? 'airfield' : 'port';
  const hq = a.unitClass === 'hq';
  if (a.side === 'japanese') return japanese(a, site, hq);
  if (a.nationality === 'chinese') return chinese();
  return allied(a, ctx, site, hq);
}

export const reinforcementReminders: Reminder[] = [
  {
    id: 'reinf-delay',
    pages: ['reinforcements#delayed'],
    text: "Allied player: first bring every unit out of the Delayed Reinforcement box. Then, if War in Europe is at level 1 or more (or an event or Inter-Service Rivalry applies), put all of this turn's new Allied reinforcements in the box instead of on the map. HQs and US B-29s are never delayed.",
    condition: 'Every Reinforcement segment.',
    cite: ['9.21', '9.23'],
    status(ctx) {
      if (ctx.wieLevel === undefined) return 'unknown';
      return ctx.wieLevel >= 1 ? 'applies' : 'notNow';
    },
    detail(ctx) {
      if (ctx.wieLevel === undefined) return undefined;
      return ctx.wieLevel >= 1
        ? `War in Europe is at level ${ctx.wieLevel}: all Allied reinforcements this turn go to the box (HQs and B-29s excepted).`
        : 'War in Europe has no effect. Only an event or Inter-Service Rivalry would still delay this turn’s reinforcements.';
    },
  },
];
