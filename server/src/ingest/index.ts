import type { Chunk } from '../types.js';
import { extractPages } from './extract.js';
import { parseRules } from './parse.js';
import { buildChunks } from './chunk.js';

export interface IngestReport {
  pages: number;
  blocks: number;
  chunks: number;
  pagesWithoutRules: number[];
  outOfOrderIds: string[];
  duplicateIds: string[];
  longestChunkChars: number;
}

function idKey(id: string): [number, string] {
  const [major, minor = ''] = id.split('.');
  return [Number(major), minor];
}

function lessThan(a: string, b: string): boolean {
  const [am, an] = idKey(a);
  const [bm, bn] = idKey(b);
  return am < bm || (am === bm && an < bn);
}

export function buildFromPages(pages: string[]): { chunks: Chunk[]; report: IngestReport } {
  const blocks = parseRules(pages);
  const chunks = buildChunks(blocks);

  const pagesWithRules = new Set<number>();
  for (const b of blocks) for (let p = b.page; p <= b.pageEnd; p++) pagesWithRules.add(p);
  const pagesWithoutRules: number[] = [];
  for (let p = 2; p <= pages.length; p++) if (!pagesWithRules.has(p)) pagesWithoutRules.push(p);

  const outOfOrderIds: string[] = [];
  for (let i = 1; i < blocks.length; i++) {
    if (lessThan(blocks[i].id, blocks[i - 1].id)) outOfOrderIds.push(blocks[i].id);
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
    },
  };
}

export function ingestPdf(pdfPath: string) {
  return buildFromPages(extractPages(pdfPath));
}
