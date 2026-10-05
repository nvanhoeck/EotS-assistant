import type { Section } from '../types';

export const CHINA_SECTIONS: Section[] = [
  {
    key: 'surrender',
    title: 'When China surrenders',
    statements: [
      { text: 'China surrenders the instant the China marker is in the China Collapses box during the Offensive segment. It does not wait for the National Status segment.', cite: ['12.73'] },
      { text: 'China can collapse only through a Chinese offensive started by an OC. If an Event card would move the marker into Government Collapsed, the marker simply does not move.', cite: ['12.73'] },
      { text: 'All Allied air units in China go on the game turn track and return as reinforcements next turn (they may be delayed). All Chinese units are permanently removed from the game.', cite: ['12.73'] },
      { text: 'Consequences elsewhere: US Political Will −2, the Allies draw one card fewer (and gain a pass), and there are no more Chinese replacements.', cite: ['16.41', '11.52', '10.34'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'offensives',
    title: 'China Offensives',
    statements: [
      { text: 'Japan can launch OC and EC Chinese offensives. EC ones come from particular Event cards, with no limit per turn.', cite: ['12.72'] },
      { text: 'An OC Chinese offensive is a China OC Card Offensive made by playing any 3 OC. Only once per turn, and only on even-numbered game turns (at most 6 per game).', cite: ['12.72'] },
      { text: 'A successful Japanese offensive moves the China marker one or more boxes toward Government Collapse. An unsuccessful one, or an Allied China Offensive event, moves it toward Stable Front.', cite: ['12.72'] },
      { text: 'Procedure: Japan takes the Offensive Baseline value = Japanese Divisions in China minus the Allied Burma Road support on the Burma Road Status track. Japan rolls: equal to or lower than the baseline moves the marker one box toward Collapse.', cite: ['12.72'] },
      { text: 'Any other result leaves the marker alone, unless the offensive failed and the Allies had at least one air unit in China: then it moves one box toward Stable. The marker never moves beyond the Stable or Collapse boxes.', cite: ['12.72'] },
      { text: 'Allied air support adds to the die roll: +1 for each non-LRB air unit in China, and +1 if the 14th Air Force LRB is there. Air units are placed in the China box in a Reinforcement segment or fly there from Northern India.', cite: ['12.72'] },
      { text: 'The only other ways the Allies move the marker toward Stable are a China Offensive Event card, or the first option on the Soviet Invasion of Manchuria event.', cite: ['12.72'] },
    ],
  },
  {
    key: 'movement',
    title: 'Moving and fighting in China',
    statements: [
      { text: 'Non-Chinese Allied or Japanese units may enter or attack only Chinese coastal hexes. Hong Kong (2509) and Formosa are not part of China.', cite: ['12.71'] },
      { text: 'Chinese units may only enter Northern India, Burma, Kunming (2407) and the hexes next to Kunming. A Chinese unit forced into any other nation is eliminated.', cite: ['12.71', '12.75'] },
      { text: 'Chinese Army units can be activated by any Allied HQ in range. Unsupplied Chinese Army units cannot be activated and suffer attrition normally.', cite: ['12.75', '6.21'] },
      { text: 'Kunming and all adjacent hexes are considered Allied controlled and occupied for all game purposes.', cite: ['12.75'] },
    ],
  },
  {
    key: 'air-box',
    title: 'Air units in China',
    statements: [
      { text: 'Up to two Allied air units may be in the Air Units in China box, and only one of them a B-29.', cite: ['12.74'] },
      { text: 'They are in supply there if the Burma Road is open or the Hump is active and there is a supply-eligible Northern India airfield.', cite: ['12.74'], links: ['supply'] },
      { text: 'If China has not surrendered and the Burma Road is open, the Allies may place air units as reinforcements directly in the China box.', cite: ['12.74'] },
      { text: 'Activated air units (including B-29s) can fly between a supply-eligible Northern India airfield and the China box in one leg, whatever their range.', cite: ['12.74', '12.71'] },
      { text: 'A B-29 in China counts as in range of Tokyo only for Strategic Bombing and the Allied victory check.', cite: ['12.74', '16.2'], links: ['strategic-warfare'] },
    ],
  },
  {
    key: 'supply',
    title: 'Kunming, the Burma Road and the Hump',
    statements: [
      { text: 'Kunming is a supply source if the Burma Road is open or the Hump is active (Allied card 17) and there is a supply-eligible Northern India airfield.', cite: ['12.75', '13.31'], links: ['supply'] },
      { text: 'Any Allied unit that can trace an overland supply path directly to Kunming is in supply. This is an exception to needing an HQ.', cite: ['12.75'] },
      { text: 'The Burma Road runs through hexes 2206, 2306 and 2407. It is open if a contiguous strategic transport route can be traced from Kunming to Madras through Allied-controlled hexes. Whenever Japan controls a hex on the route, it is closed.', cite: ['12.76'] },
      { text: 'Playing the China Airlift card makes the Hump active for the rest of the game. A closed Burma Road with the Hump is “Burma Road/HUMP” while the Allies hold a supply-eligible Northern India airfield, and “NO HUMP” while they do not.', cite: ['12.76'] },
      { text: 'In a Japanese China OC Offensive, the Allies subtract the Burma Road support from the Japanese baseline.', cite: ['12.76'] },
    ],
  },
  {
    key: 'japan-strength',
    title: 'Japanese strength in China',
    statements: [
      { text: 'Each city hex in Japanese-occupied China holds one intrinsic one-step Japanese ground unit (9-12) for every 4 boxes still remaining on the Japanese Divisions in China track, rounded up.', cite: ['12.77'] },
      { text: 'These steps are always the last eliminated, do not count for stacking, and are not present in a hex the Allies control, but return if Japan retakes it. Hong Kong gets them once it is Japanese controlled.', cite: ['12.77'] },
      { text: 'Japan can take up to two divisions per Replacement segment from the China Divisions track.', cite: ['10.23'], links: ['replacements'] },
    ],
  },
  {
    key: 'allied-effects',
    title: 'Chinese units and the Allies',
    statements: [
      { text: 'A Chinese unit that has to be placed as if it were a reinforcement can only be placed in Kunming (2407).', cite: ['9.12'], links: ['reinforcements'] },
      { text: 'One Chinese replacement on each odd-numbered turn while China has not surrendered: flip a reduced Chinese army, or bring an eliminated one back at reduced strength in Kunming. Other replacements cannot be used for Chinese units.', cite: ['10.34'], links: ['replacements'] },
      { text: 'If China has surrendered, the Allies draw one card fewer.', cite: ['11.52'] },
      { text: 'Chinese units can be activated by US, Commonwealth and Joint HQs. Chinese units cannot use Amphibious Assault or strategic transport.', cite: ['6.21', '5.11'] },
    ],
  },
];

export const INDIA_SECTIONS: Section[] = [
  {
    key: 'territory',
    title: 'The parts of India',
    statements: [
      { text: 'Northern India is Jorhat (2104), Dimapur (2005), Ledo (2205), Dacca (1905) and Imphal-Kohima (2105).', cite: ['12.61'] },
      { text: 'Mainland India is every Indian coastal hex that is not in Northern India or Ceylon. Ceylon is all hexes on that island.', cite: ['12.61'] },
      { text: 'Japanese units may never enter Mainland India, although Japanese air and naval units may attack Mainland India hexes within range. Allied units may enter any hex in India.', cite: ['12.61'] },
    ],
  },
  {
    key: 'stability',
    title: 'The India track',
    statements: [
      { text: 'If Japan controls all hexes of Northern India, move the India marker to its Unrest box during the National Status segment. Other events may also move it to Unrest.', cite: ['12.62'] },
      { text: 'If India is in Unrest for two consecutive National Status segments, move the marker to the India Unstable box. If it is Unstable for two consecutive segments, India surrenders.', cite: ['12.62'] },
      { text: 'The marker has two sides: flip it to show the second turn in a box.', cite: ['12.62'] },
      { text: 'If at any time the Allies control any part of Northern India (by attacking out of Calcutta, an amphibious invasion or card play), move the marker to India Stable during the next National Status segment, and the cycle starts again.', cite: ['12.62'] },
      { text: 'Once India surrenders it cannot come back into the war.', cite: ['12.62'] },
      { text: 'The Gandhi cards (Japanese 15 and 82) can move the marker from Unrest to Unstable, if it is already in Unrest, but they do not change whether it has been Unstable for two consecutive segments. Example: if the marker was on Unrest, 2nd turn and a Gandhi event moved it to Unstable, the marker is flipped to its front side, since it has not yet spent a National Status segment there.', cite: ['12.62'] },
    ],
  },
  {
    key: 'surrender-effects',
    title: 'If India surrenders',
    statements: [
      { text: 'All Indian Commonwealth units are removed from the game.', cite: ['12.63'] },
      { text: 'All other Commonwealth units in India are placed on Ceylon or the Maldive Islands (1005), or permanently removed if all of Ceylon and the Maldives are Japanese controlled. The hexes must be supply eligible and outside an un-neutralized Japanese air ZOI. Units that would overstack are removed (the Allied player chooses).', cite: ['12.63'], links: ['supply'] },
      { text: 'US Political Will −2.', cite: ['16.41'], links: ['us-political-will'] },
      { text: 'The Allies draw one card fewer, and gain a pass.', cite: ['11.52'] },
    ],
  },
  {
    key: 'units',
    title: 'Indian units',
    statements: [
      { text: 'Indian units cannot use Amphibious Assault or strategic transport.', cite: ['5.11'] },
      { text: 'Commonwealth HQs and Joint HQs can activate Commonwealth units, which include Indian units.', cite: ['6.21'] },
    ],
  },
];

export const US_SECTIONS: Section[] = [
  {
    key: 'isr-general',
    title: 'Inter-Service Rivalry: how it works',
    statements: [
      { text: 'Inter-Service Rivalry is triggered only by the play of the appropriate Event card, and ends only by an Event card (exception: the one-year scenarios’ special rules).', cite: ['14.0'] },
      { text: 'It is shown by flipping the Inter-Service Rivalry marker to its Rivalry side. When an Event card ends it, flip the marker to Strategic Agreement.', cite: ['14.0'] },
      { text: 'Coordination of units and logistics is less effective while it lasts. Both sides can suffer it.', cite: ['14.0'] },
    ],
  },
  {
    key: 'isr-us',
    title: 'US Inter-Service Rivalry',
    statements: [
      { text: 'All US Army/Air Corps reinforcements (not Allied, and not US Marine or Navy) are automatically delayed.', cite: ['14.1'], links: ['reinforcements'] },
      { text: 'Every War-in-Europe diverted-to-Europe die roll has 1 subtracted from it.', cite: ['14.1'], links: ['war-in-europe'] },
      { text: 'A US HQ cannot activate both US Army units and US Naval units in the same offensive, or in reaction to the same offensive. It can activate only one of the two kinds, though other Allied units are not restricted.', cite: ['14.1'] },
      { text: 'US Army ground units may still use Amphibious Assault during Inter-Service Rivalry.', cite: ['14.1'] },
      { text: 'See the rulebook glossary for what counts as an Army unit and a Naval unit.', cite: ['1.3'] },
    ],
  },
  {
    key: 'isr-japan',
    title: 'Japanese Inter-Service Rivalry',
    statements: [
      { text: 'An HQ cannot activate both army and naval units in the same offensive, or in reaction to the same offensive.', cite: ['14.2'] },
      { text: 'Japan can use only half (rounded up) of its Amphibious Shipping Points while the condition lasts.', cite: ['14.2'] },
    ],
  },
  {
    key: 'us-placement',
    title: 'Placing and activating US units',
    statements: [
      { text: 'US ground and naval reinforcements may only be placed in range of US and Joint HQs. US air units may be placed in range of any friendly HQ.', cite: ['9.12'], links: ['reinforcements'] },
      { text: 'US HQs (Central, South [Ghormley or Halsey], Southwest) have no Army or Navy distinction during US Inter-Service Rivalry for placement purposes.', cite: ['9.12'] },
      { text: 'US HQs can activate US units (blue or green) and Chinese units. Joint HQs can activate any Allied unit.', cite: ['6.21'] },
    ],
  },
  {
    key: 'us-replacements',
    title: 'US replacements and Europe',
    statements: [
      { text: 'US Marine divisions and US or Commonwealth corps-size units are named as able to return from the eliminated pile with ground replacements.', cite: ['10.31'], links: ['replacements'] },
      { text: 'US naval replacements (1 or 2 per turn, none on turn 1) need the Allies to control Oahu (5808).', cite: ['10.33'] },
      { text: 'Only US Army (blue) ground and air units and US CVE escort carriers can be sent to Europe when delayed. Marines, other ships and Commonwealth units are exempt.', cite: ['9.22'] },
    ],
  },
  {
    key: 'us-pw',
    title: 'What moves US Political Will',
    statements: [
      { text: 'US casualties: an eliminated US division or corps in an Allied ground attack costs a point (once per turn).', cite: ['16.45'], links: ['us-political-will'] },
      { text: 'No US carriers on the map costs a point at the end of the turn; no US naval units at all costs another.', cite: ['16.46'] },
      { text: 'The full list, with the Progress of the War countdown, is on the US Political Will page.', cite: ['16.4'], links: ['us-political-will'] },
    ],
  },
];
