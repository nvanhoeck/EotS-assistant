import type { Section } from '../types';

export const ATTRITION_SECTIONS: Section[] = [
  {
    key: 'rules',
    title: 'Attrition rules',
    statements: [
      { text: 'In the Attrition phase all ground and air units determine their supply state. Naval units are not affected by attrition.', cite: ['4.4', '13.4'], links: ['supply'] },
      { text: 'An unsupplied full-strength air or ground unit is flipped to its reduced side.', cite: ['4.4', '13.4'] },
      { text: 'An unsupplied unit already on its reduced side stays reduced if it is within range of any friendly HQ, whether that HQ is supplied or not.', cite: ['13.4'] },
      { text: 'An unsupplied reduced unit that is not within range of any friendly HQ is eliminated.', cite: ['4.4', '13.4'] },
      { text: 'When measuring range from an HQ to the unit, the path cannot be blocked by enemy units or an opposing ZOI.', cite: ['13.4'] },
      { text: 'An emergency supply route (China Airlift, Tokyo Express) prevents attrition in its hex.', cite: ['13.4', '13.31'] },
      { text: 'Attrition is calculated and applied at the same time for everyone, so opposing units can attrit each other.', cite: ['13.4'] },
      { text: 'Units with only one side (Dutch regiments, the US Marine Wake unit) are considered to be on their reduced side.', cite: ['13.4'] },
    ],
  },
];
