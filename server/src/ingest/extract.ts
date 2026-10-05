import { execFileSync } from 'node:child_process';
import { columnText, prefersColumns, reflow } from './columns.js';

/** Running header lines. The 2021 edition prints "Empire of the Sun" with the page number on a line of its own. */
const RUNNING_HEADER: RegExp[] = [/^Empire of the Sun$/, /^\d{1,2}\s+Empire of the Sun$/, /^Empire of the Sun\s+\d{1,2}$/];
const NOISE: RegExp[] = [
  /^Empire of the Sun \(v\d\.\d\)$/,
  /GMT Games, LLC/,
  /^www\.GMTGames\.com/i,
  /^V\d\.\d$/, // rules version stamp in the footer
  ...RUNNING_HEADER,
];

export function splitPages(raw: string): string[] {
  const pages = raw.split('\f');
  if (pages.length > 0 && pages[pages.length - 1].trim() === '') pages.pop();
  return pages;
}

export function cleanPage(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '');
  const isHeader = (l: string | undefined) => l !== undefined && RUNNING_HEADER.some((re) => re.test(l));
  return lines
    .filter((l, i) => {
      if (NOISE.some((re) => re.test(l))) return false;
      // A bare page number right next to a running header is part of that header.
      return !(/^\d{1,2}$/.test(l) && (isHeader(lines[i - 1]) || isHeader(lines[i + 1])));
    })
    .join('\n');
}

/** The printed page number equals the PDF page number, so a leftover number line at a page edge is the folio. */
function dropFolio(text: string, pageIndex: number): string {
  const lines = text.split('\n');
  const folio = String(pageIndex + 1);
  if (lines[0] === folio) lines.shift();
  else if (lines[lines.length - 1] === folio) lines.pop();
  return lines.join('\n');
}

const pdftotext = (pdfPath: string, mode: string[]) =>
  execFileSync('pdftotext', [...mode, pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * Requires `pdftotext` (poppler or xpdf) on PATH. Each page uses the default mode, unless `-layout` shows a clean
 * two-column gutter and reading the columns left to right puts the page's rules in better order (see columns.ts).
 * The default mode interleaves the columns on some pages, which glues a rule's text onto its neighbour
 * (e.g. 11.52's list under 11.51).
 */
export function extractPages(pdfPath: string): string[] {
  const flow = splitPages(pdftotext(pdfPath, []));
  const layout = splitPages(pdftotext(pdfPath, ['-layout']));
  return flow.map((page, i) => {
    const flowText = cleanPage(page);
    const columns = layout[i] === undefined ? null : columnText(layout[i]);
    if (columns === null) return dropFolio(flowText, i);
    const columnsText = cleanPage(reflow(columns));
    return dropFolio(prefersColumns(flowText, columnsText) ? columnsText : flowText, i);
  });
}
