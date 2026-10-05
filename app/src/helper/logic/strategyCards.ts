import type { GameContext, Reminder, Step } from '../types';
import { answerIn, goBackIn } from './flow';
import { alliedDraw, japaneseBaseDraw } from './strategicWarfare';

export interface CardAnswers {
  role?: 'offensives' | 'reaction';
  use?: 'oc' | 'ec' | 'discard' | 'pass';
  cardClass?: 'military' | 'reaction' | 'resource' | 'political' | 'special' | 'unsure';
  reactionKind?: 'intelligence' | 'attack' | 'counteroffensive' | 'weather' | 'personage' | 'unsure';
}
export type CardKey = keyof CardAnswers;
export const CARD_ORDER: CardKey[] = ['role', 'use', 'cardClass', 'reactionKind'];

export interface CardQuestion {
  key: CardKey;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const UNSURE = { value: 'unsure', label: 'Not sure' };

function applies(key: CardKey, a: CardAnswers): boolean {
  switch (key) {
    case 'role':
      return true;
    case 'use':
      return a.role === 'offensives';
    case 'cardClass':
      return a.role === 'reaction' || (a.role === 'offensives' && a.use !== undefined && a.use !== 'pass');
    case 'reactionKind':
      return a.role === 'reaction' && a.cardClass === 'reaction';
  }
}

export function cardQuestionFor(key: CardKey, a: CardAnswers): CardQuestion {
  switch (key) {
    case 'role':
      return {
        key,
        prompt: 'What is your role in this Offensive?',
        hint: 'Players alternate being the Offensives player (4.22); the other is the Reaction player.',
        options: [{ value: 'offensives', label: 'Offensives player' }, { value: 'reaction', label: 'Reaction player' }],
      };
    case 'use':
      return {
        key,
        prompt: 'What do you want to do with the card?',
        options: [
          { value: 'oc', label: 'Play it as an Operations Card (OC)' },
          { value: 'ec', label: 'Play it as an Event (EC)' },
          { value: 'discard', label: 'Discard it' },
          { value: 'pass', label: 'Use a pass instead' },
        ],
      };
    case 'cardClass':
      return {
        key,
        prompt: 'What kind of event does the card have?',
        hint:
          a.role === 'reaction'
            ? 'A Reaction player can only play cards whose title says they are Reaction events (5.32).'
            : 'A card is played as an OC or discarded whatever its event; the kind matters for events, and for Special Events.',
        options: [
          { value: 'military', label: 'Military event (has a Logistics value)' },
          { value: 'reaction', label: 'Reaction event (title says so)' },
          { value: 'resource', label: 'Resource event (units or replacements)' },
          { value: 'political', label: 'Political event (moves a track marker)' },
          { value: 'special', label: 'Special event (Tojo Resigns, Soviets Invade Manchuria)' },
          UNSURE,
        ],
      };
    case 'reactionKind':
      return {
        key,
        prompt: 'Which kind of Reaction event?',
        options: [
          { value: 'intelligence', label: 'Intelligence' },
          { value: 'attack', label: 'Attack (submarine, kamikaze, skip bombing)' },
          { value: 'counteroffensive', label: 'Counteroffensive' },
          { value: 'weather', label: 'Weather' },
          { value: 'personage', label: 'Personage' },
          UNSURE,
        ],
      };
  }
}

export function nextCardQuestion(a: CardAnswers): CardQuestion | undefined {
  for (const key of CARD_ORDER) {
    if (applies(key, a) && a[key] === undefined) return cardQuestionFor(key, a);
  }
  return undefined;
}

export function answerCard(a: CardAnswers, key: CardKey, value: string): CardAnswers {
  return answerIn(CARD_ORDER, a, key, value);
}

export function goBackCard(a: CardAnswers): CardAnswers {
  return goBackIn(CARD_ORDER, a);
}

export type CardVerdict = 'yes' | 'no' | 'depends';

export interface CardPlayResult {
  verdict: CardVerdict;
  headline: string;
  /** What you can do or what happens. */
  effect: Step[];
  conditions: Step[];
  /** What happens to the card afterwards. */
  afterwards: Step[];
  notes: Step[];
  links: string[];
}

const s = (text: string, ...cite: string[]): Step => ({ text, cite });
const base = (verdict: CardVerdict, headline: string): CardPlayResult => ({ verdict, headline, effect: [], conditions: [], afterwards: [], notes: [], links: [] });

const AFTER_EVENT: Step[] = [
  s('If the event says you draw a Strategy card, draw it now. Never more than 3 draws per Offensives phase, and you cannot use a card drawn during the current offensive.', '5.35'),
  s('If the event says the card is removed from the game, it never returns. Otherwise it goes to the Discard pile for later reuse.', '5.36', '5.0'),
];
const MOVEMENT_NOTE = s('Movement still uses the card’s Operations value as the multiplier, even when the card is played as an event.', '5.1', '8.1');
const TEXT_WINS = s('If the event text contradicts the rules, the card text wins.', '5.3');

function pass(): CardPlayResult {
  const r = base('yes', 'You may pass instead of playing a card');
  r.effect.push(s('A pass is used instead of playing a card in the Offensives phase.', '5.0', '12.4'));
  r.conditions.push(s('Only while you have passes left. Japan gets 2 passes with 5 or fewer cards and 1 with 6 (not counting a Future Offensives card); the Allies get passes on turns 2 and 3 and for draw limitations.', '12.4', '12.51', '12.52'));
  r.afterwards.push(s('Unused passes are lost at the end of the Offensives phase and cannot be accumulated.', '12.4', '12.51'));
  return r;
}

function discard(a: CardAnswers): CardPlayResult {
  if (a.cardClass === 'special') {
    const r = base('no', 'A Special Event cannot be voluntarily discarded');
    r.effect.push(s('Tojo Resigns and Soviets Invade Manchuria must be played, as an OC or an EC, in the Offensives phase of the turn they are drawn.', '5.37'));
    r.notes.push(s('If one is discarded because of another event and its criteria are fulfilled, it occurs the instant it is discarded. If not, the discard pile is reshuffled as if it had been played as an OC.', '5.37'));
    return r;
  }
  const r = base('yes', 'Discard it to the Discard pile');
  r.effect.push(s('You must play a Strategy card, use a pass, designate a Future Offensives card, or discard a card each time it is your turn.', '5.0', '4.22'));
  r.afterwards.push(s('A discarded card goes to the Discard pile for possible reuse, even if it would normally be removed from play after being played as an event.', '5.0', '5.36'));
  if (a.cardClass === 'unsure') {
    r.notes.push(s('A Special Event (Tojo Resigns, Soviets Invade Manchuria) cannot be voluntarily discarded. If one is discarded because of another event, it occurs the instant it is discarded when its criteria are fulfilled.', '5.37'));
  }
  return r;
}

function oc(a: CardAnswers): CardPlayResult {
  const r = base('yes', 'Play it as an Operations Card');
  r.effect.push(
    s('Choose one action: A. conduct an OC Offensive.', '5.0', '7.0'),
    s('B. Conduct a China OC Offensive.', '5.0', '13.72'),
    s('C. Withdraw an HQ.', '5.0', '6.13'),
    s('D. Bring an HQ into play from the game turn record track.', '5.0', '6.15'),
    s('E. Construct a strategic transport route (the complete play of a 3 OC card).', '5.0', '13.77'),
    s('Units you can activate = the card’s Operations value (1, 2 or 3) + the Efficiency rating of the HQ you start from. Units must be in supply.', '7.21'),
    s('Movement allowance = each unit’s base value × the card’s Operations value.', '8.1', '7.22'),
  );
  r.afterwards.push(
    s('You never draw a card when a card is played as an OC.', '5.35'),
    s('A card played as an OC is never removed from the game; it goes to the Discard pile.', '5.36', '5.0'),
  );
  r.notes.push(
    s('The Reaction player activates the OC value of your card + the Efficiency of the HQ they use, unless their Reaction event gives its own Logistics value.', '5.1', '7.26'),
    s('The Offensive is a surprise attack unless the Reaction player changes it: with a Reaction card, or an intelligence die roll equal to or lower than the card’s OC intelligence value (minus 2 if your units move into, through or out of an opposing air ZOI; an unmodified 9 always fails).', '5.2', '7.25', '7.26'),
    s('If the card has a Military event, its text is ignored when it is played as an OC.', '5.0'),
  );
  if (a.cardClass === 'special' || a.cardClass === 'unsure') {
    r.notes.push(s('A Special Event drawn before it can be played, or before its precondition is met, may be played as an OC; the deck is then reshuffled at the end of the turn to bring back that card and the Discard pile (not cards removed from play).', '5.37'));
  }
  return r;
}

function military(): CardPlayResult {
  const r = base('yes', 'Play it as a Military event');
  r.effect.push(
    s('Follow the event text. Units you can activate = the event’s Logistics value + the Efficiency rating of the HQ you use (not the card’s Operations value). Units must be in supply.', '5.31', '7.21'),
    s('Some Military events bring a special unit into play; place it as the card says.', '5.31'),
  );
  r.conditions.push(
    s('You must be able to comply with every clause of the event. If you cannot, the card can only be played as an OC or discarded.', '5.31'),
    s('Activation instructions may restrict which named HQs you can or must use.', '5.31'),
    s('If the card says Surprise Attack, the Reaction player cannot make an intelligence die roll, but can still play a Reaction card to change it.', '5.31'),
    s('Special conditions apply to the whole offensive but not beyond it, unless the card says so. Parts marked “only” are mandatory.', '5.31'),
  );
  r.afterwards.push(...AFTER_EVENT);
  r.notes.push(MOVEMENT_NOTE, TEXT_WINS);
  return r;
}

function resource(): CardPlayResult {
  const r = base('yes', 'Play it as a Resource event');
  r.effect.push(
    s('Follow the event text: it gives you new units or replacements.', '5.33'),
    s('A reinforcement unit is placed on the map under the same restrictions as in the Reinforcement segment.', '5.33', '10.1'),
    s('Replacements are used immediately as if it were the Replacement segment, or saved on the strategic resource track if the card lets you choose.', '5.33', '11.0'),
  );
  r.conditions.push(
    s('Only the Offensives player can play Resource events.', '5.33'),
    s('If you cannot meet the conditions under which a reinforcement unit is supplied, the unit is lost. Replacements you cannot use or save are lost for good.', '5.33'),
  );
  r.afterwards.push(...AFTER_EVENT);
  r.notes.push(MOVEMENT_NOTE, TEXT_WINS);
  r.links.push('reinforcements', 'replacements');
  return r;
}

function political(): CardPlayResult {
  const r = base('yes', 'Play it as a Political event');
  r.effect.push(
    s('Follow the event text: it moves a marker on one of the game tracks, by the direction and distance printed on the card.', '5.34'),
    s('The five kinds: China OC Offensives, India stability, War in Europe, US Political Will changes, and Inter-Service Rivalry.', '5.34'),
  );
  r.afterwards.push(...AFTER_EVENT);
  r.notes.push(TEXT_WINS);
  r.links.push('us-political-will');
  return r;
}

function special(): CardPlayResult {
  const r = base('yes', 'Play it as a Special Event');
  r.effect.push(s('Follow the event text (Tojo Resigns, Soviets Invade Manchuria).', '5.37'));
  r.conditions.push(
    s('It must be played, as an OC or an EC, during the Offensives phase of the turn it is drawn.', '5.37'),
    s('It may not be played as a Future Offensive or voluntarily discarded.', '5.37', '7.29'),
    s('If it is drawn before the event can be played, or its precondition is not yet met, play it as an OC instead; the deck is reshuffled at the end of the turn to re-include it and the Discard pile (not cards removed from play).', '5.37'),
  );
  r.afterwards.push(...AFTER_EVENT);
  return r;
}

function unsureEvent(): CardPlayResult {
  const r = base('depends', 'It depends on the kind of event');
  r.effect.push(
    s('Reaction events cannot be played as an event by the Offensives player: only as an OC or discarded.', '5.32'),
    s('Military events need every clause satisfied, and activate Logistics value + HQ efficiency.', '5.31'),
    s('Resource events (units, replacements) and Political events (track markers) follow their card text.', '5.33', '5.34'),
    s('A Special Event must be played in the turn it is drawn, as an OC or an EC.', '5.37'),
  );
  r.notes.push(s('Check the card title and text, then answer again.', '5.3'));
  return r;
}

function reactionEvent(kind: NonNullable<CardAnswers['reactionKind']>): CardPlayResult {
  const r = base('yes', 'Play it as a Reaction event');
  r.conditions.push(
    s('Play it after the Offensives player has finished moving all offensive units, provided there is at least one declared battle hex or the card text says otherwise.', '5.32'),
    s('You may play at most three Reaction events (played simultaneously) in response to one offensive, not per battle.', '5.32'),
  );
  r.afterwards.push(s('Follow the card for removal from play. Otherwise it goes to the Discard pile.', '5.36', '5.0'));
  switch (kind) {
    case 'intelligence':
      r.effect.push(
        s('Changes the intelligence condition to intercept or ambush for the entire offensive and all of its battles. It supersedes the Strategy card’s condition.', '7.25'),
        s('You do not have to play a Reaction card you hold.', '7.25'),
      );
      r.notes.push(
        s('Once you have made an intelligence die roll, Reaction cards can no longer change the condition for that offensive, unless the card says so. A die roll is only allowed if you played no card.', '7.26'),
        s('If more than one Reaction card is played and both intercept and ambush are possible, the condition is ambush.', '5.32', '7.25'),
      );
      break;
    case 'attack':
      r.effect.push(
        s('Gives the Offensives player a chance of extra damage from a submarine, kamikaze or skip-bombing attack. Follow the card text.', '5.32'),
      );
      r.notes.push(s('More than one Attack Reaction card can be played during an offensive.', '5.32'));
      break;
    case 'counteroffensive':
      r.effect.push(
        s('Lets you activate more units in reaction than would normally be possible, and alters the intelligence condition like an Intelligence card.', '5.32'),
        s('Units activated = the card’s Logistics value + your HQ’s Efficiency rating.', '7.26', '5.32'),
      );
      r.notes.push(
        s('Unit movement still uses the Offensives card’s OC value for movement points.', '5.32'),
        s('Only one Counteroffensive event may be played during an offensive.', '5.32'),
      );
      break;
    case 'weather':
      r.effect.push(
        s('Cancels an Offensive that activates units (with or without battle hexes). The moved units go back to their starting locations, which ends the offensive.', '5.32'),
        s('The cancellation also stops any event bonuses or reinforcement units from entering play.', '5.32'),
      );
      r.conditions.push(
        s('Play it after the Offensives player’s movement and before an intelligence die roll.', '5.32'),
        s('No other events may be played in conjunction with a Weather card.', '5.32'),
      );
      r.afterwards.push(
        s('All Weather cards are removed from play when played as an event.', '5.32'),
        s('The cancelled offensive’s card counts as discarded, not played: an event card that is removed when played goes to the Discard pile instead. ASPs the Offensives player meant to use are not considered used.', '5.32'),
      );
      break;
    case 'personage':
      r.effect.push(s('A famous personage (for example Ghandi, Wingate): follow the text of the card.', '5.32'));
      break;
    case 'unsure':
      r.verdict = 'depends';
      r.headline = 'It depends on the kind of Reaction event';
      r.effect.push(
        s('Intelligence: change the intelligence condition to intercept or ambush. Attack: extra damage to the Offensives player. Counteroffensive: activate more units of your own. Weather: cancel the offensive. Personage: follow the text.', '5.32'),
      );
      break;
  }
  return r;
}

export function checkCardPlay(a: CardAnswers): CardPlayResult {
  if (nextCardQuestion(a)) throw new Error('incomplete answers');

  if (a.role === 'reaction') {
    if (a.cardClass === 'unsure') {
      const r = base('depends', 'It depends on whether the card is a Reaction event');
      r.effect.push(s('As the Reaction player you can only play cards whose title says they are Reaction events.', '5.32'));
      r.notes.push(s('Check the card title. Only a Reaction event can be played by the Reaction player.', '5.32'));
      return r;
    }
    if (a.cardClass !== 'reaction') {
      const r = base('no', 'The Reaction player can only play Reaction events');
      r.effect.push(s('As the Reaction player the only Strategy cards you may play are those whose title says they are Reaction events.', '5.32'));
      return r;
    }
    return reactionEvent(a.reactionKind!);
  }

  switch (a.use) {
    case 'pass':
      return pass();
    case 'discard':
      return discard(a);
    case 'oc':
      return oc(a);
    case 'ec':
      switch (a.cardClass) {
        case 'military':
          return military();
        case 'resource':
          return resource();
        case 'political':
          return political();
        case 'special':
          return special();
        case 'reaction': {
          const r = base('no', 'Reaction events can only be played by the Reaction player');
          r.effect.push(s('Only the player currently cast as the Reaction player may play Reaction events.', '5.32'));
          r.notes.push(s('You can still play this card as an OC or discard it.', '5.0'));
          return r;
        }
        default:
          return unsureEvent();
      }
  }
  throw new Error('incomplete answers');
}

const passText = (n: number) => (n === 0 ? '' : n === 1 ? ' + 1 pass' : ` + ${n} passes`);

export const strategyCardReminders: Reminder[] = [
  {
    id: 'cards-deal',
    pages: ['strategy-cards#deal'],
    text: 'Deal Strategy cards: the Japanese player gets 4 to 7 from the top of the Japanese deck, depending on Strategic Warfare; the Allied player 4 to 7 from the Allied deck, depending on the turn, War in Europe and surrendered nations.',
    condition: 'Every Deal Strategy Cards segment, after Strategic Warfare.',
    cite: ['4.14', '12.11', '12.51'],
    links: ['strategic-warfare'],
    status: (ctx) => (ctx.turn === undefined ? 'unknown' : 'applies'),
    detail(ctx) {
      const allied = alliedDraw(ctx);
      if (!allied) return undefined;
      const jp = japaneseBaseDraw(ctx.turn, ctx.japanResourceHexes);
      const japan = jp === undefined ? 'set the Japanese resource hexes for the base draw' : `base ${jp}, before submarine warfare and bombing`;
      return `Allies: ${allied.cards} cards${passText(allied.basePasses + allied.extraPasses)}. Japan: ${japan}.`;
    },
  },
  {
    id: 'cards-turn1',
    pages: ['strategy-cards#deal'],
    text: 'Turn 1 of the full Campaign is the December 1941 Special Turn: the Allied player receives no cards and the Japanese player only plays two specific cards as events (Operation Z and IAI).',
    condition: 'Game turn 1 of the full Campaign scenario only.',
    cite: ['4.14', '12.51', '17.11'],
    status(ctx) {
      if (ctx.turn === undefined) return 'unknown';
      return ctx.turn === 1 ? 'unknown' : 'notNow';
    },
    detail: (ctx) => (ctx.turn !== undefined && ctx.turn !== 1 ? `Only on turn 1; it is turn ${ctx.turn}.` : undefined),
  },
  {
    id: 'cards-draw-cap',
    pages: ['strategy-cards#drawing'],
    text: 'Cards drawn from events: never when a card is played as an OC, never more than 3 in an Offensives phase, and a card just drawn cannot be used in the current offensive. Track the draws with the Card Max counters on the Strategic Record Track.',
    condition: 'Whenever an event says “draw a Strategy card”.',
    cite: ['5.35'],
    status: () => 'unknown',
  },
  {
    id: 'cards-special',
    pages: ['strategy-cards#special'],
    text: 'Tojo Resigns and Soviets Invade Manchuria must be played, as an OC or an EC, in the Offensives phase of the turn they are drawn. They cannot be Future Offensives or voluntarily discarded.',
    condition: 'When you draw either Special Event card.',
    cite: ['5.37'],
    status: () => 'unknown',
  },
];
