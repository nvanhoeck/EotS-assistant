import type { Section } from '../types';

export const BATTLE_SECTIONS: Section[] = [
  {
    key: 'sequence',
    title: 'How a battle runs',
    statements: [
      { text: 'Each battle has two steps: air and naval combat first, then ground combat. There are two Combat Results Tables with different die roll modifiers.', cite: ['9.0'] },
      { text: 'The Offensives player moves and declares battle hexes, then the Reaction player activates forces in or moving to declared battle hexes. Battles then involve the activated forces of both sides, plus the Reaction player’s inactive forces that are in the battle hex.', cite: ['7.2', '7.24', '7.26', '9.2'] },
      { text: 'All units in the same hex take part in the same battle. No unit of either player fights in more than one battle per offensive.', cite: ['9.1'] },
      { text: 'Supply has no effect on battle resolution. Its effects are applied in the Attrition phase and in activation limitations.', cite: ['9.14'], links: ['attrition'] },
    ],
  },
  {
    key: 'participation',
    title: 'Who takes part',
    statements: [
      { text: 'Activated air and carrier units fight if they are within air range of the battle hex. An air or carrier unit in the battle hex must fight there and cannot fight another battle in range. A Reaction air or carrier unit that starts its reaction in the battle hex and reacts out of it must still fight in it.', cite: ['9.11'] },
      { text: 'A carrier that did not end its move in a friendly port must either fight in a battle or be assigned to cover an amphibious landing on an empty enemy-controlled hex.', cite: ['9.11', '7.24'] },
      { text: 'Activated non-carrier ships that enter the battle hex add their naval strength. Ships not in the battle hex but stacked with a participating carrier add nothing, but share in the losses. Carriers within air range, including in the battle hex, always add their strength.', cite: ['9.12'] },
      { text: 'All ground units in a declared battle hex fight the ground combat. Offensive ground units that arrived by amphibious assault fight only if their side wins the air-naval battle. If a mix arrived by ground movement and amphibious assault and the Offensives player lost the air-naval battle, only the ground-moved units fight. Reaction ground units that arrived by amphibious assault fight whatever the air-naval outcome.', cite: ['9.13'] },
    ],
  },
  {
    key: 'air-naval',
    title: 'Air-naval combat',
    statements: [
      { text: 'Each side adds up its activated air and naval attack strength in the battle hex plus activated air, CV, CVL and CVE units taking part from outside the hex. The Reaction player also adds inactive naval and air units that are in the battle hex.', cite: ['9.2'] },
      { text: 'Air units using a non-parenthetical extended range in battle halve their attack strength, rounded up. At normal range they count in full, even if they used extended range to move. Air units with a parenthetical extended range cannot use it to join the battle or to move in an offensive where they fight.', cite: ['9.2'] },
      { text: 'Each side rolls a die and applies the modifiers to find its Combat Effectiveness Rating: modified 0–2 is one quarter, 3–5 is one half, 6–8 is one, 9 or more is one. Total strength times the rating is the number of hits, rounded up.', cite: ['9.2'] },
      { text: 'Die roll modifiers: Ambush, Allies +4. Surprise Attack +3. 1943 turns: +1 for the Allies if any US air or carrier unit is present. 1944 and 1945 turns: +3 for the Allies if any US air or carrier unit is present. Plus any battle modifier on an event card.', cite: ['9.2'] },
      { text: 'An unmodified roll of 9 is also a critical hit.', cite: ['9.2'] },
      { text: 'Intercept: both players apply hits at the same time. Surprise Attack: the Offensives player applies all hits first; surviving Reaction units then work out strength, roll and apply hits. Ambush (only through a Reaction card): the Reaction player applies hits first; surviving Offensive units then answer.', cite: ['9.2'] },
      { text: 'Excess hits that cannot be applied are lost.', cite: ['9.2'] },
    ],
  },
  {
    key: 'hits',
    title: 'Applying hits',
    statements: [
      { text: 'The player who rolled applies the hits, in any manner within the restrictions below. Hits can go to units in the battle and to non-carrier ships stacked with a participating carrier outside the battle hex.', cite: ['9.2'] },
      { text: '1. Hits equal to a unit’s defense strength flip it to its reduced side, or eliminate it if already reduced.', cite: ['9.2'] },
      { text: '2. All full-strength units must be reduced before any unit can be eliminated. Single-sided units count as reduced. Non-carrier ships stacked with a participating carrier (outside the battle hex) must also be reduced before any reduced unit can be eliminated.', cite: ['9.2'] },
      { text: '3. Excess hits are lost if no further unit can be hit under these restrictions.', cite: ['9.2'] },
      { text: '4. Air, CV, CVL and CVE units within range but not in a hex with opposing ships can take hits only if the other side also has at least one such unit, one for one matched. The side applying hits chooses which carrier or air units take them. Ships that cannot fly can always be hit.', cite: ['9.2'] },
      { text: '5. If one side was the only one with air and/or naval units, hits may be applied to opposing ground units in the hex. If opposing air or naval units were present, hits can only go to air and naval units. The last ground step in a hex cannot be eliminated by air-naval hits (the Reaction player chooses which reduced unit is the last step), and intrinsic defense strength is always the last step.', cite: ['9.2'] },
      { text: '6. Critical hit (an unmodified 9, or by event): may circumvent rule 2, eliminating units while others stay at full strength. If the hits cannot cause even one step loss, one step loss is assessed to the opposing unit with the lowest defense strength that can take it (Reaction player chooses ties).', cite: ['9.2'] },
      { text: '7. Japanese naval aircraft range advantage: if the Allies have no critical hit and Japan has more than one carrier present, Japan may after all hits are applied reduce one carrier or eliminate a reduced one to recover a step on another. It is a one step for one step transfer.', cite: ['9.2'] },
    ],
  },
  {
    key: 'winner',
    title: 'Who wins air-naval combat',
    statements: [
      { text: 'Both sides add up the attack strengths of surviving air and naval units that contributed to the battle, active or inactive. Halved air strengths stay halved. Only non-carrier ships in the battle hex count, not escorts of distant carriers. The higher total wins; a tie goes to the Reaction player (unless no air or naval units survive at all).', cite: ['9.3'] },
      { text: 'Special exception: if the Reaction player has air or carrier units present and the Offensives player has no surviving air or carrier units, the Reaction player wins automatically.', cite: ['9.3'] },
      { text: 'If no air or naval units survive, the result is an Offensives player victory.', cite: ['9.31'] },
      { text: 'Reaction player victory: Offensive ground units that arrived by amphibious assault do not fight the ground battle, do not capture the hex (even if no Reaction ground units are there) and must later do post battle movement out of it. If Offensive ground units that arrived by ground movement face Reaction ground units, fight the ground battle immediately; otherwise there is no ground battle.', cite: ['9.32', '9.13'] },
      { text: 'Offensives player victory: if Offensive ground units remain in the hex with Reaction ground units, ground combat follows. If ground units of only one side are in the hex, that side gains (or keeps) control and the battle is concluded. If there are no ground units at all, the Reaction player keeps control.', cite: ['9.33'] },
      { text: 'If neither player had air or naval units, ground combat happens as if the Offensives player had won the air-naval combat.', cite: ['9.34'] },
    ],
  },
  {
    key: 'ground',
    title: 'Ground combat',
    statements: [
      { text: 'Ground combat is always simultaneous, whatever the intelligence condition. Add the activated ground attack values plus inactive ground units that are in the battle hex, then roll.', cite: ['9.4'] },
      { text: 'Combat Effectiveness Rating: modified less than zero to 2 is one half, 3–6 is one, 7–8 is one and a half, 9 or more is two (rounded up). Total ground strength times the rating is the hits.', cite: ['9.4'] },
      { text: 'Offensives player modifiers: +2 shore bombardment if only the Offensives player has ships in the battle hex after air-naval combat; +2 air superiority if only the Offensives player has surviving active air or carrier units (no surviving active or inactive Reaction air or carrier units); terrain: jungle −1, mixed −2, mountains −3 (no modifier for cities). An unopposed Offensive carrier in the battle hex (e.g. a CVE) gives both, +4.', cite: ['9.4'] },
      { text: 'Reaction player modifier: +3 if the Reaction player had land or HQ units in the hex before an amphibious assault into it.', cite: ['9.4'] },
      { text: 'Event modifiers from the card played as the current event, or from a reaction, or still in effect from an earlier event (such as Japanese Defense doctrine), are added. The exception is the Japanese card Col. Tsuji, whose bonus is the final modifier for the Offensives player’s roll and is not cumulative.', cite: ['9.4'] },
      { text: 'Armor: +1 to the Allied roll if the British 7th Armor Brigade is in the battle.', cite: ['9.4'] },
      { text: 'Only ground units can be hit, including non-activated ones in the hex. Hits equal to a unit’s defense flip or eliminate it. Full-strength units must be reduced before reduced units can be eliminated, and excess hits that cannot be allocated are lost. Offensive units that arrived by amphibious assault have their defense strength halved (rounded up) for hits.', cite: ['9.4'] },
      { text: 'Result: if only one side has ground units left, it wins. Otherwise the side that took the most step losses retreats (a reduction or an elimination of a reduced unit is one step). A tie goes to the Reaction player, so the Offensives player retreats.', cite: ['9.4'] },
      { text: 'If both sides are eliminated, the Reaction player keeps control of the hex but all forces are still eliminated. If only the Offensives player survives it controls the hex and its air and naval units may move there in post battle movement.', cite: ['9.4', '6.5'] },
    ],
  },
  {
    key: 'retreat',
    title: 'Retreat',
    statements: [
      { text: 'A retreating Offensive ground unit that entered by ground movement goes back to the hex it entered from. One that arrived by amphibious assault does post battle movement like a naval unit.', cite: ['9.5'] },
      { text: 'A retreating Reaction ground unit is moved by the Offensives player into an adjacent hex that holds no Offensives unit, is not a hex an Offensives ground unit entered from, and does not cause an overstack. If possible this must be a legal named location friendly to the unit; otherwise any legal hex. If none qualifies, or the battle hex is a one-hex island, it is eliminated.', cite: ['9.5'] },
    ],
  },
  {
    key: 'post-battle',
    title: 'Post battle movement',
    statements: [
      { text: 'It is conducted after all battles are concluded (whether or not battles were fought), by active units that did no strategic movement. Air and naval units use the same allowances as in the offensive; ground units only retreat. The Reaction player moves first. No strategic movement is allowed.', cite: ['9.6', '7.2'] },
      { text: 'Reaction units: active Reaction units must end in a Reaction-controlled hex (air on airfields, ships in port), in supply and within range of a friendly HQ if possible; any controlled hex if not; otherwise they are eliminated. Inactive Reaction air and naval units left in an enemy-controlled hex make an emergency move after the Offensives player’s post battle movement.', cite: ['9.61', '8.22', '8.32'] },
      { text: 'Offensives units: after Reaction post battle movement, all active Offensives air and naval units may move. Naval units must end in a friendly-controlled hex with a port, air units in a friendly-controlled hex with an airfield. Ground units leave only if forced to retreat. Any unit unable to end in a legal location is eliminated.', cite: ['9.62'] },
      { text: 'After losing a battle, amphibious ground units move like naval units but may not move into or through opposing-occupied hexes or un-neutralized air ZOI. Exception: if losses left them in an enemy air ZOI, they may continue through it until they reach a hex free of ZOI.', cite: ['9.62'] },
    ],
  },
];
