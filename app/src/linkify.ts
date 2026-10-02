export interface Segment {
  text: string;
  ref?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits text into plain and tappable parts. Only ids in `refs` become links, and only as whole rule numbers:
 * not inside a bigger number (14.11), not followed by more digits or a further ".x" (4.11.5, 4.110).
 */
export function splitReferences(text: string, refs: string[]): Segment[] {
  if (text === '') return [];
  const ids = [...new Set(refs)].sort((a, b) => b.length - a.length);
  if (ids.length === 0) return [{ text }];
  // Group 1 is the character before the id (no lookbehind, for older Hermes engines).
  const re = new RegExp(`(^|[^\\w.])(${ids.map(escape).join('|')})(?!\\w|\\.\\w)`, 'g');
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index! + m[1].length;
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ text: m[2], ref: m[2] });
    last = start + m[2].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
