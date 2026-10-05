import type { Section } from '../types';

export const INITIATIVE_SECTIONS: Section[] = [
  {
    key: 'initiative',
    title: 'Who goes first',
    statements: [
      { text: 'The player with the most Strategy cards in hand goes first in the Offensives phase.', cite: ['4.21'] },
      { text: 'Exception: the player with fewer cards goes first if their first card played is a Future Offensives card played as an EC. In all other cases the player with the most cards must go first.', cite: ['4.21', '6.29'] },
      { text: 'Ties: the Japanese player goes first in all game turns of 1941 and 1942 (turns 1–4). The Allied player goes first in all game turns of 1943 to 1945 (turns 5–12).', cite: ['4.21', '2.1'] },
      { text: 'A Future Offensives card does not count for hand size or for initiative.', cite: ['6.29'] },
    ],
  },
  {
    key: 'future',
    title: 'Future Offensives cards',
    statements: [
      { text: 'Once per game turn each player may designate one Strategy card to be held over for a future turn, to conduct an offensive, an event or a reaction. Never more than one at a time.', cite: ['6.29'] },
      { text: 'To designate one, use it as your play of a card: put the card face down next to the map with the Future Offensives marker on top. That is your action and play passes to the other player.', cite: ['6.29'] },
      { text: 'To win the initiative with it, play it as an EC as your first card. It cannot be used as an OC for this.', cite: ['4.21', '6.29'] },
      { text: 'It cannot be played in the same turn it was designated, nor as the last card you play in an Offensives phase (as an offensive or a reaction).', cite: ['6.29'] },
      { text: 'Otherwise it can be played whenever you could normally play a card in the Offensives phase: as an OC, an EC, a Reaction card or an event. You may also discard it instead of playing a card from your hand.', cite: ['6.29'] },
      { text: 'You may keep the same Future Offensives card for several turns. The only drawback is that you cannot designate another while it is still held.', cite: ['6.29'] },
      { text: 'Any card can be a Future Offensives card except the Special Event cards Tojo Resigns and Soviets Invade Manchuria.', cite: ['6.29', '5.37'] },
    ],
  },
];
