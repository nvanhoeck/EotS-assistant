import type { Section } from '../types';

export const END_OF_TURN_SECTIONS: Section[] = [
  {
    key: 'checks',
    title: 'The end-of-turn checks',
    statements: [
      { text: 'If the US Political Will marker is in the Zero (Negotiations) box, the Japanese player wins the game.', cite: ['4.5', '16.1'], links: ['us-political-will'] },
      { text: 'If the conditions for an automatic Allied victory have occurred, the Allied player wins. Japan surrendering (conquest of Honshu or blockade of the Home Islands) is an automatic Allied victory and ends the game immediately.', cite: ['4.5', '16.1', '13.93'] },
      { text: 'If it is the last turn of the game, work out the winner from the victory conditions of the campaign or scenario you are playing.', cite: ['4.5'] },
      { text: 'If none of these apply, advance the game turn marker and play a new game turn.', cite: ['4.5'] },
    ],
  },
  {
    key: 'victory',
    title: 'Victory conditions',
    statements: [
      { text: 'Automatic victory: if Japan surrenders (13.93) the Allies win at once. If in any End of Turn phase the US Political Will marker is in the Negotiations (Zero) box, Japan wins at once.', cite: ['16.1'] },
      { text: 'Otherwise, in the full Campaign the winner is decided at the end of game turn 12.', cite: ['16.1'] },
      { text: 'Allied victory: in the turn 12 End of Turn phase, Japan has been successfully strategically bombed on four consecutive turns, has 1 or zero resource hexes, and a B-29 is in range of Tokyo; or Japan has surrendered.', cite: ['16.2'], links: ['strategic-warfare'] },
      { text: 'Japanese victory: if the Allies have not won by the end of game turn 12.', cite: ['16.3'] },
      { text: 'Yearly scenarios end earlier (the 1942 scenario at the end of turn 4, 1943 at turn 7, 1944 at turn 10) and are scored in victory points for Japan: Allied Decisive 2 or less, Allied Tactical 3 to 5, Japanese Tactical 6 to 9, Japanese Decisive 10 or more. The point list is in each scenario’s rules. In the 1942 scenario the Allies win automatically if Japan controls fewer than 12 of the 14 resource hexes at the end of turn 4.', cite: ['17.27', '17.38', '17.48'] },
    ],
  },
  {
    key: 'markers',
    title: 'Markers and housekeeping',
    statements: [
      { text: 'Flip or remove markers as the rules indicate, for example a China Offensive marker goes to its other side and the Tokyo Express marker is removed.', cite: ['4.5', '6.23'] },
      { text: 'At the start of a new turn, reset the Amphibious Shipping Point used markers to the full level.', cite: ['10.3'] },
      { text: 'HQs on the game turn record track return in the next Reinforcement segment as normal reinforcements, and cannot be delayed.', cite: ['6.13', '6.14'], links: ['reinforcements'] },
      { text: 'Unused passes are lost at the end of the Offensives phase, so there is nothing to carry over.', cite: ['12.4'] },
    ],
  },
];
