const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or',
  'what', 'when', 'how', 'do', 'does', 'did', 'can', 'i', 'my', 'we', 'it', 'its', 'this', 'that',
  'with', 'by', 'as', 'if', 'then', 'there', 'from', 'which', 'who', 'should', 'would', 'will',
]);

export function stem(w: string): string {
  if (/\d/.test(w) || w.length < 4) return w;
  let s = w;
  if (s.endsWith('ies') && s.length > 4) s = s.slice(0, -3) + 'y';
  else if (s.endsWith('ing') && s.length > 5) s = s.slice(0, -3);
  else if (s.endsWith('ed') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('es') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  if (s.endsWith('e') && s.length > 3) s = s.slice(0, -1);
  return s;
}

export function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)*/g) ?? [];
  return raw.filter((t) => !STOPWORDS.has(t)).map(stem);
}

export interface Scored {
  index: number;
  score: number;
}

export class Bm25 {
  private tf: Map<string, number>[];
  private df = new Map<string, number>();
  private len: number[];
  private avgLen: number;

  constructor(
    docs: string[][],
    private k1 = 1.5,
    private b = 0.75,
  ) {
    this.len = docs.map((d) => d.length);
    this.avgLen = this.len.reduce((a, c) => a + c, 0) / Math.max(1, docs.length);
    this.tf = docs.map((d) => {
      const m = new Map<string, number>();
      for (const t of d) m.set(t, (m.get(t) ?? 0) + 1);
      for (const t of m.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return m;
    });
  }

  search(query: string[], k: number): Scored[] {
    const n = this.tf.length;
    const out: Scored[] = [];
    for (let i = 0; i < n; i++) {
      let score = 0;
      for (const t of new Set(query)) {
        const f = this.tf[i].get(t);
        if (!f) continue;
        const df = this.df.get(t)!;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        score += (idf * (f * (this.k1 + 1))) / (f + this.k1 * (1 - this.b + (this.b * this.len[i]) / this.avgLen));
      }
      if (score > 0) out.push({ index: i, score });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, k);
  }
}
