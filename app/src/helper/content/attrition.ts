import type { Section } from '../types';

export const ATTRITION_SECTIONS: Section[] = [
  {
    key: 'rules',
    title: 'Attrition rules',
    statements: [
      { text: 'In the Attrition phase all ground and air units determine their supply state. HQs and naval units are not affected by attrition.', cite: ['4.4', '6.24'], links: ['supply'] },
      { text: 'Both sides are done at the same time, in this order: first eliminate, then flip.', cite: ['6.24'] },
      { text: 'Eliminate every unsupplied reduced or single-step air or ground unit that is not in a hex affected by an emergency supply route and is out of range of any friendly HQ, supplied or not.', cite: ['6.24'] },
      { text: 'When measuring range from an HQ to the unit, enemy units, opposing ZOI and unplayable hexsides do not block the path.', cite: ['6.24', '6.4'] },
      { text: 'Flip every unsupplied full-strength air or ground unit that is not in a hex affected by an emergency supply route to its reduced side.', cite: ['4.4', '6.24'] },
      { text: 'An unsupplied unit already on its reduced side that is within range of any friendly HQ, whether that HQ is supplied or not, stays reduced.', cite: ['6.24'] },
      { text: 'An emergency supply route (China Airlift, Tokyo Express) prevents attrition in its hex.', cite: ['6.24', '6.23'] },
      { text: 'Attrition is calculated and applied simultaneously, so opposing units can attrit each other.', cite: ['6.24'] },
      { text: 'Units with only one side (Dutch regiments, the US Marine Wake unit, CVL Hermes) are considered to be on their reduced side.', cite: ['6.24'] },
    ],
  },
];
