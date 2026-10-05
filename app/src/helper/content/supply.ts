import type { Section } from '../types';

export const SUPPLY_SECTIONS: Section[] = [
  {
    key: 'why',
    title: 'When supply matters',
    statements: [
      { text: 'Supply status (supplied or unsupplied) must be determined to activate a unit, to decide whether an air or carrier unit exerts a ZOI, for attrition, and when placing reinforcements and replacements. Out-of-supply units keep their combat strength.', cite: ['6.0', '6.4'], links: ['reinforcements', 'replacements', 'attrition'] },
      { text: 'Supply status is evaluated continuously, so units fall in and out of supply as units move and supply lines change.', cite: ['6.0'] },
    ],
  },
  {
    key: 'lines',
    title: 'Supply lines',
    statements: [
      { text: 'Both HQs and units must trace supply lines to be in supply. An HQ must always be located in a port hex.', cite: ['6.21', '6.0'] },
      { text: 'An HQ is in supply if an unblocked supply line of any length can be traced from an appropriate ultimate supply source to the port its HQ sits in. This path can use multiple ports to enter, continue across land hexsides and exit by port, without overland or port-count restrictions.', cite: ['6.21', '6.22'] },
      { text: 'A unit is supplied if an unblocked hex path can be traced from a supplied, appropriate activating HQ to the unit, and the path is no longer than the HQ’s range.', cite: ['6.21', '6.12'] },
      { text: 'A supply line can be traced across any hexside except: an unplayable hexside; a water hexside of an un-neutralized enemy ZOI hex; any land hexside of a non-port coastal hex that the path entered across a sea hexside; any all-sea hexside of a non-port coastal hex that the path entered across a land hexside.', cite: ['6.21'] },
      { text: 'Also blocked: a land hexside of any hex occupied solely by an enemy ground, HQ or air unit; any sea hexside of an enemy-controlled port hex that the path entered across a land hexside; and any land hexside of an enemy-controlled port hex that the path entered across a sea hexside.', cite: ['6.21'] },
      { text: 'Port limitation: a unit’s supply line may include no more than one supply-eligible port where the line switches between sea and land (or back), not counting the port in the HQ’s hex or a port the unit occupies. A friendly HQ, supplied or not, that can trace a legal overland path of up to 4 movement points, or a sea path of any length, to a friendly-controlled port makes that port supply-eligible.', cite: ['6.21'] },
      { text: 'Overland logistical range: if the last hexside crossed is a land hexside, the unit’s hex must also be within 4 movement points of ground movement of the supplying HQ or of Kunming (if it is an active supply source). If the last hexside was crossed by sea this limit does not apply. For this check a strategic transport route costs 1/2 MP where both hexes are unoccupied or friendly-occupied, and a hex with a No Transport Route marker is treated as having no transport route.', cite: ['6.21', '8.42', '13.75', '13.77'] },
      { text: 'During an Offensive, any activated unit remains supplied until the end of that Offensive.', cite: ['6.21', '6.4'] },
      { text: 'If Japanese and Allied air ZOI would each cut the other’s supply, only the Allied air units are considered to exert a ZOI for supply determination.', cite: ['6.21'] },
    ],
  },
  {
    key: 'sources',
    title: 'Ultimate supply sources',
    statements: [
      { text: 'Every hex on the East, South and West map edges is an Allied ultimate supply source.', cite: ['6.22'] },
      { text: 'Every Japanese-controlled city hex in the Japanese Home Islands is a Japanese ultimate supply source.', cite: ['6.22'] },
      { text: 'Ultimate supply source paths decide the supply status of HQs.', cite: ['6.22'] },
      { text: 'A US or Joint HQ that is in supply but cannot trace a supply line to the East map edge source has its efficiency rating reduced by 1 (zero is possible).', cite: ['6.25'] },
    ],
  },
  {
    key: 'emergency',
    title: 'Emergency supply routes',
    statements: [
      { text: 'The Hump: playing the China Airlift card (Allied #17) creates a supply line between Kunming and any Allied-controlled, supply-eligible Northern India airfield (Jarhat and Dacca). It lasts as long as the Allies control such an airfield and need not be traced as in 6.21.', cite: ['6.23'] },
      { text: 'Kunming is a supply source if the Burma Road is open or the Hump is active (with a supply-eligible Northern India airfield). Any Allied unit that can trace an overland-only supply path of 4 or fewer MP directly from Kunming is in supply, an exception to the usual need for an HQ.', cite: ['13.75'] },
      { text: 'Tokyo Express: playing the Big Tokyo Express Operation (Japanese #28) or the Tokyo Express (Japanese #44) card lets Japan place the Tokyo Express marker. It makes a temporary supply line between one in-supply Japanese HQ and one hex within that HQ’s range, for the rest of the turn.', cite: ['6.23'] },
      { text: 'Air, ground and naval units (not HQs) in the Tokyo Express hex are in supply for all game purposes, including re-establishing a ZOI, and nothing can sever it. The marker stays until the hex becomes Allied controlled, another Japanese card moves it, or the game turn ends. Only one marker can be in play. It does not change the prerequisites for activating units.', cite: ['6.23'] },
      { text: 'Units in a hex affected by an emergency supply route (China Airlift, Tokyo Express) are not attrited.', cite: ['6.24'], links: ['attrition'] },
    ],
  },
  {
    key: 'hq-range',
    title: 'HQs: range, efficiency, nationality',
    statements: [
      { text: 'An HQ has a Command Range and an Efficiency Rating. The range decides where it can supply units, trace activation, where reinforcements and replacements can be placed, whether it can react to an offensive, and whether out-of-supply units can sustain themselves. Efficiency, with an OC or Logistics value, decides how many units it can activate.', cite: ['6.11', '7.21'] },
      { text: 'Efficiency is modified in two cases: a US or Joint HQ with no supply line to the East map edge gets -1 (minimum 0); a Japanese HQ activating units in Burma, Ceylon or Northern India while the Bridge over the River Kwai has not been built and Japan does not control Rangoon gets -1. The Bridge event can add +1 to a Japanese HQ.', cite: ['6.11', '6.25', '13.79'] },
      { text: 'There may never be more than one HQ (of either side) in a hex. HQs do not count toward stacking limits and must always be in a port hex.', cite: ['6.0'] },
      { text: 'To be activated a unit needs an activation path from the HQ used for the offensive or reaction, and must be in supply (possibly from Kunming or from a different HQ than the one activating). Only a single HQ per side can activate units in one offensive.', cite: ['6.3'] },
      { text: 'US HQs can activate US units (Army and Navy) and Chinese units.', cite: ['7.21', '6.12'] },
      { text: 'Commonwealth HQs can activate Commonwealth units, Chinese units, and US air units (Army and Marine).', cite: ['7.21', '6.12'] },
      { text: 'Joint HQs can activate any Allied unit. Only Joint HQs can activate Dutch units.', cite: ['7.21', '6.12'] },
      { text: 'Japanese HQs can activate any Japanese unit.', cite: ['7.21', '6.12'] },
    ],
  },
  {
    key: 'paths',
    title: 'Kinds of path',
    statements: [
      { text: 'Supply path (6.21): the most restrictive. It cannot cross unplayable hexsides, a sea component may pass through only one supply-eligible port, and the HQ’s range is the maximum length.', cite: ['6.21', '6.0'] },
      { text: 'Activation path (6.3): can cross unplayable hexsides and can switch from land to sea without friendly ports. Blocked only by a water hexside of an un-neutralized enemy ZOI hex and a land hexside of a hex occupied solely by an enemy ground or air unit. Its length may not exceed the HQ’s Command Range.', cite: ['6.3'] },
      { text: 'Intelligence/reaction path (7.26): the reacting HQ must be in supply and have at least one declared battle hex within its range; this range cannot be blocked by any means. Intelligence and reaction use direct hex distance regardless of terrain or ZOI.', cite: ['7.26', '6.0'] },
      { text: 'Attrition path (6.24): the range from a friendly HQ (supplied or not) to the unit cannot be blocked by enemy units, an opposing ZOI or unplayable hexsides.', cite: ['6.24'] },
    ],
  },
];
