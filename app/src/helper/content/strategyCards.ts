import type { Section } from '../types';

export const STRATEGY_CARD_SECTIONS: Section[] = [
  {
    key: 'deal',
    title: 'The deal',
    statements: [
      { text: 'In the Deal Strategy Cards segment the Japanese player receives 4 to 7 cards from the top of the Japanese deck, depending on the outcome of Strategic Warfare.', cite: ['4.14'], links: ['strategic-warfare'] },
      { text: 'The Allied player receives 4 to 7 cards from the top of the Allied deck, depending on the game turn and on whether certain Allied nations have surrendered.', cite: ['4.14', '11.51', '11.52'], links: ['strategic-warfare'] },
      { text: 'Exception: on turn 1 of the full Campaign the Allied player receives no cards and the Japanese player receives only Japanese cards #1 and #2.', cite: ['4.14'] },
      { text: 'The player with the most cards in hand goes first in the Offensives phase, with a few exceptions (the Initiative segment).', cite: ['4.21'] },
    ],
  },
  {
    key: 'public-info',
    title: 'What both players may know',
    statements: [
      { text: 'Throughout the game each player may know how many cards are in the other’s hand (not which), which cards are in the Discard pile, and which cards have been removed from play.', cite: ['4.14'] },
      { text: 'The Discard pile is disclosed information and either player can examine it.', cite: ['5.0'] },
      { text: 'Cards can return to play in ways other than a reshuffle.', cite: ['4.14'] },
    ],
  },
  {
    key: 'basics',
    title: 'Playing cards: the basics',
    statements: [
      { text: 'Each player has a deck of unique Strategy cards and can only draw and play from their own deck, although some cards make the other player discard.', cite: ['5.0'] },
      { text: 'Players alternate in the Offensives segment. On your turn you must play a card, use one of a limited number of passes, or discard a card. The Offensives phase ends when both players have played all the cards in their hands.', cite: ['5.0'] },
      { text: 'A card is played as an Operations Card (OC), as an Event Card (EC), or discarded.', cite: ['5.0'] },
      { text: 'As an OC you do one of: an OC Offensive, a China OC Offensive, withdraw an air unit, withdraw an HQ, or bring an HQ into play from the game turn record track.', cite: ['5.0', '6.0', '12.72', '7.33', '7.54', '7.56'] },
      { text: 'Played and discarded cards go to the Discard pile for reuse, unless the card text says otherwise.', cite: ['5.0'] },
      { text: 'A card that is discarded rather than played goes to the Discard pile even if it would be removed from play when played as an event.', cite: ['5.0'] },
      { text: 'Passes: Japan gets 2 with 5 or fewer cards and 1 with 6; the Allies get them on turns 2 and 3 and for draw limitations. Unused passes are lost at the end of the Offensives phase.', cite: ['11.4', '11.51', '11.52'] },
    ],
  },
  {
    key: 'ops-value',
    title: 'Operations value',
    statements: [
      { text: 'Every card has an Operations value of 1, 2 or 3. It is used for movement and activation even when the card is played as an event.', cite: ['5.1'] },
      { text: 'Movement allowance = the unit’s base value × the card’s Operations value. Base values: naval 5, ground 1, air = its range or extended range. With a 2 OC, ground units have 2 movement points, aircraft move twice their range, and naval units move 10 hexes.', cite: ['5.11'] },
      { text: 'Air units move in legs. Every leg starts and ends at a friendly airfield (a leg may also start from a battle hex). Air units that use their extended range cannot take part in battle.', cite: ['5.11'] },
      { text: 'Offensives player activation: as an OC, the card’s Operations value + the Efficiency rating of the HQ you start from. As an event, the event’s Logistics value (or what the card text says) + the HQ’s Efficiency. Units must be in supply.', cite: ['5.12'] },
      { text: 'Reaction player activation: the Offensives player’s card Operations value (whether played as an OC or an EC) + the Efficiency of the HQ they use. If their Reaction event has a Logistics value, they use that instead of the OC value.', cite: ['5.13'] },
    ],
  },
  {
    key: 'intelligence',
    title: 'Intelligence conditions',
    statements: [
      { text: 'Every Offensive is a surprise attack unless the Reaction player changes it to an intercept or ambush.', cite: ['5.2'] },
      { text: 'With a Reaction card: an intelligence or counteroffensive Reaction card sets the condition to intercept or ambush for the whole offensive and all its battles. The card’s condition dominates. Playing it is optional.', cite: ['5.21'] },
      { text: 'With a die roll (if no card was played and the event did not specify surprise attack): a roll equal to or lower than the card’s intelligence value makes it intercept. Use the OC value if the offensive was started as an OC, and the EC value if as an event. A higher roll leaves it a surprise attack.', cite: ['5.22'] },
      { text: 'Air reconnaissance: if any Offensives unit moves into, through or out of an opposing air ZOI, the Reaction player subtracts 2 from the roll. An unmodified 9 always fails.', cite: ['5.22'] },
      { text: 'If an event offensive specifies surprise attack, only a Reaction card can change it, never a die roll.', cite: ['5.2'] },
    ],
  },
  {
    key: 'military',
    title: 'Military events',
    statements: [
      { text: 'Military events allow bigger Offensives than the OC value would. Units activated = the event’s Logistics value + the Efficiency rating of your HQ.', cite: ['5.31'] },
      { text: 'If you cannot comply with all of an event’s clauses, the card can be played only as an OC or discarded, not as an event.', cite: ['5.31'] },
      { text: 'Activation instructions: many events restrict which named HQs can or cannot be used.', cite: ['5.31'] },
      { text: 'Intelligence conditions: if the card says Surprise Attack, the Reaction player cannot make an intelligence die roll, but may still play a Reaction card to change it.', cite: ['5.31'] },
      { text: 'Reinforcement units: some Military events bring in a special unit (for example Slim’s Burma Offensive brings the British 7th Armor Brigade). Place it as the card says.', cite: ['5.31'] },
      { text: 'Special conditions last for the whole offensive but not beyond, unless stated. Wording like “only” marks a mandatory part. A card that says “no additional effect” in some situation can still be played if the other part can be met.', cite: ['5.31'] },
    ],
  },
  {
    key: 'reaction',
    title: 'Reaction events',
    statements: [
      { text: 'Only the Reaction player can play Reaction events, and the only cards the Reaction player may play are those whose title says they are Reaction events.', cite: ['5.32'] },
      { text: 'Play them after the Offensives player has moved all offensive units, provided there is at least one declared battle hex or the text says otherwise. At most three Reaction events (played simultaneously) per offensive, not per battle.', cite: ['5.32'] },
      { text: 'Intelligence: changes the intelligence condition. After a failed intelligence die roll, intelligence Reaction cards can no longer change it unless the card says so. If both intercept and ambush are possible, it is ambush. Non-intelligence Reaction cards can always be played.', cite: ['5.32', '5.21'] },
      { text: 'Attack (submarine, kamikaze, skip bombing): extra damage to the Offensives player, usually against the activated units. Can be played with other Reaction cards or alone.', cite: ['5.32'] },
      { text: 'Counteroffensive: lets the Reaction player activate units like a normal Offensive using the card’s Logistics value; the intelligence condition becomes intercept. Movement points still use the Offensives card’s OC value.', cite: ['5.32'] },
      { text: 'Weather: cancels an Offensive that activates units. Play it after the Offensives player’s movement and before an intelligence die roll. Units return to their start, no event bonuses or reinforcements enter play, ASPs are not used, and no other events may be played with it. All Weather cards are removed from play when played.', cite: ['5.32'] },
      { text: 'Personage (for example Ghandi, Wingate): follow the card text.', cite: ['5.32'] },
    ],
  },
  {
    key: 'resource',
    title: 'Resource events',
    statements: [
      { text: 'Only the Offensives player can play Resource events. They give new units or replacements.', cite: ['5.33'] },
      { text: 'A reinforcement unit is placed on the map under the same restrictions as in the Reinforcement segment.', cite: ['5.33', '9.1'], links: ['reinforcements'] },
      { text: 'Replacements that must be used immediately are placed as if it were the Reinforcement segment. If the card gives a choice, saved replacements are recorded on the strategic resource track with the right marker.', cite: ['5.33', '10.0'], links: ['replacements'] },
      { text: 'If you cannot meet the conditions under which a reinforcement unit is supplied, the unit is lost. Replacements you cannot use or save are permanently lost.', cite: ['5.33'] },
    ],
  },
  {
    key: 'political',
    title: 'Political events',
    statements: [
      { text: 'Political events move a marker on one of the game tracks, in the direction and by the distance printed on the card.', cite: ['5.34'] },
      { text: 'The five kinds: Chinese offensives, India stability, War in Europe, US Political Will changes, and Inter-Service Rivalry.', cite: ['5.34'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'drawing',
    title: 'Drawing a card',
    statements: [
      { text: 'Many events say you draw a Strategy card. You never draw when a card is played as an OC, only when it is played as an event.', cite: ['5.35'] },
      { text: 'You cannot use a card you just drew during the current offensive.', cite: ['5.35'] },
      { text: 'You can never draw more than three cards this way in one Offensives phase. After three, further draws in that phase are ignored.', cite: ['5.35'] },
      { text: 'Play note: use the Japanese flag and the British roundel on the Strategic Record Track to count the draws.', cite: ['5.35'] },
    ],
  },
  {
    key: 'removing',
    title: 'Removing a card',
    statements: [
      { text: 'Many events say they are removed from the game. A card used as an event with that provision is removed after its first use and never returns.', cite: ['5.36'] },
      { text: 'A card played as an OC is not removed.', cite: ['5.36'] },
    ],
  },
  {
    key: 'special',
    title: 'Special Events',
    statements: [
      { text: 'Tojo Resigns and Soviets Invade Manchuria are Special Event cards. They must be played in the Offensives phase of the turn they are drawn, if the event conditions are met.', cite: ['5.37'] },
      { text: 'They may not be played as a Future Offensive. Your only choice is when to play them within that phase.', cite: ['5.37'] },
      { text: 'If one is drawn before its event can happen (for example Tojo Resigns), you may play it as an OC. The deck is then reshuffled at the end of the turn to bring back that card and the Discard pile (not cards removed from play).', cite: ['5.37'] },
      { text: 'If a Special Event is discarded because of another event or a player action, it occurs the instant it is discarded.', cite: ['5.37'] },
    ],
  },
];
