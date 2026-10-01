import { execFileSync } from 'node:child_process';
import { columnText, prefersColumns, reflow } from './columns.js';

const NOISE: RegExp[] = [/^Empire of the Sun \(v2\.0\)$/, /GMT Games, LLC/, /^www\.GMTGames\.com/i];

export function splitPages(raw: string): string[] {
  const pages = raw.split('\f');
  if (pages.length > 0 && pages[pages.length - 1].trim() === '') pages.pop();
  return pages;
}

export function cleanPage(text: string): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !NOISE.some((re) => re.test(l)))
    .join('\n');
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
    if (columns === null) return flowText;
    const columnsText = cleanPage(reflow(columns));
    return prefersColumns(flowText, columnsText) ? columnsText : flowText;
  });
}
