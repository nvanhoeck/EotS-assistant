import type { SectionRef } from './types';

/** Reader history, oldest first. Empty means the search list is showing. */
export type Trail = SectionRef[];

export function openSection(trail: Trail, ref: SectionRef): Trail {
  return trail[trail.length - 1]?.sectionId === ref.sectionId ? trail : [...trail, ref];
}

/** Previous/Next move within the document, so they replace the current entry instead of stacking. */
export function stepSection(trail: Trail, ref: SectionRef): Trail {
  if (trail.length === 0) return [ref];
  if (trail.length >= 2 && trail[trail.length - 2].sectionId === ref.sectionId) return trail.slice(0, -1);
  return [...trail.slice(0, -1), ref];
}

export function backFrom(trail: Trail): Trail {
  return trail.slice(0, -1);
}

export function backLabel(trail: Trail): string {
  return trail.length >= 2 ? `Back to ${trail[trail.length - 2].label}` : 'Back to results';
}
