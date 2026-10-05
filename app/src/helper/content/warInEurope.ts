import type { Section } from '../types';

export const WAR_IN_EUROPE_SECTIONS: Section[] = [
  {
    key: 'effects',
    title: 'Effects by level',
    statements: [
      { text: 'The level is read from the WIE track. War in Europe Event cards raise the level for the Allies or lower it for Japan.', cite: ['15.0'] },
      { text: 'No Effect (track +1 to +3): no impact on play.', cite: ['15.1'] },
      { text: 'Level 1 (track 0 to −2): Allied reinforcements are delayed; the US Sent to Europe range is 0–1.', cite: ['15.2'], links: ['reinforcements'] },
      { text: 'Level 2 (track −3 to −4): Allied reinforcements are delayed; Sent to Europe range 0–3.', cite: ['15.3'] },
      { text: 'Level 3 (track −5 to −6): delayed reinforcements; range 0–5; the Allies lose their Amphibious Shipping Point reinforcement.', cite: ['15.4', '9.31'] },
      { text: 'Level 4 (track −7): delayed reinforcements; range 0–7; no ASP reinforcement; the Allies draw one card fewer; the US Political Will marker moves one box left in the National Status segment.', cite: ['15.5', '11.52', '16.48'], links: ['us-political-will'] },
    ],
  },
  {
    key: 'rules',
    title: 'Limits and die rolls',
    statements: [
      { text: 'The level can never increase beyond +3 or decrease beyond −7. Actions that would exceed these limits are ignored and do not accumulate.', cite: ['15.7'] },
      { text: 'Die rolls below zero count as zero; die rolls above nine count as a modified nine.', cite: ['15.6'] },
      { text: 'US Inter-Service Rivalry subtracts 1 from every diverted-to-Europe die roll.', cite: ['14.1'], links: ['national-us'] },
      { text: 'Delayed reinforcements and the Sent to Europe roll are explained in the Reinforcement segment.', cite: ['9.21', '9.24'], links: ['reinforcements'] },
    ],
  },
];
