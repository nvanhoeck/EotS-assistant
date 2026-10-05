import type { Section } from '../types';

export const INITIATIVE_SECTIONS: Section[] = [
  {
    key: 'initiative',
    title: 'Who goes first',
    statements: [
      { text: 'The player with the most Strategy cards in hand goes first in the Offensives phase, and may play any card.', cite: ['4.21'] },
      { text: 'Exception: the player with fewer cards may go first by playing their Future Offensives card as an EC Offensive (only). If they do not, the player with the most cards must go first.', cite: ['4.21', '7.29'] },
      { text: 'Ties: the Japanese player must go first in all game turns of 1941 and 1942 (turns 1–4). The Allied player must go first in all other game turns (1943 to 1945, turns 5–12). On a tie the opponent may NOT use a Future Offensives card to go first.', cite: ['4.21', '2.1'] },
      { text: 'A Future Offensives card does not count for hand size or for initiative.', cite: ['7.29'] },
    ],
  },
  {
    key: 'future',
    title: 'Future Offensives cards',
    statements: [
      { text: 'Once per game turn each player may designate one Strategy card to be held over for a future turn, to conduct an offensive, an event or a reaction. Never more than one at a time.', cite: ['7.29'] },
      { text: 'To designate one, use it as your play of a card: put the card face down next to the map with the Future Offensives marker on top. That is your action and play passes to the other player.', cite: ['7.29'] },
      { text: 'To win the initiative with it, you must have fewer cards than your opponent at the start of the Offensives phase and play it as an EC Offensive as your first card. It cannot be used as an OC for this.', cite: ['4.21', '7.29'] },
      { text: 'It cannot be played in the same turn it was designated, nor as the last card you play in an Offensives phase. It also cannot be discarded to fulfil an event discard requirement.', cite: ['7.29'] },
      { text: 'Otherwise it can be played any time you could normally play a Strategy card.', cite: ['7.29'] },
      { text: 'You may keep the same Future Offensives card for several turns. The only drawback is that you cannot designate another while it is still held.', cite: ['7.29'] },
      { text: 'Any card can be a Future Offensives card except the Special Event cards Tojo Resigns and Soviets Invade Manchuria.', cite: ['7.29', '5.37'] },
    ],
  },
];
