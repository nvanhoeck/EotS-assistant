import type { Chunk, Citation } from '../types.js';

export interface RawCitation {
  sectionId: string;
  quote: string;
}

export function toCitation(c: Chunk, verified: boolean, quote = ''): Citation {
  return {
    sectionId: c.sectionId,
    label: c.label,
    headingPath: c.headingPath,
    pageStart: c.pageStart,
    pageEnd: c.pageEnd,
    quote,
    verified,
    text: c.text,
  };
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’“”"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The harness, not the model, guarantees citations: section must be retrieved, quote must appear verbatim. */
export function validateCitations(raw: RawCitation[], chunks: Chunk[]): { citations: Citation[]; unverified: number } {
  const out: Citation[] = [];
  const seen = new Set<string>();
  let unverified = 0;

  for (const rc of raw ?? []) {
    const candidates = chunks.filter((c) => c.sectionId === rc.sectionId);
    if (candidates.length === 0) {
      unverified++;
      continue;
    }
    const q = norm(rc.quote ?? '');
    const hit = q.length >= 8 ? candidates.find((c) => norm(c.text).includes(q)) : undefined;
    const chosen = hit ?? candidates[0];
    const key = `${chosen.id}|${hit ? q : ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toCitation(chosen, !!hit, hit ? rc.quote.trim() : ''));
    if (!hit) unverified++;
  }
  return { citations: out, unverified };
}
