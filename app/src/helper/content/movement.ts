import type { Section } from '../types';

export const MOVEMENT_SECTIONS: Section[] = [
  {
    key: 'basics',
    title: 'Base movement allowance',
    statements: [
      { text: 'Distance in an offensive or reaction = the unit type’s base movement allowance times the OC value of the card, or an event’s text if it supersedes the OC value.', cite: ['7.1', '5.11'] },
      { text: 'Base values: ground 1 movement point, naval 5, air equal to its range. If two ranges are printed, use either.', cite: ['7.11'] },
      { text: 'A parenthetical extended range may be used, but the air unit then cannot take part in a battle. To fight, it must move on its normal range.', cite: ['7.11', '7.31'] },
      { text: 'Air and naval units can move through hexes occupied by enemy units. Ground units conducting strategic movement or amphibious assault are treated as naval units for this, but cannot enter an un-neutralized enemy air ZOI.', cite: ['7.12'] },
      { text: 'A ground unit entering a battle hex by ground movement or amphibious assault must stop there.', cite: ['7.12'] },
    ],
  },
  {
    key: 'naval',
    title: 'Naval units',
    statements: [
      { text: 'A naval unit spends 1 point per hex entered. Move one unit or stack at a time to completion.', cite: ['7.21'] },
      { text: 'Naval units enter a hex across a water hexside, never across an all-land hexside or an unplayable ocean hexside.', cite: ['7.21'] },
      { text: 'Naval units can move through un-neutralized opposing air ZOI, but not when moving with a ground unit in an amphibious assault or on strategic naval movement. Carriers do not neutralize enemy ZOI while using strategic naval movement.', cite: ['7.21'] },
      { text: 'A naval unit must end in a battle hex, or a hex from which friendly carriers and stacked ships may take part in a battle, or a hex with a friendly port, or in (or in range of) an unoccupied enemy-controlled hex that holds a friendly ground unit. After post battle movement, one that cannot end in a friendly-controlled port hex is eliminated.', cite: ['7.21'] },
      { text: 'Emergency Naval Move: if an offensive ends (or a national surrender happens) with the enemy gaining a hex that holds inactive naval units, they are placed in a friendly port within 10 hexes of the owner’s choice. Air ZOI has no effect. With no port in range they are eliminated.', cite: ['7.22'] },
      { text: 'Strategic Naval Movement: an Offensives naval unit may move twice the allowed distance if it moves from a friendly port to another friendly port. It cannot enter a battle or an un-neutralized opposing air ZOI.', cite: ['7.23'] },
    ],
  },
  {
    key: 'air',
    title: 'Air units',
    statements: [
      { text: 'An air unit moves in legs no longer than its extended range (the larger value), or normal range if it has none. It must land at a friendly-controlled airfield (not affected by an enemy naval unit) at the end of each leg.', cite: ['7.31', '5.11'] },
      { text: 'Air units never enter the battle hex unless they started the offensive there. To fight, an air unit must be at a friendly airfield within range of the battle, or in the battle hex.', cite: ['7.31'] },
      { text: 'An air unit that moves out of a battle hex in a Reaction move must still fight in that battle.', cite: ['7.31'] },
      { text: 'Emergency Air Move: if an offensive ends with the enemy gaining a hex that holds air units, they are placed at a friendly airfield within normal or extended range of the owner’s choice (extended range is allowed even after fighting). With none in range they are eliminated.', cite: ['7.32'] },
      { text: 'Strategic Air Transport: an Offensive air unit may fly up to twice its allowance between friendly airfields, landing at an airfield every range increment (example: range 4 with a 2 OC covers 16 hexes in 4 legs). It cannot enter an un-neutralized opposing air ZOI and cannot be used in a battle that offensive.', cite: ['7.33'] },
      { text: 'A second kind of strategic transport: an air unit may be withdrawn from the map as the whole play of any OC and returns next turn as a reinforcement that cannot be delayed.', cite: ['7.33'] },
      { text: 'Air Ferry in hex 5408: Allied air units only may use its airfield for landing-leg purposes. No air or ground unit may end its move there. A Japanese naval unit in the hex temporarily neutralizes it.', cite: ['7.36'] },
    ],
  },
  {
    key: 'zoi',
    title: 'Air zones of influence',
    statements: [
      { text: 'All in-supply air and carrier units project a 2-hex ZOI. It is neutralized only by an opposing in-supply non-LRB air or carrier unit projecting its ZOI into the same hex. An out-of-supply unit has no ZOI. Air ZOI are in effect at all times.', cite: ['7.35'] },
      { text: 'An un-neutralized ZOI: stops any unit entering or leaving it on strategic movement; stops ground units entering or leaving it by amphibious assault; blocks an HQ activation path entering or leaving it across an all-water hexside; blocks a supply path the same way.', cite: ['7.35'], links: ['supply'] },
      { text: 'It does not affect: ground movement between contiguous land hexes across a land hexside; naval or air movement (other than strategic movement); activation or supply paths crossing a land hexside; or HQ range used to maintain reduced units in the Attrition phase.', cite: ['7.35'] },
    ],
  },
  {
    key: 'ground',
    title: 'Ground units',
    statements: [
      { text: 'Ground units have three ways to move: by land, by strategic transport, and by amphibious assault.', cite: ['7.4'] },
      { text: 'Land movement costs 1 point for open terrain, 3 for a mountain hex and 2 for all other terrain, and half a point entering an enemy-free hex along a transport route. A unit cannot enter a hex without enough points, so a low OC may prevent ground movement.', cite: ['7.41', '7.4'] },
      { text: 'A ground unit must stop on entering a hex with opposing land or air units or an opposing HQ. Naval units do not stop it. Normal ground movement never crosses an all-ocean hexside (except Japanese barges).', cite: ['7.41'] },
      { text: 'In reaction a ground unit may use transport routes but cannot enter a battle hex at the transport rate if an enemy ground unit is there.', cite: ['7.41'] },
      { text: 'Movement restrictions: Japanese ground units cannot enter non-coastal Chinese hexes, and Japanese air cannot attack Chinese units in China; Japanese ground units may enter Northern India but go no further; no unit may enter Soviet territory; only Chinese ground units may enter non-coastal China; Chinese units may only operate in Burma, Northern India, Kunming and its adjacent hexes (otherwise eliminated).', cite: ['7.42'], links: ['national-china'] },
      { text: 'Ground disengagement: a ground unit may leave a hex in which an opposing Offensives ground unit just arrived if it has a land hex to go to other than the one the enemy came from, and its attack strength (or combined strength) is greater than, not equal to, the enemy’s. It may keep moving if it has points left.', cite: ['7.43'] },
    ],
  },
  {
    key: 'strategic',
    title: 'Strategic ground transport',
    statements: [
      { text: 'An amphibious-capable ground unit moves from a coastal hex to a friendly port, up to the distance a friendly naval unit may move in this offensive. If it starts in a friendly port the distance doubles.', cite: ['7.44'] },
      { text: 'The path never enters an un-neutralized opposing air ZOI or a battle hex. The unit must finish in a friendly port. It cannot combine strategic transport with other movement in the same offensive, and uses no ASPs.', cite: ['7.44'] },
      { text: 'A port captured during the offensive counts as a friendly port.', cite: ['7.44'] },
    ],
  },
  {
    key: 'amphibious',
    title: 'Amphibious assault',
    statements: [
      { text: 'Capable: all Japanese, US, Commonwealth British (except the Armor Brigade), Australian and New Zealand ground units. Dutch, Indian and Chinese units are not.', cite: ['7.45', '5.11'] },
      { text: 'A unit moves from any coastal hex to any coastal hex, up to a naval unit’s distance for the offensive. It never doubles. It may enter any non-mountain coastal hex (except Port Moresby, 3823, which can be assaulted) whether or not it holds enemy ground units.', cite: ['7.45'] },
      { text: 'Event cards that restrict naval activation do not stop amphibious units, and Inter-Service Rivalry does not stop Army units (Japanese or US) from using amphibious assault.', cite: ['7.45'] },
      { text: 'ASP cost: one ASP per ground unit of division size (XX) or smaller; for a Corps or Army (XXX or XXXX) one ASP per step (reduced 1, full 2). The Japanese Korean Army costs two ASP per step (full strength 4). Each ASP is used once per turn; mark it on the Strategic Record.', cite: ['7.45'] },
      { text: 'In Reaction no more than one ASP may be used. Japanese organic transport costs no ASP.', cite: ['7.45', '7.46'] },
      { text: 'Restrictions: the path may not enter or leave a hex with an opposing naval unit (active or inactive) unless the assault moves with a friendly naval unit all the way. It may never enter or leave an un-neutralized opposing air ZOI, even with a non-carrier ship. If it finds itself in one it stops and returns to its hex of origin.', cite: ['7.45'] },
      { text: 'Without an escort, if opposing naval forces of any type end reaction movement in the battle hex, the assault is cancelled and the battle is lost: each ground unit takes a one-step loss, then does post battle movement.', cite: ['7.45'] },
      { text: 'If after battle the assaulting unit is not in a friendly-controlled hex, it does post battle movement like a naval unit and must end in a friendly port or coastal hex, or it is eliminated.', cite: ['7.45'] },
      { text: 'US Army (blue) ground units may assault a Japanese-controlled and occupied one-hex island only if they end in a hex with a US Marine unit that also just completed an amphibious assault into it. No such limit applies on multi-hex islands or in Reaction.', cite: ['7.45'] },
      { text: 'Japanese organic transport: five brigades (1st to 4th SN and the SS) can assault either with one ASP, or by starting stacked with a CA, CL or APD and moving with it all the way at no ASP. One ship moves one brigade; if the ship is eliminated the brigade is too.', cite: ['7.46'] },
      { text: 'Japanese barges: after the Barge event, in an offensive with a 3 OC card (even played as an event), Japan can move 1 ground unit of any size across one all-sea hexside as an amphibious assault for 0 ASP. Offensive only, not Reaction. The Allied PT Boat card removes it.', cite: ['7.47'] },
    ],
  },
  {
    key: 'stacking',
    title: 'Stacking',
    statements: [
      { text: 'Stacking is checked after every Strategy card play, whether an offensive or an event.', cite: ['7.34', '7.48'] },
      { text: 'No more than three friendly air and/or ground units of any size per hex. Excess units are removed, air first. If in supply they go on the game turn record track to return the turn after next as reinforcements that cannot be delayed; if out of supply they are eliminated.', cite: ['7.34', '7.48'] },
      { text: 'Naval units: any number during an offensive or battle, but at most 6 of one player’s ships in a hex otherwise. Excess ships are removed: in supply, they return next turn as reinforcements that cannot be delayed; out of supply, they are eliminated.', cite: ['7.24'] },
      { text: 'Two air units with the same designation (some US air units and the Commonwealth SEAC air unit have an LRB twin) count as one for stacking, but not for activation.', cite: ['7.34'] },
      { text: 'HQs do not count toward stacking, but there may never be more than one HQ, of either side, in a hex.', cite: ['7.51'] },
    ],
  },
  {
    key: 'armor',
    title: 'British Armor Brigade',
    statements: [
      { text: 'The 7th Armor Brigade moves normally in open terrain or along transportation routes. Entering a non-open hex without a transportation route, it must stop at once, so it can enter one such hex per offensive.', cite: ['7.49'] },
      { text: 'It may not use amphibious assault but may use strategic ground transport.', cite: ['7.49'] },
    ],
  },
];
