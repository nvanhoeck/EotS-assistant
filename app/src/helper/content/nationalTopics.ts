import type { Section } from '../types';

export const CHINA_SECTIONS: Section[] = [
  {
    key: 'surrender',
    title: 'When China surrenders',
    statements: [
      { text: 'China surrenders the instant the China marker is in the China Collapses box during the Offensive segment, due to a China Offensive or an event. It does not wait for the National Status segment.', cite: ['13.73'] },
      { text: 'All Allied air units in China go on the game turn track and return as reinforcements next turn (they may be delayed). All Chinese units are permanently removed from the game.', cite: ['13.73'] },
      { text: 'Consequences elsewhere: US Political Will −2, the Allies draw one card fewer (and gain a pass), and there are no more Chinese replacements.', cite: ['16.41', '12.52', '11.34'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'offensives',
    title: 'China Offensives',
    statements: [
      { text: 'Japan can launch OC and EC Chinese offensives. EC ones come from particular Event cards, with no limit on how many can be played in a game turn.', cite: ['13.72'] },
      { text: 'An OC Chinese offensive is a China OC Card Offensive made by playing any 3 OC card. It can occur no more than once per two turns: it may be launched on any game turn, but not on consecutive game turns.', cite: ['13.72'] },
      { text: 'A successful Japanese offensive moves the China marker one box toward Government Collapsed. An unsuccessful OC offensive, or an Allied China Offensive event, moves it one or more boxes (for some events) toward Stable Front. Unless an event says otherwise, a marker that would enter the Stable Front box stays in Unstable Front instead.', cite: ['13.72'] },
      { text: 'Procedure: Japan takes the Offensive Baseline value = Japanese Divisions in China minus the Allied Burma Road support on the Burma Road Status track. Japan rolls: equal to or lower than the baseline moves the marker one box toward Collapse.', cite: ['13.72'] },
      { text: 'Any other result leaves the marker alone, unless the offensive failed and Allied air support added at least +1 to the roll: then it moves one box toward Stable Front (but not into the Stable Front box itself).', cite: ['13.72'] },
      { text: 'Allied air support adds to the die roll: +1 for each in-supply non-LRB air unit in China, and +1 if the 14th Air Force LRB is there. Air units are placed in the China box as reinforcements or fly there from Northern India.', cite: ['13.72', '13.74'] },
    ],
  },
  {
    key: 'movement',
    title: 'Moving and fighting in China',
    statements: [
      { text: 'Non-Chinese Allied or Japanese units may enter or attack only Chinese coastal hexes. Hong Kong (2709) and Formosa are not part of China.', cite: ['13.71'] },
      { text: 'Chinese units may only enter Northern India, Burma, Kunming (2407) and the hexes next to Kunming. A Chinese unit forced into any other nation is eliminated.', cite: ['13.71', '13.75'] },
      { text: 'If the Allies control all Chinese coastal ports and both Korean port hexes, Japan can no longer remove divisions from China or conduct any further China Offensive (OC or EC).', cite: ['13.71'] },
      { text: 'Chinese Army units can be activated by any Allied HQ in range. Unsupplied Chinese Army units cannot be activated and suffer attrition normally.', cite: ['13.75', '6.12'] },
      { text: 'Kunming and all adjacent hexes are considered Allied controlled and occupied for all game purposes.', cite: ['13.75'] },
    ],
  },
  {
    key: 'air-box',
    title: 'Air units in China',
    statements: [
      { text: 'Up to two Allied air units may be in the Air Units in China box, and only one of them a B-29.', cite: ['13.74'] },
      { text: 'They are in supply there if the Burma Road is open or the Hump is active and there is a supply-eligible Northern India airfield. An Allied HQ can activate them if it can trace an activation path to Kunming, or, with the Hump active, to any supply-eligible friendly Northern India airfield.', cite: ['13.74'], links: ['supply'] },
      { text: 'If China has not surrendered and the Burma Road is open, the Allies may place air units as reinforcements directly in the China box.', cite: ['13.74'] },
      { text: 'Activated air units (including B-29s) can fly between a supply-eligible Northern India airfield and the China box in one leg, whatever their range.', cite: ['13.74', '8.31'] },
      { text: 'An air unit in the box that is out of supply cannot be activated, adds nothing to the China Offensive die roll, and suffers attrition but cannot be eliminated by it.', cite: ['13.74'] },
      { text: 'A B-29 in China counts as in range of Tokyo only for Strategic Bombing and the Allied victory check.', cite: ['13.74', '12.31', '16.2'], links: ['strategic-warfare'] },
    ],
  },
  {
    key: 'supply',
    title: 'Kunming, the Burma Road and the Hump',
    statements: [
      { text: 'Kunming is a supply source if the Burma Road is open or the Hump is active (Allied card 17) and there is a supply-eligible Northern India airfield.', cite: ['13.75', '6.21'], links: ['supply'] },
      { text: 'Any Allied unit that can trace an overland-only supply path of 4 or fewer MPs directly from Kunming is in supply, akin to a supply-eligible port. This is an exception to needing an HQ, and the path can be used to activate a unit if an activation path also exists.', cite: ['13.75'] },
      { text: 'The Burma Road is the strategic transport route in hexes 2206, 2306 and 2407. It is open if a strategic transport route can be traced from Kunming to Rangoon and then by sea to Madras or a map edge (the sea part may not pass through an un-neutralized enemy air ZOI), or from Kunming to Madras over the constructed Jarhat/Ledo or Jarhat/Imphal routes. Otherwise it is closed.', cite: ['13.78'] },
      { text: 'Playing the China Airlift card (Allied card 17) makes the Hump active for the rest of the game. A closed Burma Road with the Hump is “Closed/HUMP” while the Allies hold a supply-eligible Northern India airfield, and “NO HUMP” while they do not.', cite: ['13.78'] },
      { text: 'In a Japanese China OC Offensive, the Allies subtract the Burma Road support from the Japanese baseline.', cite: ['13.78', '13.72'] },
    ],
  },
  {
    key: 'cbi',
    title: 'CBI infrastructure and the Kwai bridge',
    statements: [
      { text: 'In the 1941 Campaign Scenario Jarhat, Imphal and Ledo start with a marker showing their strategic transport route is not yet built. Later scenarios say whether the markers are in place.', cite: ['13.77'] },
      { text: 'If the Allies control all of Northern India plus Akyab, a complete play of a 3 OC card builds one of the three routes (the card activates nothing). Jarhat must be built first. Construction is permanent.', cite: ['13.77'] },
      { text: 'Japan can build only the Imphal route, by a 3 OC play, if it can trace an LOC from Imphal by strategic transport route to a supply-eligible, Japanese-controlled Rangoon. It does not need Jarhat first.', cite: ['13.77'] },
      { text: 'The Bangkok to Rangoon railway can only be built by the Bridge over the River Kwai event (Japanese card 18). When units starting in Burma, Northern India or Ceylon are activated, the HQ efficiency is −1 (minimum 0) if the event has not been played and Rangoon is Allied controlled, and +1 if it has been played, Rangoon is Japanese and a unit traces supply over that railway.', cite: ['13.79'] },
    ],
  },
  {
    key: 'japan-strength',
    title: 'Japanese strength in China',
    statements: [
      { text: 'Each city hex in Japanese-occupied China holds one intrinsic one-step Japanese ground unit (9-12) for every 4 boxes still remaining on the Japanese Divisions in China track, rounded up. With no divisions left, one unit is still considered present.', cite: ['13.76'] },
      { text: 'These steps are always the last eliminated, do not count for stacking, and are not present in a hex the Allies control, but return if Japan retakes it. Hong Kong (2709) gets them once it is Japanese controlled.', cite: ['13.76'] },
      { text: 'Japan can take up to two divisions per Replacement segment from the China Divisions track.', cite: ['11.23'], links: ['replacements'] },
    ],
  },
  {
    key: 'allied-effects',
    title: 'Chinese units and the Allies',
    statements: [
      { text: 'A Chinese unit that has to be placed as if it were a reinforcement can only be placed in Kunming (2407).', cite: ['10.1'], links: ['reinforcements'] },
      { text: 'One Chinese replacement on each odd-numbered turn while China has not surrendered: flip a reduced Chinese army, or bring an eliminated one back at reduced strength in Kunming. It can be placed only if Kunming is available as a supply source. A replacement not used that turn is lost, and other replacements cannot be used for Chinese units.', cite: ['11.34'], links: ['replacements'] },
      { text: 'If China has surrendered, the Allies draw one card fewer.', cite: ['12.52'] },
      { text: 'Chinese units can be activated by any Allied HQ in range (US, Commonwealth and Joint HQs). Chinese units cannot use Amphibious Assault or strategic transport.', cite: ['6.12', '13.75', '8.45'] },
    ],
  },
];

export const INDIA_SECTIONS: Section[] = [
  {
    key: 'territory',
    title: 'The parts of India',
    statements: [
      { text: 'Northern India is Jorhat (2104), Dimapur (2005), Ledo (2205), Dacca (1905) and Imphal-Kohima (2105).', cite: ['13.61'] },
      { text: 'Mainland India is every Indian coastal hex that is not in Northern India or Ceylon. Ceylon is all hexes on that island.', cite: ['13.61'] },
      { text: 'Japanese units may never enter Mainland India, although Japanese air and naval units may attack Mainland India hexes within range. Allied units may enter any hex in India.', cite: ['13.61'] },
    ],
  },
  {
    key: 'stability',
    title: 'The India track',
    statements: [
      { text: 'The India Status track has five boxes, from right to left: Stable (start), Unrest, Strikes, Unstable and Revolts.', cite: ['13.62'] },
      { text: 'If Japan controls all hexes of Northern India during the National Status segment, move the India marker one box along the track (right to left).', cite: ['13.62'] },
      { text: 'If the marker is in the Revolts box during a National Status segment, India surrenders (flip the marker to its surrendered side).', cite: ['13.62'] },
      { text: 'Other events may also move the marker forward, but never beyond Revolts, and they cannot directly cause India to surrender.', cite: ['13.62'] },
      { text: 'The marker returns to Stable in either of two cases: the Allies control one or more Northern India hexes during the National Status segment; or Japan controls all of Northern India and, during the Offensive segment, the Allies regain control of a Northern India hex in any manner (move the marker immediately, restarting the sequence).', cite: ['13.62'] },
      { text: 'Once India surrenders the marker never leaves the surrender box, and India cannot come back into the war.', cite: ['13.62'] },
    ],
  },
  {
    key: 'surrender-effects',
    title: 'If India surrenders',
    statements: [
      { text: 'All Indian Commonwealth units are removed from the game.', cite: ['13.63'] },
      { text: 'All other Commonwealth units in Mainland India are placed on Ceylon or the Maldive Islands (1005), or permanently removed if all of Ceylon and the Maldives are Japanese controlled. The hexes must be supply eligible and outside an un-neutralized Japanese air ZOI. Units that would overstack or have no legal place are removed (the Allied player chooses).', cite: ['13.63'], links: ['supply'] },
      { text: 'Commonwealth HQs in India are involuntarily repositioned. US units in India do not have to move, but may, treated like Commonwealth units.', cite: ['13.63', '6.14'] },
      { text: 'Hex control in Mainland India does not switch to Japan. The Allies can return by Amphibious Assault or ground movement. Those hexes are not eligible for Japanese Special Reaction, and do not count for Progress of the War if re-occupied by Allied units.', cite: ['13.63'] },
      { text: 'US Political Will −2.', cite: ['16.41'], links: ['us-political-will'] },
      { text: 'The Allies draw one card fewer, and gain a pass.', cite: ['12.52'] },
    ],
  },
  {
    key: 'units',
    title: 'Indian units',
    statements: [
      { text: 'Indian units cannot use Amphibious Assault or strategic transport.', cite: ['8.45'] },
      { text: 'Commonwealth HQs and Joint HQs can activate Commonwealth units, which include Indian units.', cite: ['6.12', '1.3'] },
    ],
  },
];

export const US_SECTIONS: Section[] = [
  {
    key: 'isr-general',
    title: 'Inter-Service Rivalry: how it works',
    statements: [
      { text: 'Inter-Service Rivalry is triggered only by the play of the appropriate Event card, and ends only by an Event card (exception: the one-year scenarios’ special rules 17.26, 17.37 and 17.47).', cite: ['14.0'] },
      { text: 'It is shown by flipping the Inter-Service Rivalry marker to its Rivalry side. When an Event card ends it, flip the marker to Strategic Agreement.', cite: ['14.0'] },
      { text: 'Coordination of units and logistics is less effective while it lasts. Both sides can suffer it.', cite: ['14.0'] },
    ],
  },
  {
    key: 'isr-us',
    title: 'US Inter-Service Rivalry',
    statements: [
      { text: 'All US Army/Air Corps reinforcements (not Allied, and not US Marine or Navy) are automatically delayed. If that is the only reason for delay, only US Army reinforcements go in the delay box; the others are received normally.', cite: ['14.1', '10.21'], links: ['reinforcements'] },
      { text: 'Every War-in-Europe diverted-to-Europe (Sent to Europe) die roll has 1 subtracted from it.', cite: ['14.1', '10.24'], links: ['war-in-europe'] },
      { text: 'An HQ cannot activate both US Army units and US Navy units in the same offensive, or in reaction to the same offensive. It can activate only one of the two kinds, though other Allied units are not restricted.', cite: ['14.1'] },
      { text: 'US Army ground units may still use Amphibious Assault during Inter-Service Rivalry. Naval escort can occur due to card text, or if a Joint HQ activates a non-US naval unit.', cite: ['14.1'] },
      { text: 'See the rulebook glossary for what counts as an Army unit and a Navy unit.', cite: ['1.3'] },
    ],
  },
  {
    key: 'isr-japan',
    title: 'Japanese Inter-Service Rivalry',
    statements: [
      { text: 'An HQ cannot activate both army and naval units in the same offensive, or in reaction to the same offensive.', cite: ['14.2'] },
      { text: 'Japan can use only half (rounded up) of its total Amphibious Shipping Points while the condition lasts.', cite: ['14.2'] },
    ],
  },
  {
    key: 'us-placement',
    title: 'Placing and activating US units',
    statements: [
      { text: 'Ground and naval reinforcements are placed in a friendly port where the unit is in supply and within activation range of an HQ that can activate it. Air units go in a friendly airfield under the same conditions.', cite: ['10.1'], links: ['reinforcements'] },
      { text: 'US HQs can activate US units and Chinese units. Joint HQs can activate any Allied unit.', cite: ['6.12'] },
    ],
  },
  {
    key: 'us-replacements',
    title: 'US replacements and Europe',
    statements: [
      { text: 'Allied ground replacements (two per turn from turn 2) may be used for reduced or eliminated US and Commonwealth ground units.', cite: ['11.31'], links: ['replacements'] },
      { text: 'US naval replacements (1 or 2 per turn, none on turn 1) need the Allies to control Oahu (5808).', cite: ['11.33'] },
      { text: 'Only US Army (blue) ground and air units and US CVE escort carriers can be sent to Europe when delayed. Marines, other ships and Commonwealth units are exempt.', cite: ['10.22'] },
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
