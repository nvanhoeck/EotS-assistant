import type { Section } from '../types';

export const REPLACEMENT_SECTIONS: Section[] = [
  {
    key: 'general',
    title: 'General rules',
    statements: [
      { text: 'Both players may receive replacements in the Replacement segment. One replacement point flips one eligible reduced unit to its full-strength side, or brings one eligible eliminated unit back at reduced strength. An eliminated unit can come back at full strength for two replacement points.', cite: ['4.12', '11.0'] },
      { text: 'A reduced unit on the map can receive a replacement only if it is in supply and not in an un-neutralized enemy ZOI.', cite: ['11.0', '6.21'], links: ['supply'] },
      { text: 'A unit returning from the eliminated pile is placed exactly like a reinforcement, under the reinforcement rules. An HQ that arrived in the Reinforcement segment can place returning units only in its own hex.', cite: ['11.0', '10.1'], links: ['reinforcements'] },
      { text: 'Air and carrier units that arrive during the Replacement segment cannot neutralize enemy ZOIs to allow other placements in the same segment. Air and carrier units that arrived during the Reinforcement segment do neutralize them, possibly allowing placement in more hexes.', cite: ['11.0'] },
      { text: 'The Allied player places all replacements first, then the Japanese player.', cite: ['11.0'] },
      { text: 'Unless a rule or an Event card says otherwise, Allied replacements that are not used in the turn they arrive are lost. Japanese air and naval replacements can be saved for future use.', cite: ['11.0', '11.21'] },
    ],
  },
  {
    key: 'dots',
    title: 'Units that cannot be replaced',
    statements: [
      { text: 'Pre-War units, Allied and Japanese, cannot accept replacements (unless an event explicitly allows it). They are marked with a single dot on the front and back of the counter.', cite: ['11.1'] },
      { text: 'When such a unit is eliminated it is permanently removed from the game. If a Pre-War unit, including an HQ, leaves the map for any reason it counts as eliminated and cannot return.', cite: ['11.1'] },
    ],
  },
  {
    key: 'japan-naval',
    title: 'Japanese naval units',
    statements: [
      { text: 'Japan receives a limited number of naval replacements during the game, as the Replacements Chart says.', cite: ['11.21'] },
      { text: 'Each step flips a reduced naval unit to full strength, or brings an eligible naval unit back from the eliminated pile.', cite: ['11.21'] },
      { text: 'Unused steps are not lost: they carry over from turn to turn. Track them with the naval replacement marker on the Strategic track.', cite: ['11.21'] },
    ],
  },
  {
    key: 'japan-air',
    title: 'Japanese air units',
    statements: [
      { text: 'There are no scheduled replacements for Japanese air units.', cite: ['11.22'] },
      { text: 'Japan gets a small number of air replacements only through certain Event cards. Japanese air replacements can be saved for future use.', cite: ['11.22', '11.0'] },
    ],
  },
  {
    key: 'japan-ground',
    title: 'Japanese ground units',
    statements: [
      { text: 'There are no scheduled replacements for Japanese ground units.', cite: ['11.23'] },
      { text: 'In the Replacement segment Japan may bring up to two replacement steps from China, by lowering the China Divisions track by one or two. These points must be used immediately.', cite: ['11.23'] },
      { text: 'Per division taken: one reduced unit in supply goes back to full strength, or one eliminated unit returns at reduced strength. Two divisions bring one eliminated unit back at full strength.', cite: ['11.23', '11.0'] },
      { text: 'With no Japanese divisions left in China, Japan gets no ground replacements. Some Event cards give ground replacements, which Japan must use as the card says.', cite: ['11.23'] },
    ],
  },
  {
    key: 'allied-ground',
    title: 'Allied ground units',
    statements: [
      { text: 'The Allies receive 2 ground replacements per game turn, starting with turn 2, as the Replacements Chart says. Replacements that cannot be used are lost (they go to Europe).', cite: ['11.31'] },
      { text: 'They may be used for reduced or eliminated US and Commonwealth ground units.', cite: ['11.31'] },
      { text: 'A reduced unit goes back to full strength for 1 replacement. An eliminated unit returns at reduced strength for 1 replacement, or at full strength for 2.', cite: ['11.31', '11.0'] },
    ],
  },
  {
    key: 'allied-air',
    title: 'Allied air units',
    statements: [
      { text: 'The Allies receive 5 air replacements per game turn.', cite: ['11.32'] },
      { text: 'They can be used for any reduced or eliminated Allied air unit that can take replacements.', cite: ['11.32'] },
      { text: 'An eliminated unit returns at reduced strength for 1 replacement, or at full strength for 2. A reduced unit is flipped to full strength for 1.', cite: ['11.32', '11.0'] },
      { text: 'Replacements not used during the turn are lost (they go to Europe).', cite: ['11.32'] },
    ],
  },
  {
    key: 'allied-naval',
    title: 'Allied naval units',
    statements: [
      { text: 'The Allies receive specific naval replacements, as the Replacements Chart says. Those that cannot be used are lost.', cite: ['11.33'] },
      { text: 'US: 1 or 2 US naval replacements per turn, except on turn 1, while the Allies control Oahu (5808). Each may be used for a reduced or eliminated eligible US naval unit.', cite: ['11.33'] },
      { text: 'Commonwealth: 1 naval replacement on game turns 6, 9 and 12, if the Allies control any one of Colombo (1307), Trincomalee (1308), Singapore (2015), Hong Kong (2709) or Townsville (3727).', cite: ['11.33'] },
      { text: 'A reduced unit is flipped to full strength for 1 replacement. An eliminated unit returns at reduced strength for 1, or at full strength for 2.', cite: ['11.33', '11.0'] },
    ],
  },
  {
    key: 'chinese',
    title: 'Chinese units',
    statements: [
      { text: 'If China has not surrendered, the Allies receive 1 Chinese replacement on each odd-numbered game turn.', cite: ['11.34'] },
      { text: 'It brings an eliminated Chinese army back at reduced strength into Kunming (2407), or flips a reduced Chinese army to full strength.', cite: ['11.34'] },
      { text: 'Kunming cannot be attacked, so it is always available. A Chinese replacement can be placed there only if Kunming is a supply source.', cite: ['11.34', '13.75'] },
      { text: 'An unused Chinese replacement is lost. Other replacements may not be used for Chinese units.', cite: ['11.34'] },
    ],
  },
  {
    key: 'dutch',
    title: 'Dutch units',
    statements: [
      { text: 'There are no replacements for Dutch units. Once eliminated they are permanently removed from the game.', cite: ['11.35'] },
    ],
  },
];
