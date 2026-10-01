import type { Chunk, RuleBlock } from '../types.js';

export const MAX_CHARS = 1800;
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z(])/;
const CONDITIONAL =
  /\b(if|unless|except|only|may not|cannot|can not|never|must|provided that|however)\b/i;
const REF = /\b(\d{1,2}\.\d{1,3}(?:\.[A-Z0-9]{1,2})?)\b/g;

export function parentId(id: string): string | null {
  const m = /^(\d+)\.(\d+)(?:\.(\w+))?$/.exec(id);
  if (!m) return null;
  const [, major, minor, sub] = m;
  if (sub) return `${major}.${minor}`;
  if (minor === '0') return null;
  if (minor.length === 1) return `${major}.0`;
  return `${major}.${minor.slice(0, -1)}`;
}

export function splitText(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const units = text
    .split(/\n+/)
    .flatMap((line) => (line.length > max ? line.split(SENTENCE_SPLIT) : [line]));
  const pieces: string[] = [];
  let cur = '';
  for (const u of units) {
    if (cur && (cur + ' ' + u).length > max) {
      pieces.push(cur);
      cur = u;
    } else {
      cur = cur ? cur + ' ' + u : u;
    }
  }
  if (cur) pieces.push(cur);
  return pieces;
}

function extractCrossRefs(text: string, selfId: string, known: Set<string>): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(REF)) {
    let id = m[1];
    if (!known.has(id)) {
      const base = id.split('.').slice(0, 2).join('.');
      if (!known.has(base)) continue;
      id = base;
    }
    if (id !== selfId) out.add(id);
  }
  return [...out];
}

function extractConditionals(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => CONDITIONAL.test(s))
    .slice(0, 6);
}

function firstWords(text: string, n: number): string {
  return text.split(/\s+/).slice(0, n).join(' ');
}

export function buildChunks(blocks: RuleBlock[]): Chunk[] {
  const titles = new Map<string, string>();
  for (const b of blocks) if (b.heading && b.title) titles.set(b.id, b.title);
  const known = new Set(blocks.map((b) => b.id));
  const seen = new Map<string, number>();
  const chunks: Chunk[] = [];

  for (const b of blocks) {
    const path: string[] = [];
    for (let p = parentId(b.id); p; p = parentId(p)) {
      const t = titles.get(p);
      if (t) path.unshift(`${p} ${t}`);
    }
    const label = b.heading && b.title ? `${b.id} ${b.title}` : firstWords(b.text, 6);

    const n = (seen.get(b.id) ?? 0) + 1;
    seen.set(b.id, n);
    const base = n === 1 ? b.id : `${b.id}~${n}`;

    splitText(b.text, MAX_CHARS).forEach((piece, part) => {
      chunks.push({
        id: part === 0 ? base : `${base}#${part}`,
        sectionId: b.id,
        label,
        headingPath: path,
        pageStart: b.page,
        pageEnd: b.pageEnd,
        text: piece,
        crossRefs: extractCrossRefs(piece, b.id, known),
        conditionals: extractConditionals(piece),
        part,
      });
    });
  }
  return chunks;
}
