import type { Section } from '../types';

export const BATTLE_SECTIONS: Section[] = [
  {
    key: 'sequence',
    title: 'How a battle runs',
    statements: [
      { text: 'Each battle has two steps: air and naval combat first, then ground combat. There are two Combat Results Tables with different die roll modifiers.', cite: ['8.0'] },
      { text: 'The Offensives player moves and declares battle hexes, then the Reaction player activates forces in or moving to declared battle hexes. Battles then involve the activated forces of both sides, plus the Reaction player’s inactive forces that began the offensive in a battle hex.', cite: ['8.0'] },
      { text: 'All units in the same hex take part in the same battle. No unit of either player fights in more than one battle per offensive.', cite: ['8.1'] },
      { text: 'Supply has no effect on battle resolution. Its effects are applied in the Attrition phase.', cite: ['8.14'], links: ['attrition'] },
    ],
  },
  {
    key: 'participation',
    title: 'Who takes part',
    statements: [
      { text: 'Activated air and carrier units fight if they are within air range of the battle hex. An air unit in the battle hex must fight there and cannot fight another battle in range. A Reaction air unit that starts its reaction in the battle hex and reacts out of it must still fight in it.', cite: ['8.11'] },
      { text: 'Activated non-carrier ships that enter the battle hex add their naval strength. Ships not in the battle hex but stacked with a carrier add nothing, but share in the losses. Carriers within air range, including in the battle hex, always add their strength.', cite: ['8.12'] },
      { text: 'All ground units in a declared battle hex fight the ground combat. Offensive ground units that arrived by amphibious assault fight only if their side wins the air-naval battle. If a mix arrived by ground movement and amphibious assault and the Offensives player lost the air-naval battle, only the ground-moved units fight.', cite: ['8.13'] },
    ],
  },
  {
    key: 'air-naval',
    title: 'Air-naval combat',
    statements: [
      { text: 'Each side adds up its activated air and naval attack strength in the battle hex plus activated air, CV, CVL and CVE units in range. The Reaction player also adds inactive naval and air units that began the offensive in the battle hex.', cite: ['8.2'] },
      { text: 'Air units using a non-parenthetical extended range in battle halve their attack strength, rounded up. At normal range they count in full.', cite: ['8.2'] },
      { text: 'Each side rolls a die and applies the modifiers to find its Combat Effectiveness Rating: modified 0–2 is one quarter, 3–5 is one half, 6–8 is one, 9 or more is one. Total strength times the rating is the number of hits, rounded up.', cite: ['8.2'] },
      { text: 'Die roll modifiers: Ambush, Allies +4. Surprise Attack +3. 1943 turns: +1 for the Allies if any US air or carrier unit is present. 1944 and 1945 turns: +3 for the Allies if any US air or carrier unit is present. Plus any battle modifier on an event card.', cite: ['8.2'] },
      { text: 'An unmodified roll of 9 is also a critical hit.', cite: ['8.2'] },
      { text: 'Intercept: both players apply hits at the same time. Surprise Attack: the Offensives player applies all hits first; surviving Reaction units then work out strength, roll and apply hits. Ambush (only through a Reaction card): the Reaction player applies hits first; surviving Offensive units then answer.', cite: ['8.2'] },
      { text: 'Hits are used up in that battle, and excess hits cannot be saved. Non-activated units in the battle hex can be hit.', cite: ['8.2'] },
    ],
  },
  {
    key: 'hits',
    title: 'Applying hits',
    statements: [
      { text: 'The player who rolled applies the hits. Hits cannot be avoided if a legitimate target can be damaged or eliminated. If the restrictions seem to contradict each other, the player who rolled decides.', cite: ['8.2'] },
      { text: '1. Hits equal to a unit’s defense strength flip it to its reduced side, or eliminate it if already reduced.', cite: ['8.2'] },
      { text: '2. Full-strength units must be reduced before reduced units can be eliminated. Single-sided units count as reduced. Non-carrier ships stacked with a participating carrier (outside the battle hex) can and must take losses before any reduced unit can be eliminated, except on a critical hit.', cite: ['8.2'] },
      { text: '3. No unit takes a second consecutive hit (full to eliminated) until every unit that can be reduced has been. Excess hits are lost if this cannot be done.', cite: ['8.2'] },
      { text: '4. Air, CV, CVL and CVE units within range but not in a hex with opposing ships can take hits only if the other side also has at least one such unit, one for one matched. The side applying hits chooses which carrier or air units take them. Ships that cannot fly can always be hit.', cite: ['8.2'] },
      { text: '5. If one side was the only one with air and/or naval units, hits may be applied to opposing ground units in the hex. If opposing air or naval units were present, hits can only go to air and naval units. The last ground step in a hex cannot be eliminated by air-naval hits, and intrinsic defense strength is always the last step.', cite: ['8.2'] },
      { text: '6. Critical hit (an unmodified 9, or by event): apply hits in any manner, even eliminating units while others stay at full strength. If the hits cannot cause even one step loss, one step loss is assessed to the opposing unit with the lowest defense strength that can take it (Reaction player chooses ties).', cite: ['8.2'] },
      { text: '7. Japanese naval aircraft range advantage: if the Allies have no critical hit and Japan has more than one carrier present, Japan may after all hits are applied reduce one carrier or eliminate one and recover a step on another. It is a one step for one step transfer.', cite: ['8.2'] },
    ],
  },
  {
    key: 'winner',
    title: 'Who wins air-naval combat',
    statements: [
      { text: 'Both sides add up the attack strengths of surviving air and naval units that contributed to the battle, active or inactive. Halved air strengths stay halved. Only non-carrier ships in the battle hex count, not escorts of distant carriers. The higher total wins; a tie goes to the Reaction player.', cite: ['8.3'] },
      { text: 'Special exception: if the Reaction player has air or carrier units present and the Offensives player has no surviving air or carrier units, the Reaction player wins automatically.', cite: ['8.3'] },
      { text: 'If no air or naval units survive, the result is an Offensives player victory.', cite: ['8.31'] },
      { text: 'Reaction player victory: the battle is concluded; go to the next battle. Exception: Offensive ground units that arrived by ground movement fight the ground battle immediately.', cite: ['8.32', '8.13'] },
      { text: 'Offensives player victory: if ground units remain in the hex with Reaction ground units, ground combat follows. Lose it and the units retreat or withdraw; win it and the Offensives player gains control of the hex.', cite: ['8.33'] },
      { text: 'If neither player had air or naval units, ground combat happens as if the Offensives player had won the air-naval combat.', cite: ['8.34'] },
    ],
  },
  {
    key: 'ground',
    title: 'Ground combat',
    statements: [
      { text: 'Ground combat is always simultaneous, whatever the intelligence condition. Add the activated ground attack values plus inactive ground units that began the offensive in the hex, then roll.', cite: ['8.4'] },
      { text: 'Combat Effectiveness Rating: modified less than zero to 2 is one half, 3–6 is one, 7–8 is one and a half, 9 or more is two (rounded up). Total ground strength times the rating is the hits.', cite: ['8.4'] },
      { text: 'Offensives player modifiers: +2 shore bombardment if only the Offensives player has ships in the battle hex after air-naval combat; +2 air superiority if only the Offensives player has surviving active air or carrier units; terrain: jungle −1, mixed −2, mountains −3 (no modifier for cities).', cite: ['8.4'] },
      { text: 'Reaction player modifier: +3 if the Reaction player had land units in the hex before an amphibious assault into it.', cite: ['8.4'] },
      { text: 'Event modifiers from the card played as the current event, or from a reaction, or still in effect from an earlier event (such as Japanese Defense doctrine), are added. The exception is the Japanese card Col. Tsugi, whose ground bonus is the final modifier and is not cumulative.', cite: ['8.4'] },
      { text: 'Armor: +1 to the Allied roll if the British 7th Armor Brigade is in the battle.', cite: ['8.4'] },
      { text: 'Only ground units can be hit, including non-activated ones in the hex. Hits equal to a unit’s defense flip or eliminate it. Full-strength and two-step units are reduced before any reduced or single-step unit is eliminated, and no unit takes a second hit until all are reduced. Offensive units that arrived by amphibious assault have their defense strength halved (rounded up) for hits.', cite: ['8.4'] },
      { text: 'Result: if only one side has ground units left, it wins. Otherwise the side that took the most step losses retreats (a reduction or an elimination of a reduced unit is one step). A tie goes to the Reaction player, so the Offensives player retreats.', cite: ['8.4'] },
      { text: 'If both sides are eliminated, the Reaction player keeps control of the hex but all forces are still eliminated. If only the Offensives player survives it controls the hex and its air and naval units may move there in post battle movement.', cite: ['8.4'] },
    ],
  },
  {
    key: 'retreat',
    title: 'Retreat',
    statements: [
      { text: 'A retreating Offensive ground unit that entered by ground movement goes back to the hex it entered from. One that arrived by amphibious assault does post battle movement like a naval unit.', cite: ['8.5'] },
      { text: 'A retreating Reaction ground unit is moved by the Offensives player into an adjacent named location friendly to it if possible. Otherwise into an adjacent hex with no Offensives unit that is not a hex an Offensives ground unit entered from (no overstacking). If neither is possible, or the battle hex is a one-hex island, it is eliminated.', cite: ['8.5'] },
    ],
  },
  {
    key: 'post-battle',
    title: 'Post battle movement',
    statements: [
      { text: 'It is conducted after all battles are concluded, by active units that did no strategic movement. Air and naval units use the same allowances as in the offensive; ground units only retreat. The Reaction player moves first. No strategic movement is allowed.', cite: ['8.6'] },
      { text: 'Reaction units: if the Offensives player captured the hex, Reaction ground units retreat if they can, or are eliminated. Active Reaction units must end in a Reaction-controlled hex (air on airfields, ships in port), in supply and within range of a friendly HQ if possible; any controlled hex if not; otherwise they are eliminated. Units in the battle hex may make an emergency move.', cite: ['8.61', '7.22', '7.32'] },
      { text: 'Offensives units: survivors may stay where they are (if allowed or required) or move to a friendly airfield (air) or port (naval). Ground units leave only if forced to retreat. Any unit that must move to a friendly location and cannot is eliminated.', cite: ['8.62'] },
      { text: 'After losing a battle, amphibious ground units move like naval units but may not voluntarily enter or cross opposing-occupied hexes or un-neutralized air ZOI. Exception: if losses left them in an enemy air ZOI, they may continue through it until they reach a hex free of ZOI.', cite: ['8.62'] },
    ],
  },
];
