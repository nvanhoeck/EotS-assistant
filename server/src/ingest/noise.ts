/** Removes designer commentary from cleaned rulebook pages while keeping real rules content. */

/** Start of the designer essay; everything from here to the end of the document is dropped. */
export const END_MATTER_START = /^20\.0\s+Designer.?s Notes/i;

/** Lines in the dropped end matter that are still worth keeping (card/printing corrections). */
export const ERRATA_PREFIXES = ['PRINTING NOTE', 'CARD ERRATA', 'ERRATA'];

/** Inline designer rationale, not rules. */
export const DESIGN_NOTE_PREFIX = 'DESIGN NOTE';

/** Second paragraph of a multi-paragraph DESIGN NOTE (does not start lowercase, so listed explicitly). */
export const DESIGN_NOTE_FOLLOWUP_PREFIXES = [
  'The system will recreate the outcomes from the campaigns',
];

/** Pure commentary the user chose to drop (other PLAY/PLAYER NOTEs carry play guidance and stay). */
export const DROPPED_SIDENOTE_PREFIXES = [
  'PLAY NOTE: This is an important concept', // restates a rule as emphasis
  'PLAY NOTE: There are only a handful', // design remark about unit counts
  'HISTORICAL NOTE:', // history, no rules content
  'PLAY NOTE: Surrender markers have been supplied', // component remark
];

export interface NoiseStats {
  designNoteLines: number;
  sidenoteLines: number;
  endMatterLines: number;
}

export interface Errata {
  page: number;
  text: string;
}

export function stripNoise(pages: string[]): {
  pages: string[];
  errata: Errata[];
  stats: NoiseStats;
} {
  const stats: NoiseStats = { designNoteLines: 0, sidenoteLines: 0, endMatterLines: 0 };
  const errata: Errata[] = [];
  const out = pages.map((p) => p.split('\n'));

  // a. end matter
  let cut = false;
  for (let pi = 0; pi < out.length; pi++) {
    let lines = out[pi];
    if (!cut) {
      const idx = lines.findIndex((l) => END_MATTER_START.test(l));
      if (idx < 0) continue;
      cut = true;
      const removed = lines.slice(idx);
      out[pi] = lines.slice(0, idx);
      lines = removed;
      collect(lines, pi + 1);
    } else {
      collect(lines, pi + 1);
      out[pi] = [];
    }
  }
  function collect(lines: string[], page: number) {
    stats.endMatterLines += lines.length;
    for (const l of lines) {
      const t = l.trim();
      if (ERRATA_PREFIXES.some((p) => t.startsWith(p))) errata.push({ page, text: t });
    }
  }

  // b + c. inline notes and dropped sidenotes
  const result = out.map((lines) => {
    const kept: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith(DESIGN_NOTE_PREFIX)) {
        stats.designNoteLines++;
        while (i + 1 < lines.length && isContinuation(lines[i + 1])) {
          stats.designNoteLines++;
          i++;
        }
      } else if (DROPPED_SIDENOTE_PREFIXES.some((p) => line.startsWith(p))) {
        stats.sidenoteLines++;
      } else {
        kept.push(line);
      }
    }
    return kept.join('\n');
  });

  return { pages: result, errata, stats };
}

function isContinuation(line: string): boolean {
  if (!line.trim()) return false;
  return (
    /^[a-z]/.test(line) || DESIGN_NOTE_FOLLOWUP_PREFIXES.some((p) => line.startsWith(p))
  );
}
