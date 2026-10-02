/**
 * Two-column page handling for the rulebook.
 *
 * pdftotext's default mode guesses a reading order that interleaves the columns on some pages
 * (page 24 puts the end of 11.51 and rule 11.52 before the start of 11.51), so a rule's text can end up under
 * its neighbour. `-layout` keeps both columns side by side with correct spacing, so on pages with a clean
 * column gutter we split each line at the gutter and read the left column, then the right one.
 */

import { MAX_MAJOR, RULE_START } from './parse.js';
import { countOutOfOrder } from './ruleId.js';

const HEADER_FOOTER = [/Empire of the Sun \(v2\.0\)/, /GMT Games, LLC/, /GMTGames\.com/i, /^\d{1,2}$/];
/** A column gutter must be blank on at least this share of the page's text lines. */
const GUTTER_SHARE = 0.97;
const MIN_GUTTER_WIDTH = 3;
const MIN_LINES = 15;
/** Each side of the gutter must carry text on at least this share of the lines. */
const MIN_COLUMN_SHARE = 0.3;

const isHeaderOrFooter = (line: string) => HEADER_FOOTER.some((re) => re.test(line.trim()));

/** Character index where the two columns separate, or -1 when the page does not have a clean two-column layout. */
function gutterIndex(lines: string[]): number {
  const body = lines.filter((l) => l.trim() !== '');
  if (body.length < MIN_LINES) return -1;
  const width = Math.max(...body.map((l) => l.length));
  let best = -1;
  let bestRun = 0;
  let run = 0;
  for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
    const blank = body.filter((l) => (l[x] ?? ' ') === ' ').length;
    if (blank >= body.length * GUTTER_SHARE) {
      run++;
      if (run > bestRun) {
        bestRun = run;
        best = x - Math.floor(run / 2);
      }
    } else {
      run = 0;
    }
  }
  if (bestRun < MIN_GUTTER_WIDTH) return -1;
  const left = body.filter((l) => l.slice(0, best).trim() !== '').length;
  const right = body.filter((l) => l.slice(best).trim() !== '').length;
  return left >= body.length * MIN_COLUMN_SHARE && right >= body.length * MIN_COLUMN_SHARE ? best : -1;
}

/**
 * One page of `pdftotext -layout` output -> the left column followed by the right column (a blank line between
 * them), or null when the page has no clean two-column gutter (cover, tables, maps, full-width examples).
 */
export function columnText(layoutPage: string): string | null {
  const lines = layoutPage.split(/\r?\n/).filter((l) => !isHeaderOrFooter(l));
  const gutter = gutterIndex(lines);
  if (gutter < 0) return null;
  const left = lines.map((l) => l.slice(0, gutter).trim());
  const right = lines.map((l) => l.slice(gutter).trim());
  return [...left, '', ...right].join('\n').replace(/\n{3,}/g, '\n\n');
}

/** A line that always begins a new paragraph: a rule number, a lettered list item or a play/design note. */
const PARAGRAPH_START =
  /^(?:\d{1,2}\.\d{1,3}(?:\.[A-Z0-9]{1,2})?\s+[A-Z]|[A-Z]\.\s|(?:PLAY|PLAYER|DESIGN|HISTORICAL|PRINTING) NOTE\b|CARD ERRATA\b)/;

/**
 * Rebuilds paragraphs from layout lines the way pdftotext's default mode emits them: one line per paragraph,
 * wrapped lines joined with a space, a hyphen at a line end removed. Blank lines end a paragraph.
 */
export function reflow(text: string): string {
  const out: string[] = [];
  let current = '';
  const flush = () => {
    if (current) out.push(current);
    current = '';
  };
  for (const line of text.split('\n')) {
    if (line === '') {
      flush();
      continue;
    }
    if (PARAGRAPH_START.test(line)) flush();
    if (!current) current = line;
    else if (/[a-z]-$/.test(current)) current = current.slice(0, -1) + line;
    else current += ' ' + line;
  }
  flush();
  return out.join('\n');
}

/** Rule ids that start a line, in page order (the same lines the parser treats as the start of a rule). */
export function ruleIdsOf(text: string): string[] {
  const ids: string[] = [];
  for (const line of text.split('\n')) {
    const m = RULE_START.exec(line.trim());
    if (m && Number(m[1].split('.')[0]) <= MAX_MAJOR) ids.push(m[1]);
  }
  return ids;
}

/**
 * Use the column reading of a page only when it provably helps: the same rules start on the page, in strictly
 * better order. Everywhere else the default reading stays (the column split can pick up stray characters
 * near the gutter or drop text next to figures and tables).
 */
export function prefersColumns(flowText: string, columns: string): boolean {
  const flow = ruleIdsOf(flowText);
  const cols = ruleIdsOf(columns);
  if ([...flow].sort().join(' ') !== [...cols].sort().join(' ')) return false;
  return countOutOfOrder(cols) < countOutOfOrder(flow);
}
