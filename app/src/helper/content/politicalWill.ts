import type { Section } from '../types';

export const POLITICAL_WILL_SECTIONS: Section[] = [
  {
    key: 'surrenders',
    title: 'Allied surrenders',
    statements: [
      { text: 'When an Allied nation surrenders, US Political Will drops by the value below. Surrenders are resolved in the National Status segment.', cite: ['16.41', '4.31'] },
      { text: 'Nations marked * give the value back if the Allies later recapture them from Japan.', cite: ['16.41'] },
      { text: 'When every nation on the list has surrendered, US Political Will drops a further 2.', cite: ['16.41'] },
      { text: 'Locations that are not on the list have no effect on US Political Will when they surrender or change control.', cite: ['16.41'] },
    ],
  },
  {
    key: 'occupation',
    title: 'Occupation of Alaska or Hawaii',
    statements: [
      { text: 'Alaska counts as occupied when a Japanese unit continuously holds any hex of the Aleutian Islands (4600–5100) at the end of three consecutive US Political Will segments: −1. Once per game.', cite: ['16.42'] },
      { text: 'Hawaii counts as occupied when a Japanese unit continuously holds a major Hawaiian island (5708, 5808, 5908) or Midway (5108) at the end of two consecutive US Political Will segments: −1. Once per game.', cite: ['16.42'] },
    ],
  },
  {
    key: 'strategic-warfare',
    title: 'Strategic Warfare',
    statements: [
      { text: 'Japan controls 3 or fewer resource hexes during any game turn from 5 to 12: +3. This can happen only once per game.', cite: ['16.43', '11.11'], links: ['strategic-warfare'] },
      { text: 'US Strategic Bombing cuts the Japanese draw by one or more cards: move the marker one box right, even if the draw was already at its minimum. At most once per turn.', cite: ['16.43', '11.32'], links: ['strategic-warfare'] },
    ],
  },
  {
    key: 'events',
    title: 'Events',
    statements: [
      { text: 'Operation Z (the Pearl Harbor attack card) raises US Political Will by 8.', cite: ['16.44'] },
      { text: 'Other Event cards raise or lower it as their text says.', cite: ['16.44'] },
    ],
  },
  {
    key: 'casualties',
    title: 'US casualties',
    statements: [
      { text: 'When the Allies are the Offensives player and the entire attacking force in a ground battle is eliminated, and at least one of those units was a US division or corps (XX or XXX) that can receive replacements: −1 (marker one box left).', cite: ['16.45'] },
      { text: 'Losses of non-US units do not count, nor do US ground units that cannot receive replacements. At most one point per game turn.', cite: ['16.45'] },
    ],
  },
  {
    key: 'naval',
    title: 'Strategic naval situation',
    statements: [
      { text: 'At the end of any game turn with no US carrier on the map: −1.', cite: ['16.46'] },
      { text: 'A further −1 if there are also no US naval units of any type on the map.', cite: ['16.46'] },
    ],
  },
  {
    key: 'progress',
    title: 'Progress of the War',
    statements: [
      { text: 'From turn 4 to the end of the game, by the end of the US Political Will segment the Allies must have captured and kept enough Japanese-controlled hexes, or lose 1 point.', cite: ['16.47'] },
      { text: 'The target is the smaller of 4 and the number of Allied ASPs available at the end of the Reinforcement segment.', cite: ['16.47', '9.3'] },
      { text: 'Only hexes that began the turn Japanese-controlled and contain a named location, resource, port or airfield count. One-hex islands without a resource, port or airfield do not.', cite: ['16.47'] },
      { text: 'Count hexes captured minus hexes the Japanese retake. Hexes that change hands through a National Surrender count for the Allies.', cite: ['16.47'] },
      { text: 'Capturing hexes that were already Allied-controlled has no effect, except recapturing hexes that began the turn Japanese-controlled.', cite: ['16.47'] },
      { text: 'Rulebook example: turn 4 with 3 ASPs means a target of 3. The Allies capture 5 hexes and the Japanese retake 3, leaving 2, which is short, so −1. (The example’s last line says “required 4”, which disagrees with its first lines; the rule itself says the smaller number.)', cite: ['16.47'] },
    ],
  },
  {
    key: 'europe',
    title: 'War in Europe level 4',
    statements: [
      { text: 'While War in Europe is at level 4, move the US Political Will marker one box to the left during the National Status segment.', cite: ['16.48', '15.5'], links: ['war-in-europe'] },
    ],
  },
];
