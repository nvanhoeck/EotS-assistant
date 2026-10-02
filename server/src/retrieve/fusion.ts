export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

export function topCosine(q: number[], vectors: number[][], k: number) {
  return vectors
    .map((v, index) => ({ index, score: cosine(q, v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/** Reciprocal rank fusion over ranked index lists. */
export function rrf(rankings: number[][], k = 60): Map<number, number> {
  const out = new Map<number, number>();
  for (const ranking of rankings) {
    ranking.forEach((idx, rank) => out.set(idx, (out.get(idx) ?? 0) + 1 / (k + rank + 1)));
  }
  return out;
}
