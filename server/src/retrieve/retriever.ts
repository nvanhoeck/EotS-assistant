import type { Chunk } from '../types.js';
import { Bm25, tokenize } from './bm25.js';
import { rrf, topCosine } from './fusion.js';
import { intentMajors, majorOf } from './intent.js';
import type { Embedder } from './embedder.js';

export interface RetrieverConfig {
  topK: number;
  budgetChars: number; // ~4 chars per token: 12000 chars ≈ 3k tokens
  minBm25: number; // below this AND below minCosine => low confidence
  minCosine: number;
  intentBoost: number;
}

export const DEFAULT_RETRIEVER_CONFIG: RetrieverConfig = {
  topK: 6,
  budgetChars: 12000,
  minBm25: 3.0,
  minCosine: 0.55,
  intentBoost: 1.25,
};

export interface Retrieved {
  chunks: Chunk[];
  lowConfidence: boolean;
  mode: 'hybrid' | 'bm25';
}

export interface RetrieverLike {
  retrieve(question: string, facts?: string[]): Promise<Retrieved>;
}

/** Text used for BM25 and embeddings: heading context + label + body. */
export function searchText(c: Chunk): string {
  return [...c.headingPath, c.label].join(' > ') + '\n' + c.text;
}

export class Retriever implements RetrieverLike {
  private bm25: Bm25;
  private bySection = new Map<string, Chunk[]>();
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
    for (const c of chunks) {
      const list = this.bySection.get(c.sectionId) ?? [];
      list.push(c);
      this.bySection.set(c.sectionId, list);
    }
  }

  async retrieve(question: string, facts: string[] = []): Promise<Retrieved> {
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

    return { chunks: this.expand(ranked), lowConfidence, mode };
  }

  private expand(top: Chunk[]): Chunk[] {
    const out: Chunk[] = [];
    const seen = new Set<string>();
    let used = 0;
    const add = (c: Chunk | undefined, force = false) => {
      if (!c || seen.has(c.id)) return;
      if (!force && used + c.text.length > this.cfg.budgetChars) return;
      seen.add(c.id);
      out.push(c);
      used += c.text.length;
    };
    top.forEach((c, i) => add(c, i === 0));
    for (const c of top) for (const sib of this.bySection.get(c.sectionId) ?? []) add(sib);
    for (const c of top) for (const ref of c.crossRefs) add(this.bySection.get(ref)?.[0]);
    return out;
  }
}
