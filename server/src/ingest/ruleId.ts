function idKey(id: string): [number, string] {
  const [major, minor = ''] = id.split('.');
  return [Number(major), minor];
}

/** True when rule `a` belongs before rule `b` (major numerically, then minor as text, so 4.1 < 4.11 < 4.2). */
export function ruleIdBefore(a: string, b: string): boolean {
  const [am, an] = idKey(a);
  const [bm, bn] = idKey(b);
  return am < bm || (am === bm && an < bn);
}

/** Number of ids that appear earlier than the id before them. */
export function countOutOfOrder(ids: string[]): number {
  let n = 0;
  for (let i = 1; i < ids.length; i++) if (ruleIdBefore(ids[i], ids[i - 1])) n++;
  return n;
}
