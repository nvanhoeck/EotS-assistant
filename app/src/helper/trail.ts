export type HelperEntry =
  | { kind: 'page'; id: string }
  | { kind: 'section'; sectionId: string; label: string };

/** Helper history, oldest first. Empty means the home list is showing. */
export type HelperTrail = HelperEntry[];

function same(a: HelperEntry, b: HelperEntry): boolean {
  return a.kind === 'page' ? b.kind === 'page' && a.id === b.id : b.kind === 'section' && a.sectionId === b.sectionId;
}

export function pushEntry(trail: HelperTrail, entry: HelperEntry): HelperTrail {
  const top = trail[trail.length - 1];
  return top && same(top, entry) ? trail : [...trail, entry];
}

/** Previous/Next in the reader move within the document, so they replace the top entry. */
export function replaceTop(trail: HelperTrail, entry: HelperEntry): HelperTrail {
  if (trail.length === 0) return [entry];
  if (trail.length >= 2 && same(trail[trail.length - 2], entry)) return trail.slice(0, -1);
  return [...trail.slice(0, -1), entry];
}

export function popEntry(trail: HelperTrail): HelperTrail {
  return trail.slice(0, -1);
}

/** The helper page showing underneath, even while a rulebook section is open on top of it. */
export function currentPageId(trail: HelperTrail): string | undefined {
  for (let i = trail.length - 1; i >= 0; i--) {
    const e = trail[i];
    if (e.kind === 'page') return e.id;
  }
  return undefined;
}

export function readingSection(trail: HelperTrail): Extract<HelperEntry, { kind: 'section' }> | undefined {
  const top = trail[trail.length - 1];
  return top?.kind === 'section' ? top : undefined;
}

export function backTextFor(trail: HelperTrail, titleOf: (pageId: string) => string): string {
  const below = trail[trail.length - 2];
  if (!below) return 'Home';
  return below.kind === 'page' ? `Back to ${titleOf(below.id)}` : `Back to ${below.label}`;
}
