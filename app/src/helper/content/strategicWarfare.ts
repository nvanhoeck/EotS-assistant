import type { Section } from '../types';

export const STRATEGIC_WARFARE_SECTIONS: Section[] = [
  {
    key: 'japan-cards',
    title: 'Japanese Strategy cards',
    statements: [
      { text: 'At the start of the Strategic Warfare segment Japan draws one Strategy card per 2 resource hexes it controls, rounded up. This is the base draw.', cite: ['11.11'] },
      { text: 'The 14 resource hexes: Sumatra 1813, 1916, 2017; Burma 2008; Malaya 2014; Java 2220; Borneo 2415, 2517, 2616; Philippines 2813; New Guinea 3219; Manchuria 3302, 3303; Korea 3305.', cite: ['11.11'] },
      { text: 'Japan controls a resource hex if it has a Japanese control marker on it.', cite: ['11.11', '12.1'] },
      { text: 'Turns 2–4: Japan draws 7 cards whatever it controls (strategic reserves). Submarine warfare can still reduce this.', cite: ['11.12'] },
      { text: 'Japan never receives fewer than 4 cards.', cite: ['11.12', '11.4'] },
      { text: 'Passes: with 6 cards Japan gets 1 pass, with 5 or fewer 2 passes. A pass replaces playing a card in the Offensives phase; unused passes are lost at the end of it.', cite: ['11.4'] },
      { text: 'Turn 1 of the full Campaign is special: the Allies get no cards and Japan gets only Japanese cards #1 and #2.', cite: ['4.14'] },
      { text: 'Low resource-hex control between turns 5 and 12 also raises US Political Will; see the US Political Will page.', cite: ['16.43'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'submarine',
    title: 'Submarine warfare',
    statements: [
      { text: 'Before the Japanese draw, the Allied player rolls a die and subtracts the game turn number, then applies the modifiers.', cite: ['11.21'] },
      { text: 'A modified result of 0 or less: Japan draws one card fewer, permanently loses one ASP, and its Escort modifier drops from +4 to +2 or from +2 to 0.', cite: ['11.21'] },
      { text: 'Japan cannot lose its last ASP, and the Escort modifier cannot go below 0.', cite: ['11.21', '9.32'] },
      { text: 'Modifiers: each Japanese escort event adds 2 to the roll. Every 1942 game turn adds 1 (defective torpedoes).', cite: ['11.22'] },
    ],
  },
  {
    key: 'bombing',
    title: 'Strategic bombing',
    statements: [
      { text: 'Only US B-29 LRB units can bomb: the 20th BC arrives on turn 9 and the 21st BC on turn 10.', cite: ['11.31'] },
      { text: 'A B-29 must be on a supply-eligible airfield within 8 hexes of Tokyo, or be in supply in the Air units in China box.', cite: ['11.31'] },
      { text: 'B-29 reinforcements cannot be delayed and can bomb on their turn of entry. A B-29 brought back by replacements cannot bomb that turn.', cite: ['11.31'] },
      { text: 'A B-29 that bombs cannot fight in Offensive battles, but may try to activate in reaction if enemy units enter its hex.', cite: ['11.31'] },
      { text: 'Roll a die per B-29. Full strength succeeds on 0–8 and fails on 9. Reduced strength succeeds on 0–4 and fails on 5–9.', cite: ['11.32'] },
      { text: 'Each success cuts the Japanese draw for this turn by one card. A failure has no effect. Bombing can cost Japan at most two cards.', cite: ['11.32', '11.33'] },
      { text: 'A roll of 9 costs the B-29 one step, unless the Allies control an airfield within 3 hexes of Tokyo (it can be the B-29’s own hex, for example Iwo Jima 3709).', cite: ['11.32'] },
      { text: 'The Japanese High Altitude Interceptors event stops the card loss for US Political Will purposes (16.43) but does not change whether the attack succeeded for the Allied victory check (16.2).', cite: ['11.32', '16.2'] },
      { text: 'Allied B-29 event cards can cut the Japanese hand further during the Offensives phase, in addition to bombing.', cite: ['11.33'] },
      { text: 'A bombing run that cuts at least one card moves US Political Will one box to the right (once per turn).', cite: ['16.43'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'allied-cards',
    title: 'Allied Strategy cards',
    statements: [
      { text: 'Turn 1: no cards. Turn 2: 5 cards and 2 passes. Turn 3: 6 cards and 1 pass. From turn 4: 7 cards per turn.', cite: ['11.51'] },
      { text: 'The Allied minimum is 4 cards per turn. Passes work like Japanese passes and cannot be accumulated.', cite: ['11.51'] },
      { text: 'The Allies lose one card for each of these: China has surrendered, India has surrendered, Australia has surrendered, War in Europe is at level 4 at the start of the turn. They gain one pass per card lost, up to two.', cite: ['11.52'] },
    ],
  },
];
