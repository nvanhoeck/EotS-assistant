import type { Section } from '../types';

export const OFFENSIVES_SECTIONS: Section[] = [
  {
    key: 'overview',
    title: 'What an Offensive is',
    statements: [
      { text: 'Offensives are the core of the game. An Offensive starts with the Offensives player playing a Strategy card as an Operations Card, or as an Event Card with a Logistics value.', cite: ['7.1'] },
      { text: 'The player starting the offensive is the Offensives player; the other is the Reaction player until the offensive ends. Only one HQ per side can be used to activate units for one offensive.', cite: ['4.22', '6.3'] },
      { text: 'Players alternate as Offensives player. If one runs out of cards, the role simply switches to the opponent, who keeps playing cards one at a time until all are played.', cite: ['4.22'] },
      { text: 'An OC offensive can declare only one battle hex. An EC offensive can declare any number of battle hexes.', cite: ['7.24'] },
      { text: 'The steps in order: 1 activate, 2 move, 3 declare battle hexes, 4 the Reaction player may cancel with Weather, 5 event bonuses before reaction, 6 Special Reaction, 7 intelligence condition, 8 the Reaction player activates and moves, 9 Reaction Attack cards, 10 event bonuses after reaction, 11 resolve all battles, 12 Attack cards after battles, 13 post battle movement, 14 emergency naval and air movement.', cite: ['7.2'] },
      { text: 'If no battle hexes were declared or created by Special Reaction, the Reaction player may play Attack Reaction cards and you skip straight to step 13. If the condition is still Surprise Attack at the end of step 7, skip to step 9.', cite: ['7.2'] },
    ],
  },
  {
    key: 'activation',
    title: 'Step 1: Activate units',
    statements: [
      { text: 'The Offensives player activates supplied units within activation range of an eligible HQ, and implements any event bonuses that apply before movement (including receiving reinforcements).', cite: ['7.2', '7.21'], links: ['supply'] },
      { text: 'Units you may activate = the HQ’s Efficiency rating plus either the card’s OC value or the event’s Logistics value. The Efficiency rating is reduced for a US or Joint HQ with no supply line to the East map edge, and for a Japanese HQ activating units in Burma, Ceylon or Northern India without the Bangkok-Rangoon link (+1 with the Bridge over the River Kwai).', cite: ['7.21', '6.11', '6.25', '13.79'] },
      { text: 'Units must be in supply and have an activation path from the HQ, no longer than the HQ’s Command Range. Opposing air ZOI and enemy-occupied hexes can block the path.', cite: ['7.21', '6.3', '6.4'] },
      { text: 'HQs can only activate certain nationalities, unless an event says otherwise. US HQs: US (Army and Navy) and Chinese units. Commonwealth HQs: Commonwealth, Chinese and US air units. Joint HQs: any Allied unit (only Joint HQs can activate Dutch units). Japanese HQs: any Japanese unit.', cite: ['7.21', '6.12'] },
      { text: 'Inter-Service Rivalry limits which kinds of unit one HQ can activate in an offensive.', cite: ['14.1', '14.2'], links: ['national-us'] },
    ],
  },
  {
    key: 'movement',
    title: 'Step 2: Move activated units',
    statements: [
      { text: 'Distance moved = the unit type’s base movement allowance times the OC value of the card (naval 5, ground 1, air its range). An event can supersede the OC value.', cite: ['7.22', '8.1'], links: ['movement'] },
      { text: 'Move each stack to completion before moving another unit or stack. Units may not be picked up or dropped off during movement.', cite: ['7.23'] },
      { text: 'The main impediment is opposing air ZOI. Every supplied air and carrier unit projects a two-hex ZOI that restricts strategic movement and amphibious assaults. Non-LRB air and carrier units you move can neutralize opposing ZOI, so the order of your moves matters.', cite: ['7.23', '6.4'] },
      { text: 'Play note: move air and carrier units first to neutralize opposing ZOI; moving a carrier with the ground units neutralizes ZOI as it moves. The opposite order can stop amphibious assaults or strategic movement.', cite: ['7.23'] },
    ],
  },
  {
    key: 'declare',
    title: 'Step 3: Declare battle hexes',
    statements: [
      { text: 'After all Offensive movement the Offensives player declares the battle hexes. A hex that contains both Offensive and Reaction units (including HQs) must be a battle hex.', cite: ['7.24'] },
      { text: 'A hex with only Reaction units, but within range of activated Offensive air and carrier units that are not taking part in other battles, may be a battle hex. Non-coastal hexes in China may not be declared battle hexes.', cite: ['7.24'] },
      { text: 'An OC allows one battle hex. An EC allows as many as you like.', cite: ['7.24'] },
      { text: 'For each battle hex, state which units will take part. No unit takes part in more than one battle per offensive, and all units in a battle hex must take part in that battle.', cite: ['7.24'] },
      { text: 'Every carrier that did not end its move in a friendly port must be declared to take part in a battle hex within its range, or to cover a friendly ground unit making an amphibious assault on an empty enemy-controlled hex. Other activated air units and port-based carriers may optionally cover a battle hex in range.', cite: ['7.24'] },
      { text: 'More than one battle can happen even on an OC, because of Special Reactions.', cite: ['7.24', '7.27'] },
    ],
  },
  {
    key: 'weather',
    title: 'Step 4: Weather',
    statements: [
      { text: 'The Reaction player may cancel the Offensive with a Weather Reaction event. All units go back to their starting locations, event reinforcements and replacements are removed, the card goes to the Discard pile, ASPs used are returned, and the offensive is concluded.', cite: ['7.2', '5.32'] },
    ],
  },
  {
    key: 'special-reaction',
    title: 'Step 6: Special Reaction',
    statements: [
      { text: 'If an enemy ground unit ends its move in an unoccupied Reaction-controlled city, resource hex, port or airfield within range of a Reaction HQ and in a Reaction air ZOI (neutralized or not), the Reaction player may attempt a Special Reaction on that hex. Hexes entered only by ground movement are not eligible.', cite: ['7.27'] },
      { text: 'It needs a successful intelligence die roll, never a card; the -2 ZOI modifier applies. Roll separately for each eligible hex. On an EC with Surprise Attack use the OC intelligence value. On success the hex becomes a battle hex, even if no battle hex was declared.', cite: ['7.27'] },
      { text: 'Special Reaction does not change the intelligence condition. Air and carrier units assigned to cover the landing take part in the new battle.', cite: ['7.27'] },
    ],
  },
  {
    key: 'intelligence',
    title: 'Step 7: Intelligence condition',
    statements: [
      { text: 'The condition is the same for every battle hex of the offensive.', cite: ['7.25'] },
      { text: 'It is Surprise Attack by default, unless the card sets a condition.', cite: ['7.25', '5.31'] },
      { text: 'The Reaction player can change it with a Reaction card that states Intercept or Ambush. A Reaction card supersedes the Strategy card’s condition. If both Intercept and Ambush are played, it is Ambush.', cite: ['7.25'] },
      { text: 'Otherwise, if (and only if) the Reaction player played no card and the Offensive card did not specifically call for surprise attack, they can make one intelligence die roll per offensive. Success changes Surprise Attack to Intercept (never Ambush). Making a die roll rules out Reaction cards afterwards unless a card says otherwise.', cite: ['7.26'] },
      { text: 'The roll succeeds on or below the card’s OC intelligence value (if started as an OC) or EC intelligence value (if started as an event). Subtract 2 if Offensive units moved into, through or out of an opposing air ZOI; an unmodified 9 always fails.', cite: ['7.26', '7.25'] },
    ],
  },
  {
    key: 'reaction',
    title: 'Step 8: Reaction move',
    statements: [
      { text: 'With a Surprise Attack there is no Reaction move: the Offensives player goes straight to resolving battles, after the Reaction player has had a chance to play Attack cards.', cite: ['7.26'] },
      { text: 'With Intercept or Ambush the Reaction player may designate one, and only one, in-supply HQ as the reacting HQ, if at least one declared battle hex is within its range (this range cannot be blocked by any means).', cite: ['7.26'], links: ['supply'] },
      { text: 'The HQ may activate only units that are in supply and have an activation path from the HQ. The path may enter a hex occupied by opposing land units if it is a declared battle hex. Activated units may join any declared battle they can reach, even one out of the HQ’s range.', cite: ['7.26'] },
      { text: 'Units activated = the HQ’s Efficiency rating plus the Offensives card’s OC value (whether played as an OC or an EC), or the Logistics value of a counteroffensive Reaction card.', cite: ['7.26', '5.32'] },
      { text: 'No more than one ASP may be used in Reaction movement. Japanese organic naval transport is unaffected.', cite: ['7.26', '8.46'] },
      { text: 'All units the Reaction player activates must take part in a declared battle (or a Special Reaction battle), and they cannot use strategic movement. Activated air and carrier units may leave a battle hex, but must still fight in the battle they left; other units that start in a battle hex stay there. Reaction is never obligatory.', cite: ['7.26'] },
    ],
  },
  {
    key: 'resolve',
    title: 'Steps 11 to 14: Battles and after',
    statements: [
      { text: 'Players resolve all battles, one battle hex at a time. Each battle is air-naval combat, then ground combat.', cite: ['7.2', '9.0'], links: ['battle'] },
      { text: 'Then post battle movement is conducted, the Reaction player first. Even units that took part in no battle can do it. After it the offensive is concluded and the other player plays a Strategy card, or the Offensives phase ends if both players are out of cards.', cite: ['7.28', '9.6'] },
      { text: 'Finally any emergency naval and air movement is conducted.', cite: ['7.2', '8.22', '8.32'] },
    ],
  },
];
