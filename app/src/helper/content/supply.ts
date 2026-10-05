import type { Section } from '../types';

export const SUPPLY_SECTIONS: Section[] = [
  {
    key: 'why',
    title: 'When supply matters',
    statements: [
      { text: 'Supply status (supplied, unsupplied or supply-eligible) must be determined to activate a unit, to decide whether an air unit exerts a ZOI, for attrition, and when placing reinforcements and replacements.', cite: ['13.0'], links: ['reinforcements', 'replacements', 'attrition'] },
    ],
  },
  {
    key: 'lines',
    title: 'Supply lines',
    statements: [
      { text: 'An HQ or unit must be linked by a supply line to a supply source to be supplied (supply-eligible).', cite: ['13.1'] },
      { text: 'An HQ is in supply if an unblocked hex path of any length can be traced from the HQ to an appropriate ultimate supply source.', cite: ['13.1', '13.2'] },
      { text: 'A unit is supplied if an unblocked hex path can be traced from a supplied, appropriate activating HQ to the unit, and the path is no longer than the HQ’s range.', cite: ['13.1', '7.53'] },
      { text: 'A supply line can be traced across any hexside except: an unplayable hexside; a water hexside of an un-neutralized enemy ZOI hex; an all-land hexside of a non-port coastal hex that the path entered across a sea hexside.', cite: ['13.1'] },
      { text: 'Also blocked: any land hexside of an enemy-controlled port hex that the path entered across a sea hexside; any sea hexside of an enemy-controlled port hex that the path entered across a land hexside; and a land hexside of any hex occupied solely by an enemy ground or air unit.', cite: ['13.1'] },
      { text: 'During an Offensive, any activated unit remains supplied until the end of that Offensive.', cite: ['13.1'] },
      { text: 'If Japanese and Allied air ZOI would each cut the other’s supply, only the Allied air units are considered to exert a ZOI for supply determination.', cite: ['13.1'] },
    ],
  },
  {
    key: 'sources',
    title: 'Ultimate supply sources',
    statements: [
      { text: 'Every hex on the east, south and west map edges is an Allied ultimate supply source.', cite: ['13.2'] },
      { text: 'Every Japanese-controlled city hex in the Japanese Home Islands is a Japanese ultimate supply source.', cite: ['13.2'] },
      { text: 'Ultimate supply source paths decide the supply status of HQs and the supply eligibility of ports and airfields.', cite: ['13.2'] },
    ],
  },
  {
    key: 'emergency',
    title: 'Emergency supply routes',
    statements: [
      { text: 'The Hump: playing the China Airlift card (Allied #17) creates a supply line between Kunming and any Allied-controlled, supply-eligible Northern India airfield.', cite: ['13.31'] },
      { text: 'Kunming is a supply source if the Burma Road is open or the Hump is active (with a supply-eligible Northern India airfield). Any Allied unit that can trace an overland supply path directly to Kunming is in supply, an exception to the usual need for an HQ.', cite: ['12.75'] },
      { text: 'Tokyo Express: playing the Big Tokyo Express Operation (Japanese #28) or the Tokyo Express (Japanese #44) card lets Japan place the Tokyo Express marker. It makes a temporary supply line between one Japanese HQ and one hex within that HQ’s range, for the duration of the Offensive.', cite: ['13.31'] },
      { text: 'Units in the Tokyo Express hex are automatically supplied and nothing can sever it. The marker stays until the hex becomes Allied controlled, another Japanese card moves it, or the game turn ends. Only one marker can be in play.', cite: ['13.31'] },
      { text: 'Emergency supply routes (China Airlift, Tokyo Express) prevent attrition in the affected hex.', cite: ['13.4'], links: ['attrition'] },
    ],
  },
  {
    key: 'hq-range',
    title: 'HQs: range, efficiency, nationality',
    statements: [
      { text: 'An HQ has a Command Range and an Efficiency rating. The range decides where it can trace activation, where reinforcements and replacements can be placed, and which units are in supply or can sustain themselves out of supply. Efficiency, with an OC or Logistics value, decides how many units it can activate.', cite: ['7.51'] },
      { text: 'There may never be more than one HQ (of either side) in a hex. HQs do not count toward stacking limits.', cite: ['7.51'] },
      { text: 'To be activated a unit needs both to be within activation range of an in-supply HQ and to have a supply line from the same or another HQ.', cite: ['7.52'] },
      { text: 'US HQs can activate US units (blue or green) and Chinese units.', cite: ['6.21'] },
      { text: 'Commonwealth HQs can activate Commonwealth units, Chinese units, and US air units.', cite: ['6.21'] },
      { text: 'Joint HQs can activate any Allied unit. Only Joint HQs can activate Dutch units. (The printed Allied HQ National Command Chart shows a “Yes” for Commonwealth HQs and Dutch units that disagrees with this text: follow the written rule, and check the chart.)', cite: ['6.21', '7.53'] },
      { text: 'Japanese HQs can activate any Japanese unit.', cite: ['6.21', '7.53'] },
    ],
  },
  {
    key: 'paths',
    title: 'Four kinds of path',
    statements: [
      { text: 'Supply path (13.1): the most restrictive. It needs friendly ports for sea crossings and cannot cross unplayable hexsides.', cite: ['13.1', '7.52'] },
      { text: 'Activation range (7.52): can cross unplayable hexsides and land hexes “as the crow flies” without friendly ports. Blocked only by a water hexside of an un-neutralized enemy ZOI hex and a land hexside of a hex occupied solely by an enemy ground or air unit.', cite: ['7.52'] },
      { text: 'Intelligence/reaction path (6.26): the reacting HQ must be in supply and at least one declared battle hex within its range; this range cannot be blocked by any means.', cite: ['6.26'] },
      { text: 'Attrition path (13.4): the range from a friendly HQ to the unit cannot be blocked by enemy units or an opposing ZOI.', cite: ['13.4'] },
    ],
  },
];
