import type { Section } from '../types';

export const OFFENSIVES_SECTIONS: Section[] = [
  {
    key: 'overview',
    title: 'What an Offensive is',
    statements: [
      { text: 'Offensives are the core of the game. A player plays one Strategy card as an Operations Card, or as an Event Card whose text specifies an offensive. A card is played as an OC or an EC, never both.', cite: ['6.0'] },
      { text: 'The player starting the offensive is the Offensives player; the other is the Reaction player until the offensive ends. More than one HQ can be used only if an event says so.', cite: ['6.0'] },
      { text: 'Players alternate as Offensives player. If one runs out of cards, the other keeps playing cards one at a time until all are played.', cite: ['6.1'] },
      { text: 'An OC offensive can declare only one battle hex and is less likely to be discovered. An EC offensive is larger, can declare any number of battle hexes, and is more likely to tip off the opposition.', cite: ['6.1'] },
      { text: 'The seven steps: 1 activate, 2 move, 3 declare battle hexes and the intelligence condition, 4 the Reaction player tries to change the condition, 5 the Reaction player activates and moves, 6 resolve all battles, 7 post battle movement.', cite: ['6.2'] },
      { text: 'If no battle hexes are declared (or created by Special Reaction), skip straight to step 7. If the condition is still Surprise Attack at the end of step 4, skip step 5.', cite: ['6.2'] },
    ],
  },
  {
    key: 'activation',
    title: 'Step 1: Activate units',
    statements: [
      { text: 'The Offensives player activates supplied units within Activation Range of an eligible HQ.', cite: ['6.2'], links: ['supply'] },
      { text: 'Units you may activate = the HQ’s Efficiency rating plus either the card’s OC value or the event’s Logistics value.', cite: ['6.21', '5.12'] },
      { text: 'Units must be in supply and within the HQ’s range. Opposing air ZOI can affect the path from the HQ to the unit.', cite: ['6.21', '7.52', '7.35'] },
      { text: 'HQs can only activate certain nationalities, unless an event says otherwise. US HQs: US (blue or green) and Chinese units. Commonwealth HQs: Commonwealth, Chinese and US air units. Joint HQs: any Allied unit (only Joint HQs can activate Dutch units). Japanese HQs: any Japanese unit.', cite: ['6.21', '7.53'] },
      { text: 'Inter-Service Rivalry limits which kinds of unit one HQ can activate in an offensive.', cite: ['14.1', '14.2'], links: ['national-us'] },
    ],
  },
  {
    key: 'movement',
    title: 'Step 2: Move activated units',
    statements: [
      { text: 'Distance moved = the unit type’s base movement allowance times the OC value of the card (naval 5, ground 1, air its range). An event can supersede the OC value.', cite: ['6.22', '7.1'], links: ['movement'] },
      { text: 'Move each stack to completion before moving another unit or stack.', cite: ['6.23'] },
      { text: 'The main impediment is opposing air ZOI. Every supplied air and carrier unit projects a two-hex ZOI that restricts strategic movement and amphibious assaults. Non-LRB air and carrier units you move can neutralize opposing ZOI, so the order of your moves matters.', cite: ['6.23', '7.35'] },
      { text: 'Play note: move air and carrier units first to neutralize opposing ZOI; moving a carrier with the ground units neutralizes ZOI as it moves. The opposite order can stop amphibious assaults or strategic movement.', cite: ['6.2'] },
    ],
  },
  {
    key: 'declare',
    title: 'Step 3: Declare battle hexes',
    statements: [
      { text: 'After all Offensive movement the Offensives player declares the battle hexes. A hex that contains both Offensive and Reaction units (including HQs) must be a battle hex.', cite: ['6.24'] },
      { text: 'A hex with only Reaction units, but within range of activated Offensive air and carrier units, may be a battle hex.', cite: ['6.24'] },
      { text: 'An OC allows one battle hex. An EC allows as many as you like. Units may move through and end in unoccupied opposing-controlled hexes.', cite: ['6.24', '6.21'] },
      { text: 'For each battle hex, state which units will take part. No unit takes part in more than one battle per offensive, but may fight once in each offensive of the turn.', cite: ['6.21'] },
      { text: 'More than one battle can happen even on an OC, because of Special Reactions.', cite: ['6.24', '6.27'] },
      { text: 'If no battles are declared, the offensive ends and the other player plays a card (except for a Special Reaction).', cite: ['6.21'] },
    ],
  },
  {
    key: 'intelligence',
    title: 'Steps 3 and 4: Intelligence condition',
    statements: [
      { text: 'The condition is the same for every battle hex of the offensive.', cite: ['6.25'] },
      { text: 'It starts as set by the card. An OC play, or an event that does not state the condition, is a Surprise Attack.', cite: ['6.25'] },
      { text: 'The Reaction player can change it with a Reaction card that states Intercept or Ambush. A Reaction card overrides the card’s condition. If both Intercept and Ambush are played, it is Ambush. Weather cards are played first.', cite: ['6.25'] },
      { text: 'Otherwise, unless the card called for Surprise Attack, the Reaction player can make one intelligence die roll. Success changes Surprise Attack to Intercept (never Ambush). Making a die roll rules out Reaction cards afterwards unless a card says otherwise.', cite: ['6.25', '5.22'] },
      { text: 'The roll succeeds on or below the card’s OC intelligence value (if started as an OC) or EC intelligence value (if started as an event). Subtract 2 if Offensive units move into, through or out of an opposing air ZOI; an unmodified 9 always fails.', cite: ['6.25', '5.22'] },
    ],
  },
  {
    key: 'reaction',
    title: 'Step 5: Reaction move',
    statements: [
      { text: 'With a Surprise Attack there is no Reaction move: the Offensives player goes straight to resolving battles.', cite: ['6.26'] },
      { text: 'With Intercept or Ambush the Reaction player may designate one, and only one, in-supply HQ as the reacting HQ, if at least one declared battle hex is within its range (this range cannot be blocked by any means).', cite: ['6.26'], links: ['supply'] },
      { text: 'The HQ may activate only units that are in supply and within its activation range. The path may enter a hex occupied by opposing land units if it is a declared battle hex.', cite: ['6.26'] },
      { text: 'Units activated = the HQ’s Efficiency rating plus the Offensives card’s OC value (whether played as an OC or an EC), or the Logistics value of a counteroffensive Reaction card.', cite: ['6.26', '5.13'] },
      { text: 'No more than one ASP may be used in Reaction movement. Japanese organic naval transport is unaffected.', cite: ['6.26', '7.46'] },
      { text: 'The Reaction player may activate only units that will take part in a declared battle, and cannot use strategic movement. Units move only into declared battle hexes (or Special Reaction hexes). Only air and carrier units can leave a battle hex in reaction, and they must still fight in the battle they left. Reaction is never obligatory.', cite: ['6.28'] },
      { text: 'Special Reaction: if an enemy ground unit ends its move in an unoccupied Reaction-controlled city, resource hex, port or airfield within range of a Reaction HQ and in a Reaction air ZOI (neutralized or not), the Reaction player may roll the intelligence die (never a card). On success the hex becomes a battle hex and a normal reaction move follows. Hexes entered only by ground movement are not eligible.', cite: ['6.27'] },
    ],
  },
  {
    key: 'resolve',
    title: 'Steps 6 and 7: Battles and after',
    statements: [
      { text: 'Players resolve all battles, one battle hex at a time in any order the Offensives player likes. Each battle is air-naval combat, then ground combat.', cite: ['6.2', '8.0'], links: ['battle'] },
      { text: 'Then post battle movement is conducted, the Reaction player first. After it the offensive is concluded and the other player plays a Strategy card, or the Offensives phase ends if both players are out of cards.', cite: ['6.28', '8.6'] },
    ],
  },
];
