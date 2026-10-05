import type { Section } from '../types';
import { ATTRITION_SECTIONS } from './attrition';
import { END_OF_TURN_SECTIONS } from './endOfTurn';
import { INITIATIVE_SECTIONS } from './initiative';
import { POLITICAL_WILL_SECTIONS } from './politicalWill';
import { REINFORCEMENT_SECTIONS } from './reinforcements';
import { REPLACEMENT_SECTIONS } from './replacements';
import { SUPPLY_SECTIONS } from './supply';
import { STRATEGIC_WARFARE_SECTIONS } from './strategicWarfare';
import { STRATEGY_CARD_SECTIONS } from './strategyCards';

export const PAGE_SECTIONS: Record<string, Section[]> = {
  reinforcements: REINFORCEMENT_SECTIONS,
  replacements: REPLACEMENT_SECTIONS,
  initiative: INITIATIVE_SECTIONS,
  attrition: ATTRITION_SECTIONS,
  'end-of-turn': END_OF_TURN_SECTIONS,
  supply: SUPPLY_SECTIONS,
  'strategy-cards': STRATEGY_CARD_SECTIONS,
  'strategic-warfare': STRATEGIC_WARFARE_SECTIONS,
  'us-political-will': POLITICAL_WILL_SECTIONS,
};

/** Reminder anchors that are not accordion sections of their own. */
const EXTRA_KEYS: Record<string, string[]> = { reinforcements: ['end'] };

export function sectionKeys(pageId: string): string[] {
  return [...(PAGE_SECTIONS[pageId] ?? []).map((s) => s.key), ...(EXTRA_KEYS[pageId] ?? [])];
}

export function pickSections(pageId: string, keys: string[]): Section[] {
  const all = PAGE_SECTIONS[pageId] ?? [];
  return keys.map((k) => {
    const s = all.find((x) => x.key === k);
    if (!s) throw new Error(`No section ${pageId}#${k}`);
    return s;
  });
}
