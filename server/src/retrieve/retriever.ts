import type { Chunk } from '../types.js';
import { Bm25, tokenize } from './bm25.js';
import { rrf, topCosine } from './fusion.js';
import { intentMajors, majorOf } from './intent.js';
import type { Embedder } from './embedder.js';
import { parentId, summarize } from '../ingest/chunk.js';

export interface RetrieverConfig {
  topK: number;
  budgetChars: number; // ~4 chars per token: 12000 chars ≈ 3k tokens
  minBm25: number; // below this AND below minCosine => low confidence
  minCosine: number;
  intentBoost: number;
  subtreeShare: number; // max share of budgetChars one heading may spend on its sub-rules
  outlineChars: number; // max size of one heading's outline
  maxOutlines: number; // headings that get an outline per question
}

export const DEFAULT_RETRIEVER_CONFIG: RetrieverConfig = {
  topK: 6,
  budgetChars: 12000,
  minBm25: 3.0,
  minCosine: 0.55,
  intentBoost: 1.25,
  subtreeShare: 0.6,
  outlineChars: 3000,
  maxOutlines: 2,
};

/** A lower-ranked hit with at most this much text is treated as a bare heading and gets its sub-rules too. */
const HEADING_CHARS = 400;
/** A parent with body text still gets an outline when it ranks within this many hits. */
const OUTLINE_RANKS = 3;

export interface Retrieved {
  chunks: Chunk[];
  lowConfidence: boolean;
  mode: 'hybrid' | 'bm25';
  /** One line per block under the headings that were expanded ("" when none). Optional for test doubles. */
  outline?: string;
}

export interface RetrieverLike {
  retrieve(question: string, facts?: string[]): Promise<Retrieved>;
}

/** Rule order: major numeric, then minor/sub as strings, so 4.1 < 4.11 < 4.12 < 4.2 (children sit under their parent). */
export function ruleOrder(a: string, b: string): number {
  const [am, ...ar] = a.split('.');
  const [bm, ...br] = b.split('.');
  if (am !== bm) return Number(am) - Number(bm) || am.localeCompare(bm);
  for (let i = 0; i < Math.max(ar.length, br.length); i++) {
    const x = ar[i] ?? '';
    const y = br[i] ?? '';
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/** Text used for BM25 and embeddings: heading context + label + body. */
export function searchText(c: Chunk): string {
  return [...c.headingPath, c.label].join(' > ') + '\n' + c.text;
}

export class Retriever implements RetrieverLike {
  private bm25: Bm25;
  private bySection = new Map<string, Chunk[]>();
  private descendants = new Map<string, Chunk[]>(); // sectionId -> all chunks below it, in rule order
  private order = new Map<Chunk, number>();
  private cfg: RetrieverConfig;

  constructor(
    private chunks: Chunk[],
    private embedder?: Embedder,
    private vectors?: number[][],
    cfg: Partial<RetrieverConfig> = {},
  ) {
    if (vectors && vectors.length !== chunks.length) {
      throw new Error('Embedding vectors are not aligned with chunks');
    }
    this.cfg = { ...DEFAULT_RETRIEVER_CONFIG, ...cfg };
    this.bm25 = new Bm25(chunks.map((c) => tokenize(searchText(c))));
    chunks.forEach((c, i) => {
      this.order.set(c, i);
      const list = this.bySection.get(c.sectionId) ?? [];
      list.push(c);
      this.bySection.set(c.sectionId, list);
      for (let p = parentId(c.sectionId); p; p = parentId(p)) {
        const below = this.descendants.get(p) ?? [];
        below.push(c);
        this.descendants.set(p, below);
      }
    });
    // PDF extraction order is not always rule order (see the ingest report), so sort once here.
    for (const list of this.descendants.values()) {
      list.sort((a, b) => ruleOrder(a.sectionId, b.sectionId) || this.order.get(a)! - this.order.get(b)!);
    }
  }

  async retrieve(question: string, facts: string[] = []): Promise<Retrieved & { outline: string }> {
    const query = [question, ...facts].join(' ');
    const bm = this.bm25.search(tokenize(query), 20);

    let vec: { index: number; score: number }[] = [];
    let mode: Retrieved['mode'] = 'bm25';
    if (this.embedder && this.vectors) {
      try {
        const [qv] = await this.embedder.embed(['search_query: ' + query]);
        vec = topCosine(qv, this.vectors, 20);
        mode = 'hybrid';
      } catch {
        // fall back to BM25 only
      }
    }

    const fused = rrf([bm.map((r) => r.index), vec.map((r) => r.index)]);
    const majors = intentMajors(question);
    const ranked = [...fused.entries()]
      .map(([i, s]) => [i, majors.has(majorOf(this.chunks[i].sectionId)) ? s * this.cfg.intentBoost : s] as const)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.cfg.topK)
      .map(([i]) => this.chunks[i]);

    const lowConfidence =
      (bm[0]?.score ?? 0) < this.cfg.minBm25 && (vec[0]?.score ?? 0) < this.cfg.minCosine;

    return { ...this.expand(ranked), lowConfidence, mode };
  }

  private expand(top: Chunk[]): { chunks: Chunk[]; outline: string } {
    const out: Chunk[] = [];
    const seen = new Set<string>();
    const roots: Chunk[] = [];
    const outlineOnly = new Set<Chunk>(); // parents with body text of their own: direct children only
    let used = 0;
    const add = (c: Chunk | undefined, force = false) => {
      if (!c || seen.has(c.id)) return;
      if (!force && used + c.text.length > this.cfg.budgetChars) return;
      seen.add(c.id);
      out.push(c);
      used += c.text.length;
    };
    const covered = (c: Chunk) => {
      for (let p = parentId(c.sectionId); p; p = parentId(p)) if (roots.some((r) => r.sectionId === p)) return true;
      return false;
    };

    // Rank order: a hit's sub-rules are added right after it so they win over lower-ranked hits.
    top.forEach((c, i) => {
      add(c, i === 0);
      const below = this.descendants.get(c.sectionId);
      if (!below?.length || c.part !== 0 || covered(c) || roots.length >= this.cfg.maxOutlines) return;
      const bare = i === 0 || c.text.length <= HEADING_CHARS;
      if (!bare && i >= OUTLINE_RANKS) return;
      roots.push(c);
      // A parent with real body text of its own only gets a one-level outline; its sub-rule text is not pulled in.
      if (bare) this.addSubtree(below, add, seen, () => used);
      else outlineOnly.add(c);
    });
    for (const c of top) for (const sib of this.bySection.get(c.sectionId) ?? []) add(sib);
    for (const c of top) for (const ref of c.crossRefs) add(this.bySection.get(ref)?.[0]);

    const outline = roots.map((r) => this.outline(r, seen, outlineOnly.has(r))).join('\n\n');
    return { chunks: out, outline };
  }

  /** First part of every sub-rule (so each block is represented), then continuation parts, capped per heading. */
  private addSubtree(below: Chunk[], add: (c: Chunk, force?: boolean) => void, seen: Set<string>, used: () => number): void {
    const cap = this.cfg.budgetChars * this.cfg.subtreeShare;
    const chosen: Chunk[] = [];
    let spent = 0;
    for (const firstParts of [true, false]) {
      for (const d of below) {
        if ((d.part === 0) !== firstParts || seen.has(d.id) || chosen.includes(d)) continue;
        if (spent + d.text.length > cap || used() + spent + d.text.length > this.cfg.budgetChars) continue;
        chosen.push(d);
        spent += d.text.length;
      }
    }
    chosen.sort((a, b) => below.indexOf(a) - below.indexOf(b)).forEach((d) => add(d, true));
  }

  private depthBelow(c: Chunk, root: Chunk): number {
    let n = 1;
    for (let p = parentId(c.sectionId); p && p !== root.sectionId; p = parentId(p)) if (this.bySection.has(p)) n++;
    return n;
  }

  private outlineLine(c: Chunk, depth: number, seen: Set<string>): string {
    const summary = c.summary ?? summarize(c);
    const heading = c.text.split('\n')[0].trim() === c.label;
    const head = !summary ? c.label : heading ? `${c.label} — ${summary}` : `${c.sectionId} — ${summary}`;
    const tail = summary && !seen.has(c.id) ? ' (outline only)' : '';
    return '  '.repeat(depth) + head + tail;
  }

  private outline(root: Chunk, seen: Set<string>, shallow: boolean): string {
    const entries = (this.descendants.get(root.sectionId) ?? [])
      .filter((d) => d.part === 0)
      .map((d) => ({ d, depth: this.depthBelow(d, root) }));
    const render = (maxDepth: number) => [
      this.outlineLine(root, 0, seen),
      ...entries.filter((e) => e.depth <= maxDepth).map((e) => this.outlineLine(e.d, e.depth, seen)),
    ];
    const deepest = shallow ? 1 : entries.reduce((m, e) => Math.max(m, e.depth), 1);
    let lines = render(deepest);
    for (let depth = deepest; lines.join('\n').length > this.cfg.outlineChars && depth > 1; ) lines = render(--depth);
    let text = lines.join('\n');
    while (text.length > this.cfg.outlineChars && lines.length > 2) text = (lines = lines.slice(0, -1)).join('\n');
    return text;
  }
}
