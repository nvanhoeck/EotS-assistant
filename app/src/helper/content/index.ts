import type { Section } from '../types';
import { POLITICAL_WILL_SECTIONS } from './politicalWill';
import { REINFORCEMENT_SECTIONS } from './reinforcements';
import { STRATEGIC_WARFARE_SECTIONS } from './strategicWarfare';

export const PAGE_SECTIONS: Record<string, Section[]> = {
  reinforcements: REINFORCEMENT_SECTIONS,
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
