import type { Section } from '../types';

export const REINFORCEMENT_SECTIONS: Section[] = [
  {
    key: 'ground',
    title: 'Ground units',
    statements: [
      { text: 'Place a ground unit in a friendly, supply-eligible port.', cite: ['9.1', '13.1'], links: ['supply'] },
      { text: 'The port must be within Activation Range of an HQ that can activate the unit.', cite: ['9.1', '7.52'] },
      { text: 'US ground units may use only US or Joint HQs. Commonwealth ground units may use only Commonwealth or Joint HQs.', cite: ['9.12'] },
      { text: 'Japanese ground units may use any Japanese HQ.', cite: ['9.13'] },
    ],
  },
  {
    key: 'naval',
    title: 'Naval units',
    statements: [
      { text: 'Place a naval unit in a friendly, supply-eligible port within Activation Range of an HQ that can activate it.', cite: ['9.1', '7.52'], links: ['supply'] },
      { text: 'US naval units may use only US or Joint HQs. Commonwealth naval units may use only Commonwealth or Joint HQs.', cite: ['9.12'] },
      { text: 'Japanese naval units may use any Japanese HQ.', cite: ['9.13'] },
      { text: 'If a US CVE (escort carrier) reinforcement is delayed it can be sent to Europe. Other US ships cannot.', cite: ['9.22'] },
    ],
  },
  {
    key: 'air',
    title: 'Air units',
    statements: [
      { text: 'Place an air unit in a friendly, supply-eligible airfield within Activation Range of an HQ that can activate it.', cite: ['9.1', '7.52'], links: ['supply'] },
      { text: 'US air units may use any friendly HQ, whatever its nationality.', cite: ['9.12'] },
      { text: 'Commonwealth air units may use only Commonwealth or Joint HQs.', cite: ['9.12'] },
      { text: 'Japanese air units may use any Japanese HQ.', cite: ['9.13'] },
    ],
  },
  {
    key: 'hq',
    title: 'HQ units',
    statements: [
      { text: 'An HQ arriving as a reinforcement must be placed in a friendly, supply-eligible port.', cite: ['9.1'] },
      { text: 'An arriving HQ can place reinforcements only in the hex it occupies. HQs used to place other reinforcements must have started the turn on the map.', cite: ['9.1'] },
      { text: 'HQ units can never be delayed.', cite: ['9.23'] },
      { text: 'Allied HQs are US (for example Central, South, Southwest), Commonwealth (Malaya, SEAC) or Joint (ANZAC, ABDA). Every Japanese HQ is effectively Joint.', cite: ['9.12', '9.13'] },
    ],
  },
  {
    key: 'general',
    title: 'General restrictions',
    statements: [
      { text: 'Reinforcements arrive on a schedule or because of an Event Card.', cite: ['9.1'] },
      { text: 'The Allied player places all reinforcements first, then the Japanese player.', cite: ['9.1'] },
      { text: 'Stacking and placement restrictions can never be violated.', cite: ['9.1'] },
      { text: 'No usable point of entry (for example no suitable HQ)? The owner may delay the unit voluntarily; it waits in the Delayed Reinforcement box until it can enter legally.', cite: ['9.14'] },
      { text: 'Japanese reinforcements are never delayed or diverted. The Allied player first receives the delayed units from earlier turns, then the current turn’s.', cite: ['4.11'] },
    ],
  },
  {
    key: 'zoi',
    title: 'Placement and ZOI',
    statements: [
      { text: 'Never place a reinforcement in an un-neutralized enemy ZOI.', cite: ['9.1', '7.35'] },
      { text: 'In-supply air and carrier units project a 2-hex Zone of Influence.', cite: ['7.35'] },
      { text: 'Placing a reinforcement cannot change enemy ZOI to make another placement possible.', cite: ['9.1'] },
    ],
  },
  {
    key: 'chinese',
    title: 'Chinese units',
    statements: [
      { text: 'A Chinese unit that has to be placed as if it were a reinforcement can only be placed in Kunming (hex 2407).', cite: ['9.12'] },
      { text: 'The scheduled reinforcements in the game are all US or Commonwealth.', cite: ['9.12'] },
    ],
  },
  {
    key: 'delayed',
    title: 'Allied delayed reinforcements',
    statements: [
      { text: 'At the start of the Reinforcement segment the Allied player brings every unit in the Delayed Reinforcement box into play.', cite: ['9.21'] },
      { text: 'Then, if War in Europe has no effect, this turn’s new reinforcements arrive normally. At level 1 or more, or when Inter-Service Rivalry or an Event Card requires it, all of them go into the box instead.', cite: ['9.21', '14.0', '15.0'] },
      { text: 'HQ units and US B-29 units can never be delayed.', cite: ['9.23'] },
      { text: 'A unit waiting in the box because it had no usable entry point is eligible to be sent to Europe every turn it stays there.', cite: ['9.14'] },
    ],
  },
  {
    key: 'sent-to-europe',
    title: 'Sent to Europe',
    statements: [
      { text: 'Eligible: US Army (blue) ground and air units, but not Marines, and US CVE escort carriers (not CV or CVL). Everything else is exempt.', cite: ['9.22'] },
      { text: 'A die is rolled for each eligible unit as it enters the Delayed Reinforcement box, even when an event put it there.', cite: ['9.24'] },
      { text: 'Sent if the roll is in range. War in Europe none: no roll. Level 1: 0–1. Level 2: 0–3. Level 3: 0–5. Level 4: 0–7.', cite: ['9.24'] },
      { text: 'A sent unit is put on the turn track 3 turns later and re-enters as a reinforcement as if for the first time. A unit can be sent more than once.', cite: ['9.24'] },
    ],
  },
];
