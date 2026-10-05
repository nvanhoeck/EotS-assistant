import type { RuleBlock } from '../types.js';

export const RULE_START = /^(\d{1,2}\.\d{1,3}(?:\.[A-Z0-9]{1,2})?)\.?\s+([A-Z].*)$/;
export const MAX_MAJOR = 20;

function isHeading(rest: string): boolean {
  const words = rest.trim().split(/\s+/);
  return words.length <= 10 && !/[.:;,]$/.test(rest.trim());
}

/** Pages are 0-indexed array entries; page numbers are 1-based. Page 1 (cover + TOC) is skipped. */
export function parseRules(pages: string[]): RuleBlock[] {
  const blocks: RuleBlock[] = [];
  let cur: RuleBlock | null = null;

  pages.forEach((pageText, i) => {
    const page = i + 1;
    if (page === 1) return;
    for (const line of pageText.split('\n')) {
      if (/\.{4,}/.test(line)) continue; // TOC dot leaders
      const m = RULE_START.exec(line);
      if (m && Number(m[1].split('.')[0]) <= MAX_MAJOR) {
        const heading = isHeading(m[2]);
        cur = {
          id: m[1],
          heading,
          title: heading ? m[2].trim() : null,
          page,
          pageEnd: page,
          text: line,
        };
        blocks.push(cur);
      } else if (cur) {
        cur.text += '\n' + line;
        if (line.trim()) cur.pageEnd = page; // blank/empty pages must not extend a block
      }
    }
  });
  return blocks;
}
