import { execFileSync } from 'node:child_process';

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

/** Requires poppler's `pdftotext` on PATH. Default (non -layout) mode keeps columns in reading order. */
export function extractPages(pdfPath: string): string[] {
  const raw = execFileSync('pdftotext', [pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return splitPages(raw).map(cleanPage);
}
