import type { Section } from '../types';

export const MOVEMENT_SECTIONS: Section[] = [
  {
    key: 'basics',
    title: 'Base movement allowance',
    statements: [
      { text: 'Distance in an offensive or reaction = the unit type’s base movement allowance times the OC value of the card, or an event’s text if it supersedes the OC value.', cite: ['8.1', '7.22'] },
      { text: 'Base values: ground 1 movement point, naval 5, air equal to its range. If two ranges are printed, use either.', cite: ['8.1'] },
      { text: 'A parenthetical extended range may be used, but the air unit then cannot take part in a battle. To fight, it must move on its normal range.', cite: ['8.1', '8.31'] },
      { text: 'Air and naval units can move through hexes occupied by enemy units. Ground units conducting strategic ground transport or amphibious assault are treated as naval units for this, except that to enter or move through a hex with an enemy naval unit they must move as part of a stack with a naval unit.', cite: ['8.11'] },
      { text: 'A ground unit moving by ground movement can pass through hexes holding only enemy naval units (unless already declared battle hexes), but must stop on entering a hex with an enemy air, ground or HQ unit, or a declared battle hex.', cite: ['8.11', '8.42'] },
    ],
  },
  {
    key: 'naval',
    title: 'Naval units',
    statements: [
      { text: 'A naval unit spends 1 point per hex entered. Move one unit or stack at a time to completion.', cite: ['8.2'] },
      { text: 'Naval units enter a hex across a water hexside, never across an all-land hexside or an unplayable ocean hexside.', cite: ['8.2'] },
      { text: 'Naval units can move through un-neutralized opposing air ZOI, but not when moving with a ground unit in an amphibious assault or on strategic naval movement. Carriers do not neutralize enemy ZOI while using strategic naval movement.', cite: ['8.2'] },
      { text: 'A naval unit must end in a hex with enemy units, or a hex from which friendly carriers and stacked ships may take part in a battle, or a hex with a friendly port, or in (or in range of) an unoccupied enemy-controlled hex that holds a friendly ground unit which entered by amphibious assault before the ship ended its move. A non-carrier ship may also end in an unoccupied hex if it is a Japanese ship using organic transport (8.46).', cite: ['8.2'] },
      { text: 'Naval units must end post battle movement in a friendly port. One that cannot end an offensive in a friendly-controlled port hex is eliminated.', cite: ['8.2', '9.6'] },
      { text: 'Emergency Naval Move: if an offensive ends (or a national surrender happens) with the enemy gaining a hex that holds inactive naval units, they must be placed in a friendly port within 10 hexes of the owner’s choice. Air ZOI has no effect. With no port in range they are eliminated.', cite: ['8.22'] },
      { text: 'Strategic Naval Movement: an Offensives naval unit may move twice the allowed distance if it moves from a friendly port to another friendly port. It cannot enter a battle or an un-neutralized opposing air ZOI, and cannot use post battle movement. A carrier exerts no ZOI during the move.', cite: ['8.23'] },
    ],
  },
  {
    key: 'air',
    title: 'Air units',
    statements: [
      { text: 'An air unit moves in legs no longer than its extended range (the larger value), or normal range if it has none or does not use it. It must land in a friendly-controlled hex with an airfield at the end of each leg. It may not end its move in a hex with an enemy ground unit, but may use that hex’s friendly airfield between two legs.', cite: ['8.31'] },
      { text: 'Air units may not enter a battle hex, but one already in a hex when it is declared a battle hex need not move out. To fight, an air unit must be at a friendly airfield within range of the battle, or in the battle hex.', cite: ['8.31'] },
      { text: 'An air unit that moves out of a battle hex in a Reaction move must still fight in that battle.', cite: ['8.31'] },
      { text: 'Emergency Air Move: if an offensive ends (or a national surrender happens) with the enemy gaining a hex that holds inactive air units, they must be placed at a friendly airfield within normal or extended range of the owner’s choice (extended range is allowed even after fighting). With none in range they are eliminated.', cite: ['8.32'] },
      { text: 'Strategic Air Transport: an Offensive air unit may fly up to twice its normal number of legs between friendly airfields, landing at an airfield after every leg (example: range 4 with a 2 OC covers 4 legs of 4 hexes, 16 hexes). It cannot enter an un-neutralized opposing air ZOI, cannot be used in a battle that offensive, and exerts no ZOI during the move.', cite: ['8.33'] },
      { text: 'A second kind of strategic transport: whenever the Offensives player activates an air unit he may remove it to the game turn track instead; it returns in the next reinforcement phase and cannot be delayed.', cite: ['8.33'] },
      { text: 'Air Ferry in hex 5408: Allied air units only may use its airfield for landing-leg purposes. No air or ground unit may end its move there. A Japanese naval unit in the hex during an Offensive temporarily neutralizes it.', cite: ['8.35'] },
    ],
  },
  {
    key: 'zoi',
    title: 'Air zones of influence',
    statements: [
      { text: 'All in-supply air and carrier units project a 2-hex ZOI. It is neutralized if an opposing ZOI is projected into the same hex by a non-LRB unit (LRB units project a ZOI but cannot neutralize). An out-of-supply unit has no ZOI. A ZOI is in effect at all times when the unit is stationary and during non-strategic moves; a unit on strategic movement has none until the move ends.', cite: ['6.4'] },
      { text: 'An un-neutralized ZOI: stops any unit entering or leaving it on strategic movement; stops ground units entering or leaving it by amphibious assault; blocks an HQ activation path entering or leaving it across an all-water hexside; blocks a supply path the same way.', cite: ['6.4'], links: ['supply'] },
      { text: 'Even when neutralized, a ZOI gives -2 to the Reaction player’s intelligence roll when Offensives units enter, exit or move within it, and an amphibious landing within it may allow a Special Reaction.', cite: ['6.4', '7.25', '7.27'] },
      { text: 'It does not affect: ground movement between land hexes across a land hexside; naval or air movement (other than strategic movement); activation or supply paths crossing a land hexside; or HQ range used to maintain reduced units in the Attrition phase.', cite: ['6.4'] },
    ],
  },
  {
    key: 'ground',
    title: 'Ground units',
    statements: [
      { text: 'Ground units have three ways to move: ground movement, amphibious assault and strategic ground transport. A ground unit may use only one type of movement in an Offensive; mixing types is not permitted.', cite: ['8.4'] },
      { text: 'Land movement costs 1 point for open terrain, 3 for a mountain hex and 2 for all other terrain, and half a point entering a hex with no enemy air or ground unit along a transport route. A unit cannot enter a hex without enough points, so a low OC may prevent ground movement.', cite: ['8.42'] },
      { text: 'A ground unit must stop on entering a hex with opposing land or air units or an opposing HQ. Naval units do not stop it. A ground unit may not exit a declared battle hex and must stop if entering one. Ground movement must be across ground hexsides.', cite: ['8.42'] },
      { text: 'In reaction a ground unit may use transport routes but cannot enter a hex at the transport rate if an enemy ground unit is there. A hex with a No Transport Route marker cannot be moved to or from at the transport route cost.', cite: ['8.42'] },
      { text: 'Movement restrictions: Japanese ground units cannot enter non-coastal Chinese hexes, and Allied units in non-coastal China may not be attacked; Japanese ground units may enter Northern India or Ceylon but go no further into India; no unit may enter Soviet territory; only Chinese ground units may enter non-coastal China; Chinese units may only operate in Burma, Northern India, Kunming and its adjacent hexes (otherwise eliminated).', cite: ['8.41'], links: ['national-china'] },
      { text: 'Ground disengagement: a Reaction ground unit may leave a hex in which an opposing Offensives ground unit just arrived if it can move to a hex with no opposing units other than the one the enemy came from, and its attack strength (or combined strength) is greater than, not equal to, the enemy’s. The move ignores MP cost and may continue if points are left.', cite: ['8.43'] },
    ],
  },
  {
    key: 'strategic',
    title: 'Strategic ground transport',
    statements: [
      { text: 'An amphibious-capable ground unit moves from a coastal hex (with or without a port) to a friendly port, up to the distance a friendly naval unit may move in this offensive. If it starts in a friendly port the distance doubles.', cite: ['8.44'] },
      { text: 'The path never enters an un-neutralized opposing air ZOI, and the move may not end in a hex with an enemy unit. The unit must finish in a friendly port. It cannot combine strategic transport with other movement in the same offensive, and uses no ASPs.', cite: ['8.44'] },
      { text: 'A port captured by ground movement during the offensive counts as a friendly port. A hex entered only by amphibious assault turns friendly just before post battle movement, so it cannot be a destination.', cite: ['8.44'] },
    ],
  },
  {
    key: 'amphibious',
    title: 'Amphibious assault',
    statements: [
      { text: 'Capable: all Japanese, US, Commonwealth British (except the Armor Brigade), Australian and New Zealand ground units. Dutch, Indian and Chinese units are not (and may not use strategic transport either).', cite: ['8.45'] },
      { text: 'A unit moves from any coastal hex to any coastal hex, up to a naval unit’s distance for the offensive. It never doubles. It may enter any non-mountain coastal hex (except Port Moresby, 3823, which can be assaulted) whether or not it holds enemy ground units.', cite: ['8.45'] },
      { text: 'Event cards that restrict naval activation do not stop amphibious units, and Inter-Service Rivalry does not stop Army units (Japanese or US) from using amphibious assault.', cite: ['8.45'] },
      { text: 'ASP cost: one ASP per ground unit of division size (XX) or smaller; for a Corps or Army (XXX or XXXX) one ASP per step (reduced 1, full 2). The Japanese Korean Army costs two ASP per step (full strength 4). Each ASP is used once per turn; mark it on the Strategic Record.', cite: ['8.45', '10.3'] },
      { text: 'In Reaction no more than one ASP may be used. Japanese organic transport costs no ASP and is not limited in Reaction.', cite: ['8.45', '7.26', '8.46'] },
      { text: 'Restrictions: the path may not enter or leave a hex with an opposing naval unit (active or inactive) unless the assault moves with a friendly naval unit escort all the way. It may not enter or leave an un-neutralized opposing air ZOI.', cite: ['8.45'] },
      { text: 'Without an escort, if opposing naval forces of any type end reaction movement in the battle hex, the assault is turned back: each ground unit takes a one-step loss and does not take part in the battle. If no units are left in the battle, the Offensives player has lost and the battle is cancelled. Surviving units do post battle movement.', cite: ['8.45'] },
      { text: 'If after battle the assaulting unit is not in a friendly-controlled hex, it does post battle movement like a naval unit and must end in a friendly port or coastal hex, or it is eliminated.', cite: ['8.45'] },
      { text: 'US Army (blue) ground units may assault a Japanese-controlled and occupied one-hex island only if they end in a hex with a US Marine unit that also just completed an amphibious assault into it. No such limit applies on multi-hex islands or in Reaction.', cite: ['8.45'] },
      { text: 'Japanese organic transport: five brigades (1st to 4th SN and the SS) can assault either with one ASP, or by starting stacked with a CA, CL or APD and moving with it all the way at no ASP. One ship moves one brigade; if the ship is eliminated before ground combat resolution the brigade is too.', cite: ['8.46'] },
      { text: 'Japanese barges: after the Barge event, in an offensive with a 3 OC card (even played as an event), Japan can move 1 ground unit of any size across one all-sea hexside as an amphibious assault for 0 ASP. Offensive only, not Reaction. The Allied PT Boat card removes it.', cite: ['8.47'] },
    ],
  },
  {
    key: 'stacking',
    title: 'Stacking',
    statements: [
      { text: 'Stacking is checked after every Strategy card play, whether an offensive or an event.', cite: ['8.34', '8.48'] },
      { text: 'No more than three friendly air and/or ground units of any size per hex. Excess units are removed, air first. If in supply they go on the game turn record track to return the turn after next as reinforcements that cannot be delayed; if out of supply they are eliminated.', cite: ['8.34', '8.48'] },
      { text: 'Naval units: any number during an offensive or battle, but at most 6 of one player’s ships in a hex otherwise. Excess ships are removed: in supply, they return next turn as reinforcements that cannot be delayed; out of supply, they are eliminated.', cite: ['8.24'] },
      { text: 'Two air units with the same designation (some US air units and the Commonwealth SEAC air unit have an LRB twin) count as one for stacking, but not for any other purpose.', cite: ['8.34'] },
      { text: 'HQs do not count toward stacking, but there may never be more than one HQ, of either side, in a hex.', cite: ['6.0'] },
    ],
  },
  {
    key: 'armor',
    title: 'British Armor Brigade',
    statements: [
      { text: 'The 7th Armor Brigade (received through an event card) may not enter mountain hexes except via a transportation route or strategic ground transport.', cite: ['8.49'] },
      { text: 'It may not use amphibious assault but may use strategic ground transport.', cite: ['8.49'] },
    ],
  },
];
