export interface PageDef {
  id: string;
  title: string;
  /** False for pages not written yet: the home list shows them as "coming soon". */
  ready: boolean;
  /** Rulebook section to open for a page that is not ready. */
  sectionId?: string;
}

const USPW: PageDef = { id: 'us-political-will', title: 'US Political Will', ready: true, sectionId: '16.4' };

/** The Sequence of Play, in order. */
export const SEQUENCE: PageDef[] = [
  { id: 'reinforcements', title: 'Reinforcement Segment', ready: true, sectionId: '10.0' },
  { id: 'replacements', title: 'Replacement Segment', ready: true, sectionId: '11.0' },
  { id: 'strategic-warfare', title: 'Strategic Warfare Segment', ready: true, sectionId: '12.0' },
  { id: 'strategy-cards', title: 'Strategy Cards', ready: true, sectionId: '4.14' },
  { id: 'initiative', title: 'Initiative Segment', ready: true, sectionId: '4.21' },
  { id: 'offensives', title: 'Offensives Segment', ready: true, sectionId: '7.0' },
  { id: 'national-status', title: 'National Status Segment', ready: true, sectionId: '13.0' },
  { ...USPW, title: 'US Political Will Segment' },
  { id: 'attrition', title: 'Attrition Phase', ready: true, sectionId: '4.4' },
  { id: 'end-of-turn', title: 'End of Turn Phase', ready: true, sectionId: '4.5' },
];

/** Topics that bundle rules from across the rulebook. */
export const TOPICS: PageDef[] = [
  USPW,
  { id: 'supply', title: 'Supply and HQ range', ready: true, sectionId: '6.0' },
  { id: 'war-in-europe', title: 'War in Europe', ready: true, sectionId: '15.0' },
  { id: 'movement', title: 'Movement and stacking', ready: true, sectionId: '8.0' },
  { id: 'battle', title: 'Battle resolution', ready: true, sectionId: '9.0' },
  { id: 'national-china', title: 'National restrictions: China', ready: true, sectionId: '13.7' },
  { id: 'national-india', title: 'National restrictions: India', ready: true, sectionId: '13.6' },
  { id: 'national-us', title: 'National restrictions: US (Inter-Service Rivalry)', ready: true, sectionId: '14.1' },
];

export const PAGES: Record<string, PageDef> = Object.fromEntries([...SEQUENCE, ...TOPICS].map((p) => [p.id, p]));

export const pageDef = (id: string): PageDef | undefined => PAGES[id];
export const pageTitle = (id: string): string => PAGES[id]?.title ?? id;
