import { describe, it, expect } from 'vitest';
import {
  answerCard, cardQuestionFor, checkCardPlay, goBackCard, nextCardQuestion, strategyCardReminders, type CardAnswers,
} from '../../src/helper/logic/strategyCards';
import type { GameContext } from '../../src/helper/types';
import { allCardPaths } from './paths';

const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });
const text = (steps: { text: string }[]) => steps.map((s) => s.text).join(' | ');
const all = (r: ReturnType<typeof checkCardPlay>) => [r.headline, text(r.effect), text(r.conditions), text(r.afterwards), text(r.notes)].join(' | ');

describe('question flow', () => {
  it('asks the role first, then what to do with the card for the Offensives player', () => {
    expect(nextCardQuestion({})!.key).toBe('role');
    expect(nextCardQuestion({ role: 'offensives' })!.key).toBe('use');
  });
  it('a pass needs no card kind', () => {
    expect(nextCardQuestion({ role: 'offensives', use: 'pass' })).toBeUndefined();
  });
  it('an OC, event or discard asks what kind of event the card has', () => {
    for (const use of ['oc', 'ec', 'discard'] as const) expect(nextCardQuestion({ role: 'offensives', use })!.key).toBe('cardClass');
  });
  it('the Reaction player goes straight to the card kind, and a Reaction event asks which one', () => {
    expect(nextCardQuestion({ role: 'reaction' })!.key).toBe('cardClass');
    expect(nextCardQuestion({ role: 'reaction', cardClass: 'reaction' })!.key).toBe('reactionKind');
    expect(nextCardQuestion({ role: 'reaction', cardClass: 'reaction', reactionKind: 'weather' })).toBeUndefined();
    expect(nextCardQuestion({ role: 'reaction', cardClass: 'military' })).toBeUndefined();
  });
  it('a Reaction event kind is only asked of the Reaction player', () => {
    expect(nextCardQuestion({ role: 'offensives', use: 'ec', cardClass: 'reaction' })).toBeUndefined();
  });
  it('changing an earlier answer clears later ones; goBack removes the last', () => {
    expect(answerCard({ role: 'offensives', use: 'ec', cardClass: 'military' }, 'role', 'reaction')).toEqual({ role: 'reaction' });
    expect(goBackCard({ role: 'reaction', cardClass: 'reaction' })).toEqual({ role: 'reaction' });
    expect(goBackCard({})).toEqual({});
  });
  it('the kind questions offer "Not sure"', () => {
    for (const key of ['cardClass', 'reactionKind'] as const) {
      expect(cardQuestionFor(key, {}).options.some((o) => o.value === 'unsure')).toBe(true);
    }
  });
});

describe('Offensives player', () => {
  const off = (extra: Partial<CardAnswers>): CardAnswers => ({ role: 'offensives', ...extra });

  it('a pass replaces playing a card and is lost if unused', () => {
    const r = checkCardPlay(off({ use: 'pass' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.effect)).toMatch(/instead of playing a card/);
    expect(text(r.afterwards)).toMatch(/lost at the end of the Offensives phase/);
  });

  it('an OC lists the five actions and activates OC value + HQ efficiency, with no draw and no removal', () => {
    const r = checkCardPlay(off({ use: 'oc', cardClass: 'military' }));
    expect(r.verdict).toBe('yes');
    const e = text(r.effect);
    for (const word of ['OC Offensive', 'China OC Offensive', 'Withdraw an air unit', 'Withdraw an HQ', 'Bring an HQ into play']) expect(e).toContain(word);
    expect(e).toMatch(/Operations value .*\+ .*Efficiency/);
    expect(text(r.afterwards)).toMatch(/never removed from the game/);
    expect(text(r.afterwards)).toMatch(/never draw a card/);
    expect(text(r.notes)).toMatch(/intelligence die roll/);
  });
  it('any kind of card can be played as an OC, even a Reaction event', () => {
    expect(checkCardPlay(off({ use: 'oc', cardClass: 'reaction' })).verdict).toBe('yes');
  });
  it('a Special Event played early as an OC causes a reshuffle', () => {
    expect(text(checkCardPlay(off({ use: 'oc', cardClass: 'special' })).notes)).toMatch(/reshuffl/);
  });

  it('a Military event uses Logistics + HQ efficiency and needs every clause satisfied', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'military' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.effect)).toMatch(/Logistics value/);
    expect(text(r.conditions)).toMatch(/only be played as an OC or discarded/);
    expect(text(r.conditions)).toMatch(/Surprise Attack/);
    expect(text(r.afterwards)).toMatch(/never more than 3/i);
    expect(text(r.afterwards)).toMatch(/removed from the game/);
  });
  it('the Offensives player cannot play a Reaction event as an event', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'reaction' }));
    expect(r.verdict).toBe('no');
    expect(r.headline).toMatch(/Reaction player/);
    expect(text(r.notes)).toMatch(/OC or discard/);
  });
  it('Resource events are for the Offensives player only and link to reinforcements and replacements', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'resource' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.conditions)).toMatch(/lost/);
    expect(r.links).toEqual(expect.arrayContaining(['reinforcements', 'replacements']));
  });
  it('Political events move a track marker and link to US Political Will', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'political' }));
    expect(text(r.effect)).toMatch(/US Political Will/);
    expect(r.links).toContain('us-political-will');
  });
  it('a Special Event must be played in the turn it is drawn and cannot be a Future Offensive', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'special' }));
    expect(text(r.conditions)).toMatch(/turn it is drawn/);
    expect(text(r.conditions)).toMatch(/Future Offensive/);
  });
  it('an unsure kind depends, and lists what changes between kinds', () => {
    const r = checkCardPlay(off({ use: 'ec', cardClass: 'unsure' }));
    expect(r.verdict).toBe('depends');
    expect(all(r)).toMatch(/Reaction events/);
  });
  it('movement still uses the card’s Operations value when played as an event', () => {
    expect(text(checkCardPlay(off({ use: 'ec', cardClass: 'military' })).notes)).toMatch(/Operations value/);
  });

  it('a discard goes to the Discard pile even if the card would be removed when played', () => {
    const r = checkCardPlay(off({ use: 'discard', cardClass: 'military' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.afterwards)).toMatch(/even if/);
  });
  it('a discarded Special Event happens the instant it is discarded', () => {
    expect(text(checkCardPlay(off({ use: 'discard', cardClass: 'special' })).notes)).toMatch(/instant/);
  });
});

describe('Reaction player', () => {
  const rea = (extra: Partial<CardAnswers>): CardAnswers => ({ role: 'reaction', ...extra });

  it('can only play cards whose title says they are Reaction events', () => {
    for (const cardClass of ['military', 'resource', 'political', 'special'] as const) {
      const r = checkCardPlay(rea({ cardClass }));
      expect(r.verdict).toBe('no');
      expect(r.headline).toMatch(/Reaction events/);
    }
  });
  it('an unsure card kind depends on the title', () => {
    expect(checkCardPlay(rea({ cardClass: 'unsure' })).verdict).toBe('depends');
  });
  it('a Reaction event: timing and the limit of three', () => {
    const r = checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'attack' }));
    expect(r.verdict).toBe('yes');
    expect(text(r.conditions)).toMatch(/after the Offensives player has finished moving/);
    expect(text(r.conditions)).toMatch(/three Reaction events/);
  });
  it('intelligence: intercept or ambush, and a failed roll shuts the door', () => {
    const t = all(checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'intelligence' })));
    expect(t).toMatch(/intercept or ambush/);
    expect(t).toMatch(/ambush/);
  });
  it('counteroffensive: its own Logistics value, but the Offensives card’s OC value for movement', () => {
    const t = all(checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'counteroffensive' })));
    expect(t).toMatch(/Logistics/);
    expect(t).toMatch(/OC value for movement/);
  });
  it('weather: cancels the offensive, nothing else may be played with it, and it is removed from play', () => {
    const r = checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'weather' }));
    expect(text(r.effect)).toMatch(/cancel/i);
    expect(text(r.conditions)).toMatch(/before an intelligence die roll/);
    expect(text(r.conditions)).toMatch(/No other events/);
    expect(text(r.afterwards)).toMatch(/removed from play/);
  });
  it('personage follows the card text; an unsure kind depends', () => {
    expect(checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'personage' })).verdict).toBe('yes');
    expect(checkCardPlay(rea({ cardClass: 'reaction', reactionKind: 'unsure' })).verdict).toBe('depends');
  });
  it('rejects incomplete answers', () => {
    expect(() => checkCardPlay({})).toThrow('incomplete answers');
    expect(() => checkCardPlay({ role: 'offensives' })).toThrow('incomplete answers');
  });
});

describe('every path through the form', () => {
  it('reaches a well-formed result without throwing', () => {
    const paths = allCardPaths();
    expect(paths.length).toBeGreaterThan(20);
    for (const a of paths) {
      const r = checkCardPlay(a);
      expect(['yes', 'no', 'depends']).toContain(r.verdict);
      expect(r.headline.length).toBeGreaterThan(5);
      expect(r.effect.length + r.conditions.length + r.notes.length).toBeGreaterThan(0);
    }
  });
});

describe('reminders', () => {
  const r = (id: string) => strategyCardReminders.find((x) => x.id === id)!;
  it('deal: shows the Allied draw and the Japanese base draw once the turn is known', () => {
    expect(r('cards-deal').status(ctx())).toBe('unknown');
    expect(r('cards-deal').status(ctx({ turn: 5 }))).toBe('applies');
    expect(r('cards-deal').detail!(ctx({ turn: 5, japanResourceHexes: 9 }))).toBe('Allies: 7 cards. Japan: base 5, before submarine warfare and bombing.');
    expect(r('cards-deal').detail!(ctx({ turn: 3 }))).toBe('Allies: 6 cards + 1 pass. Japan: base 7, before submarine warfare and bombing.');
    expect(r('cards-deal').detail!(ctx({ turn: 6 }))).toMatch(/set the Japanese resource hexes/);
    expect(r('cards-deal').detail!(ctx())).toBeUndefined();
  });
  it('deal: counts the passes Allied draw limits give', () => {
    expect(r('cards-deal').detail!(ctx({ turn: 5, surrendered: ['china'], japanResourceHexes: 8 }))).toBe('Allies: 6 cards + 1 pass. Japan: base 4, before submarine warfare and bombing.');
  });
  it('turn 1 of the full Campaign is a special case', () => {
    expect(r('cards-turn1').status(ctx({ turn: 1 }))).toBe('unknown');
    expect(r('cards-turn1').status(ctx({ turn: 2 }))).toBe('notNow');
    expect(r('cards-turn1').status(ctx())).toBe('unknown');
    expect(r('cards-turn1').detail!(ctx({ turn: 2 }))).toMatch(/turn 1/);
  });
  it('the rest are board checks', () => {
    expect(r('cards-draw-cap').status(ctx({ turn: 4 }))).toBe('unknown');
    expect(r('cards-special').status(ctx({ turn: 4 }))).toBe('unknown');
  });
  it('every reminder has text, a condition and a citation', () => {
    for (const x of strategyCardReminders) {
      expect(x.text.length).toBeGreaterThan(10);
      expect(x.condition.length).toBeGreaterThan(5);
      expect(x.cite.length).toBeGreaterThan(0);
    }
  });
});
