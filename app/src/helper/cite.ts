import { RULE_PAGES } from './rulePages';

/** "9.12 · p. 22" (or "pp. 22–23"); just the id when the section is unknown. */
export function citeLabel(id: string): string {
  const p = RULE_PAGES[id];
  if (!p) return id;
  return p[0] === p[1] ? `${id} · p. ${p[0]}` : `${id} · pp. ${p[0]}–${p[1]}`;
}
