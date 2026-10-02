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
    .normalize('NFKC')
    .replace(/[–—]/g, '-')
    .replace(/­/g, '')
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

  for (const item of Array.isArray(raw) ? raw : []) {
    if (typeof item !== 'object' || item === null) continue;
    const rc = item as { sectionId?: unknown; quote?: unknown };
    if (typeof rc.sectionId !== 'string') continue;
    const quote = typeof rc.quote === 'string' ? rc.quote : '';
    const candidates = chunks.filter((c) => c.sectionId === rc.sectionId);
    if (candidates.length === 0) {
      unverified++;
      continue;
    }
    const q = norm(quote);
    const hit = q.length >= 8 ? candidates.find((c) => norm(c.text).includes(q)) : undefined;
    const chosen = hit ?? candidates[0];
    const key = `${chosen.id}|${hit ? q : ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toCitation(chosen, !!hit, hit ? quote.trim() : ''));
    if (!hit) unverified++;
  }
  return { citations: out, unverified };
}
