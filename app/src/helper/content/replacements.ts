import type { Section } from '../types';

export const REPLACEMENT_SECTIONS: Section[] = [
  {
    key: 'general',
    title: 'General rules',
    statements: [
      { text: 'Both players may receive replacements in the Replacement segment. A replacement flips a reduced unit that is in supply to its full-strength side, or brings a unit back from the eliminated pile.', cite: ['4.12', '10.0'] },
      { text: 'A reduced unit on the map can receive a replacement only if it is in supply and not in an un-neutralized enemy ZOI.', cite: ['10.0', '13.1'], links: ['supply'] },
      { text: 'A unit returning from the eliminated pile is treated exactly like a reinforcement: it is placed under the reinforcement rules.', cite: ['10.0', '9.1'], links: ['reinforcements'] },
      { text: 'The Allied player places all replacements first, then the Japanese player.', cite: ['10.0'] },
      { text: 'Replacements that are not used in the turn they arrive are lost, unless a rule or an Event card says otherwise. Japanese naval replacement steps are the main exception.', cite: ['10.0', '10.21'] },
    ],
  },
  {
    key: 'dots',
    title: 'Units that cannot be replaced',
    statements: [
      { text: 'Some Pre-War units, Allied and Japanese, cannot accept replacements. They are marked with a single dot on the front of the counter.', cite: ['10.1'] },
      { text: 'When such a unit is eliminated it is permanently removed from the game.', cite: ['10.1'] },
    ],
  },
  {
    key: 'japan-naval',
    title: 'Japanese naval units',
    statements: [
      { text: 'Japan receives a limited number of naval replacements during the game, as the Replacements Chart says.', cite: ['10.21'] },
      { text: 'Each step flips a reduced naval unit to full strength, or brings an eligible naval unit back from the eliminated pile as a reinforcement at reduced or full strength.', cite: ['10.21'] },
      { text: 'Unused steps are not lost: they carry over from turn to turn. Track them with the naval replacement marker on the Strategic track.', cite: ['10.21'] },
    ],
  },
  {
    key: 'japan-air',
    title: 'Japanese air units',
    statements: [
      { text: 'There are no scheduled replacements for Japanese air units.', cite: ['10.22'] },
      { text: 'Japan gets a small number of air replacements only through certain Event cards.', cite: ['10.22'] },
    ],
  },
  {
    key: 'japan-ground',
    title: 'Japanese ground units',
    statements: [
      { text: 'There are no scheduled replacements for Japanese ground units.', cite: ['10.23'] },
      { text: 'In the Replacement segment Japan may bring up to two replacement steps from China, by lowering the China Divisions track by one or two.', cite: ['10.23'] },
      { text: 'Per division taken: one reduced unit in supply goes back to full strength, or one eliminated unit returns at reduced strength. Two divisions bring one eliminated unit back at full strength.', cite: ['10.23'] },
      { text: 'With no Japanese divisions left in China, Japan gets no ground replacements. Some Event cards give ground replacements, which Japan must use as the card says.', cite: ['10.23'] },
    ],
  },
  {
    key: 'allied-ground',
    title: 'Allied ground units',
    statements: [
      { text: 'The Allies receive 2 ground replacements per game turn, starting with turn 2, as the Replacements Chart says. Replacements that cannot be used are lost (they go to Europe).', cite: ['10.31'] },
      { text: 'A reduced unit goes back to full strength for 1 replacement.', cite: ['10.31'] },
      { text: 'The rule names the US Marine Division and any US or Commonwealth Corps-size unit as units that can come back from the eliminated pile at reduced strength for 1 replacement. Using 2 replacements brings a unit back at full strength in a single turn.', cite: ['10.31'] },
    ],
  },
  {
    key: 'allied-air',
    title: 'Allied air units',
    statements: [
      { text: 'The Allies receive 5 air replacements per game turn.', cite: ['10.32'] },
      { text: 'Each one brings an eligible air unit back from the eliminated pile at reduced strength, or flips a reduced unit to full strength.', cite: ['10.32'] },
      { text: 'Two replacements bring an eliminated unit back at full strength.', cite: ['10.32'] },
      { text: 'Replacements not used during the turn are lost (they go to Europe).', cite: ['10.32'] },
    ],
  },
  {
    key: 'allied-naval',
    title: 'Allied naval units',
    statements: [
      { text: 'The Allies receive specific naval replacements, as the Replacements Chart says. Those that cannot be used are lost.', cite: ['10.33'] },
      { text: 'US: 1 or 2 US naval replacements per turn, except on turn 1, while the Allies control Oahu (5808).', cite: ['10.33'] },
      { text: 'Commonwealth: 1 naval replacement on game turns 6, 9 and 12, if the Allies control any one of Colombo (1307), Trincomalee (1308), Singapore (2015), Hong Kong (2709) or Townsville (3727).', cite: ['10.33'] },
      { text: 'Each replacement brings an eligible naval unit back from the eliminated pile at reduced strength, or flips a reduced unit to full strength. Two bring an eliminated unit back at full strength.', cite: ['10.33'] },
    ],
  },
  {
    key: 'chinese',
    title: 'Chinese units',
    statements: [
      { text: 'If China has not surrendered, the Allies receive 1 Chinese replacement on each odd-numbered game turn.', cite: ['10.34'] },
      { text: 'It brings an eliminated Chinese army back at reduced strength into Kunming (2407), or flips a reduced Chinese army to full strength.', cite: ['10.34'] },
      { text: 'Kunming cannot be attacked, so it is always available. A Chinese replacement can be placed there only if Kunming is a supply source.', cite: ['10.34', '12.75'] },
      { text: 'An unused Chinese replacement is lost. Other replacements may not be used for Chinese units.', cite: ['10.34'] },
    ],
  },
  {
    key: 'dutch',
    title: 'Dutch units',
    statements: [
      { text: 'There are no replacements for Dutch units. Once eliminated they are permanently removed from the game.', cite: ['10.35'] },
    ],
  },
];
