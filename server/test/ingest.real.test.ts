import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { Chunk } from '../src/types.js';
import { config } from '../src/config.js';

const file = path.join(config.dataDir, 'chunks.json');
const have = fs.existsSync(file);

describe.skipIf(!have)('real rulebook chunks', () => {
  const chunks: Chunk[] = have ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const first = (id: string) => chunks.find((c) => c.sectionId === id);

  it('has a plausible number of chunks', () => {
    expect(chunks.length).toBeGreaterThan(150);
  });
  it('finds key rules on the right printed pages', () => {
    expect(first('4.0')?.pageStart).toBe(6);
    expect(first('8.0')?.pageStart).toBe(15);
    expect(first('9.31')?.pageStart).toBe(22);
    expect(first('4.14')?.pageStart).toBe(6);
  });
  it('builds heading paths for inline rules', () => {
    expect(first('4.11')?.headingPath.join(' > ')).toContain('4.0');
    expect(first('4.11')?.headingPath.join(' > ')).toContain('4.1');
  });
  it('contains no noise lines and no oversized chunks', () => {
    expect(chunks.some((c) => /GMT Games, LLC/.test(c.text))).toBe(false);
    expect(Math.max(...chunks.map((c) => c.text.length))).toBeLessThan(2600);
  });
  it('captures cross references and conditionals', () => {
    expect(first('4.11')?.crossRefs).toContain('10.1');
    expect(first('5.2')?.conditionals.join(' ')).toMatch(/unless/i);
  });
  it('has unique chunk ids', () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });
});

describe.skipIf(!have)('real rulebook noise removal', () => {
  const chunks: Chunk[] = have ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const anywhere = (s: string) => chunks.some((c) => c.text.includes(s));

  it('drops designer notes, bibliography and index', () => {
    // The 2021 edition also prints a few design notes inline in a paragraph; only line-initial ones are stripped.
    expect(chunks.some((c) => /^DESIGN NOTE/m.test(c.text))).toBe(false);
    expect(chunks.some((c) => c.sectionId === '20.0')).toBe(false);
    expect(anywhere('Reprint Designers Notes')).toBe(false);
    expect(anywhere('Card Driven Solitaire System Rules')).toBe(false);
  });
  it('drops the running page header and version stamp', () => {
    expect(anywhere('Empire of the Sun\n')).toBe(false);
    expect(anywhere('V3.2')).toBe(false);
    expect(chunks.some((c) => /(^|\n)\d{1,2}\n[a-z]/.test(c.text))).toBe(false);
  });
  it('keeps play guidance and drops pure commentary', () => {
    expect(anywhere('PLAY NOTE: Moving air and aircraft carrier units first')).toBe(true);
    expect(anywhere('important concept in the game')).toBe(false);
    expect(anywhere('dominated by carrier warfare')).toBe(false);
  });
  it('is smaller overall', () => {
    expect(chunks.reduce((n, c) => n + c.text.length, 0)).toBeLessThan(260000);
  });
});

describe.skipIf(!have)('real rulebook two-column pages', () => {
  const chunks: Chunk[] = have ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const text = (id: string) => chunks.filter((c) => c.sectionId === id).map((c) => c.text).join(' ');

  it('keeps 12.51 and 12.52 apart', () => {
    expect(text('12.51')).toContain('except during the first three game turns');
    expect(text('12.51')).not.toContain('If China has surrendered');
    expect(text('12.52')).toContain('If China has surrendered');
    expect(text('12.52')).toContain('If the War In Europe is at level 4');
  });
  it('keeps the 8.41 restrictions list and the 8.45 amphibious rules under their own rules', () => {
    expect(text('8.41')).toContain('Japanese ground units may enter Northern India');
    expect(text('8.45')).toContain('Amphibious Assault ASP Requirements');
    expect(text('8.45')).not.toContain('Northern India');
  });
  it('has no running page numbers glued into rule text', () => {
    expect(text('13.73')).toMatch(/during\s+the Offensive segment/);
  });
});
