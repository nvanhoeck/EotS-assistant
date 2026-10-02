import type { Chunk } from '../types.js';
import { extractPages } from './extract.js';
import { parseRules } from './parse.js';
import { buildChunks } from './chunk.js';
import { stripNoise, type NoiseStats } from './noise.js';
import type { RuleBlock } from '../types.js';
import { ruleIdBefore } from './ruleId.js';

export interface IngestReport {
  pages: number;
  blocks: number;
  chunks: number;
  pagesWithoutRules: number[];
  outOfOrderIds: string[];
  duplicateIds: string[];
  longestChunkChars: number;
  removed: NoiseStats;
}

export function buildFromPages(pages: string[]): { chunks: Chunk[]; report: IngestReport } {
  const stripped = stripNoise(pages);
  const parsed = parseRules(stripped.pages);
  const errataBlocks: RuleBlock[] = stripped.errata.map((e) => ({
    id: 'ERRATA',
    heading: true,
    title: 'Errata and printing notes',
    page: e.page,
    pageEnd: e.page,
    text: 'ERRATA Errata and printing notes ' + e.text,
  }));
  const blocks = [...parsed, ...errataBlocks];
  const chunks = buildChunks(blocks);

  const pagesWithRules = new Set<number>();
  for (const b of blocks) for (let p = b.page; p <= b.pageEnd; p++) pagesWithRules.add(p);
  const pagesWithoutRules: number[] = [];
  for (let p = 2; p <= pages.length; p++) if (!pagesWithRules.has(p)) pagesWithoutRules.push(p);

  const outOfOrderIds: string[] = [];
  for (let i = 1; i < parsed.length; i++) {
    if (ruleIdBefore(parsed[i].id, parsed[i - 1].id)) outOfOrderIds.push(parsed[i].id);
  }

  const counts = new Map<string, number>();
  for (const b of blocks) counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
  const duplicateIds = [...counts].filter(([, n]) => n > 1).map(([id]) => id);

  return {
    chunks,
    report: {
      pages: pages.length,
      blocks: blocks.length,
      chunks: chunks.length,
      pagesWithoutRules,
      outOfOrderIds,
      duplicateIds,
      longestChunkChars: chunks.reduce((m, c) => Math.max(m, c.text.length), 0),
      removed: stripped.stats,
    },
  };
}

export function ingestPdf(pdfPath: string) {
  return buildFromPages(extractPages(pdfPath));
}

/** Rule ids present in the previous ingest but missing from the new one (a re-ingest must not lose rules silently). */
export function droppedIds(before: { sectionId: string }[], after: { sectionId: string }[]): string[] {
  const now = new Set(after.map((c) => c.sectionId));
  return [...new Set(before.map((c) => c.sectionId))].filter((id) => !now.has(id));
}
