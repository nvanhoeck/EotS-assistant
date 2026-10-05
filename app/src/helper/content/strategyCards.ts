import type { Section } from '../types';

export const STRATEGY_CARD_SECTIONS: Section[] = [
  {
    key: 'deal',
    title: 'The deal',
    statements: [
      { text: 'In the Deal Strategy Cards segment the Japanese player receives 4 to 7 cards from the top of the Japanese deck, depending on the outcome of Strategic Warfare.', cite: ['4.14'], links: ['strategic-warfare'] },
      { text: 'The Allied player receives 4 to 7 cards from the top of the Allied deck, depending on the game turn, on War in Europe and on whether certain Allied nations have surrendered.', cite: ['4.14', '12.51', '12.52', '15.5'], links: ['strategic-warfare'] },
      { text: 'The scenario can define a different deal on its first turn. On turn 1 of the full Campaign (the December 1941 Special Turn) the Allied player receives no cards and the Japanese player only plays two specific cards as events: Operation Z and IAI.', cite: ['4.14', '12.51', '17.11'] },
      { text: 'The player with the most cards in hand goes first in the Offensives phase, with a few exceptions (the Initiative segment).', cite: ['4.21'] },
    ],
  },
  {
    key: 'public-info',
    title: 'What both players may know',
    statements: [
      { text: 'The number of cards in a player’s hand is public information (not which cards).', cite: ['5.0'] },
      { text: 'The Discard piles and the cards removed from play are disclosed information, and either player can examine them. Draw piles cannot be examined by either player.', cite: ['5.0'] },
    ],
  },
  {
    key: 'basics',
    title: 'Playing cards: the basics',
    statements: [
      { text: 'Each player has a deck of unique Strategy cards and can only draw and play from their own deck, although some cards make the other player discard.', cite: ['5.0'] },
      { text: 'Players alternate in the Offensives segment. On your turn you must play a card, use one of a limited number of passes, designate a Future Offensives card, or discard a card. The Offensives phase ends when both players have played all the cards in their hands.', cite: ['5.0', '4.22'] },
      { text: 'A card is played as an Operations Card (OC), as an Event Card (EC), designated a Future Offensives card, or discarded.', cite: ['5.0', '7.29'], links: ['initiative'] },
      { text: 'As an OC you do one of: an OC Offensive, a China OC Offensive, withdraw an HQ, bring an HQ into play from the game turn record track, or construct a strategic transport route (a 3 OC play).', cite: ['5.0', '7.0', '13.72', '6.13', '6.15', '13.77'] },
      { text: 'A Military event can always be played as an OC to start an OC Offensive instead. The OC Offensive rules then apply as normal and all the card text is ignored.', cite: ['5.0'] },
      { text: 'Played and discarded cards go to the Discard pile for reuse, unless the card text says otherwise.', cite: ['5.0'] },
      { text: 'A card played as an OC goes to the Discard pile for possible reuse even if its event would be removed from play when played as an event.', cite: ['5.0', '5.36'] },
      { text: 'Passes: Japan gets 2 with 5 or fewer cards and 1 with 6 (not counting a Future Offensives card); the Allies get them on turns 2 and 3 and for draw limitations. Unused passes are lost at the end of the Offensives phase.', cite: ['12.4', '12.51', '12.52'] },
    ],
  },
  {
    key: 'ops-value',
    title: 'Operations value',
    statements: [
      { text: 'Every card has an Operations value of 1, 2 or 3. In an OC Offensive it sets both the movement range of units and the number of units that can be activated. In an EC Offensive it still sets the movement range, but not the number of units activated.', cite: ['5.1'] },
      { text: 'Movement allowance = the unit’s base value × the card’s Operations value (or an EC text that supersedes it). Base values: naval 5, ground 1, air = its range or extended range. With a 2 OC, ground units have 2 movement points and naval units move 10 hexes; the OC value also sets the number of legs an air unit gets.', cite: ['8.1', '7.22', '8.31'] },
      { text: 'Air units move in legs, and every leg ends at a friendly airfield. Air units that use their extended range cannot take part in battle.', cite: ['8.31', '8.1'] },
      { text: 'Offensives player activation: the HQ’s Efficiency rating plus, as an OC, the card’s Operations value, or as an event, the event’s Logistics value. Units must be in supply. The Efficiency rating is reduced by 1 for a US or Joint HQ that cannot trace supply to the East map edge, and for a Japanese HQ activating units in Burma, Ceylon or Northern India without the Bangkok-Rangoon link (the Bridge over the River Kwai can add +1).', cite: ['7.21', '6.11', '6.25', '13.79'] },
      { text: 'Reaction player activation: the HQ’s Efficiency plus the Offensives player’s card Operations value (whether played as an OC or an EC). If their Reaction event has a Logistics value, they use that instead of the OC value. The OC value also sets how far reacting units can move.', cite: ['5.1', '7.26'] },
    ],
  },
  {
    key: 'intelligence',
    title: 'Intelligence conditions',
    statements: [
      { text: 'Every Offensive is a surprise attack unless the Reaction player changes it to an intercept or ambush.', cite: ['5.2', '7.25'] },
      { text: 'With a Reaction card: a Reaction card that specifies Intercept or Ambush sets the condition for the whole offensive and all its battles. It supersedes the condition of the Strategy card. Playing it is optional.', cite: ['7.25', '5.32'] },
      { text: 'With a die roll (only if no Reaction card was played and the offensive card did not specifically call for surprise attack): a roll equal to or lower than the card’s intelligence value makes it intercept (never ambush). Use the OC value if the offensive was started as an OC, and the EC value if as an event. A higher roll leaves it a surprise attack. Only one roll per offensive.', cite: ['5.2', '7.26'] },
      { text: 'Air reconnaissance: if any Offensives unit moves into, through or out of an opposing air ZOI (neutralized or not), the Reaction player subtracts 2 from the roll. An unmodified 9 always fails.', cite: ['7.25'] },
      { text: 'If an event offensive specifies surprise attack, only a Reaction card can change it, never a die roll.', cite: ['5.31', '7.26'] },
    ],
  },
  {
    key: 'military',
    title: 'Military events',
    statements: [
      { text: 'Military events (also called EC Offensives) allow multi-battle-hex Offensives, unlike the one battle hex of an OC play. All have a Logistics value. Units activated = the event’s Logistics value + the Efficiency rating of your HQ (not the Operations value).', cite: ['5.31', '7.21'] },
      { text: 'If you cannot comply with all of an event’s clauses, except bonuses, the card can be played only as an OC or discarded, not as an event.', cite: ['5.31'] },
      { text: 'Activation instructions: many events restrict which named HQs can or cannot be used.', cite: ['5.31'] },
      { text: 'Intelligence conditions: if the card says Surprise Attack, the Reaction player cannot make an intelligence die roll to alter the condition (the OC value is used for Special Reaction), but may still play a Reaction card to change it.', cite: ['5.31', '7.27'] },
      { text: 'Reinforcement units: some Military events bring in a special unit (for example Slim’s Burma Offensive brings the British 7th Armor Brigade). Place it as the card says.', cite: ['5.31'] },
      { text: 'Special conditions last for the whole offensive but not beyond, unless stated. Wording like “only” marks a mandatory part. A card that says “no additional effect” in some situation can still be played if the other part can be met.', cite: ['5.31'] },
    ],
  },
  {
    key: 'reaction',
    title: 'Reaction events',
    statements: [
      { text: 'Only the Reaction player can play Reaction events, and the only cards the Reaction player may play are those whose title says they are Reaction events.', cite: ['5.32'] },
      { text: 'Play them after the Offensives player has moved all offensive units, provided there is at least one declared battle hex or the text says otherwise. At most three Reaction events per offensive, not per battle.', cite: ['5.32'] },
      { text: 'Intelligence: changes the intelligence condition to intercept or ambush. More than one Reaction event can be played in an offensive; if both intercept and ambush are possible, it is ambush. Once the Reaction player has made an intelligence die roll, Reaction cards can no longer change the condition unless the card says so.', cite: ['5.32', '7.25', '7.26'] },
      { text: 'Attack (submarine, kamikaze, skip bombing): potential extra damage to the Offensives player. Follow the card text. More than one Attack card can be played in an offensive.', cite: ['5.32', '7.2'] },
      { text: 'Counteroffensive: lets the Reaction player activate more units than would normally be possible and alters the intelligence condition like an Intelligence card. Its Logistics value is used for the number of units activated; movement points still use the Offensives card’s OC value. Only one Counteroffensive may be played per offensive.', cite: ['5.32', '7.26'] },
      { text: 'Weather: cancels an Offensive that activates units. Play it after the Offensives player’s movement and before an intelligence die roll. Units return to their start, which ends the offensive; no event bonuses or reinforcements enter play, ASPs are not used, and no other events may be played with it. The cancelled card counts as discarded, not played. All Weather cards are removed from play when played as an event.', cite: ['5.32', '7.2'] },
      { text: 'Personage (for example Ghandi, Wingate): follow the card text.', cite: ['5.32'] },
    ],
  },
  {
    key: 'resource',
    title: 'Resource events',
    statements: [
      { text: 'Only the Offensives player can play Resource events. They give new units, capabilities or replacements.', cite: ['5.33'] },
      { text: 'A reinforcement unit is placed on the map under the same restrictions as in the Reinforcement segment.', cite: ['5.33', '10.1'], links: ['reinforcements'] },
      { text: 'Replacements that must be used immediately are placed as if it were the Replacement segment. If the card gives a choice, saved replacements are recorded on the strategic resource track with the right marker.', cite: ['5.33', '11.0'], links: ['replacements'] },
      { text: 'If you cannot meet the conditions under which a reinforcement unit is supplied, the unit is lost. Replacements you cannot use or save are permanently lost.', cite: ['5.33'] },
    ],
  },
  {
    key: 'political',
    title: 'Political events',
    statements: [
      { text: 'Political events move a marker on one of the game tracks, in the direction and by the distance printed on the card.', cite: ['5.34'] },
      { text: 'The five kinds: China OC Offensives, India stability, War in Europe, US Political Will changes, and Inter-Service Rivalry.', cite: ['5.34'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'drawing',
    title: 'Drawing a card',
    statements: [
      { text: 'Many events say you draw a Strategy card. You never draw when a card is played as an OC, only when it is played as an event.', cite: ['5.35'] },
      { text: 'You cannot use a card you just drew during the current offensive.', cite: ['5.35'] },
      { text: 'You can never draw more than three cards this way in one Offensives phase. After three, further draws in that phase are ignored.', cite: ['5.35'] },
      { text: 'Play note: use the Card Max counters on the Strategic Record Track to count the draws.', cite: ['5.35'] },
    ],
  },
  {
    key: 'removing',
    title: 'Removing a card',
    statements: [
      { text: 'Many events say they are removed from the game. A card used as an event with that provision is removed after its first use and never returns.', cite: ['5.36'] },
      { text: 'A card played as an OC or discarded is not removed.', cite: ['5.36'] },
    ],
  },
  {
    key: 'special',
    title: 'Special Events',
    statements: [
      { text: 'Tojo Resigns and Soviets Invade Manchuria are Special Event cards. They must be played, as an OC or an EC, in the Offensives phase of the turn they are drawn.', cite: ['5.37'] },
      { text: 'They may not be played as a Future Offensive or voluntarily discarded.', cite: ['5.37', '7.29'] },
      { text: 'If one is drawn before its event can be played (for example Tojo Resigns) or its precondition is not yet met (Manchuria), you may play it as an OC. The deck is then reshuffled at the end of the turn to bring back that card and the Discard pile (not cards removed from play).', cite: ['5.37'] },
      { text: 'If a Special Event is discarded because of another event and its criteria are fulfilled, it occurs the instant it is discarded. If the criteria are not fulfilled, the discard pile is reshuffled as if the card had been played as an OC.', cite: ['5.37'] },
    ],
  },
];
