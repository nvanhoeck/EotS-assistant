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
    expect(first('4.0')?.pageStart).toBe(5);
    expect(first('8.0')?.pageStart).toBe(17);
    expect(first('8.31')?.pageStart).toBe(20);
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
    expect(first('4.11')?.crossRefs).toContain('9.0');
    expect(first('4.21')?.conditionals.join(' ')).toMatch(/unless/i);
  });
  it('has unique chunk ids', () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });
});

describe.skipIf(!have)('real rulebook noise removal', () => {
  const chunks: Chunk[] = have ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const anywhere = (s: string) => chunks.some((c) => c.text.includes(s));

  it('drops designer notes, bibliography and index', () => {
    expect(anywhere('DESIGN NOTE')).toBe(false);
    expect(chunks.some((c) => c.sectionId === '20.0')).toBe(false);
    expect(anywhere('Allen, Louis')).toBe(false);
    expect(anywhere('GAME DESIGNER')).toBe(false);
  });
  it('keeps errata', () => {
    const e = chunks.find((c) => c.sectionId === 'ERRATA' && c.text.includes('Japanese Card 27'));
    expect(e).toBeDefined();
    expect(e!.text).toContain('37th');
    expect(e!.pageStart).toBe(48);
  });
  it('keeps play guidance and drops pure commentary', () => {
    expect(anywhere('PLAY NOTE: Moving air and aircraft carrier units first')).toBe(true);
    expect(anywhere('important concept in the game')).toBe(false);
    expect(anywhere('dominated by carrier warfare')).toBe(false);
  });
  it('is smaller overall', () => {
    expect(chunks.reduce((n, c) => n + c.text.length, 0)).toBeLessThan(235000);
  });
});

describe.skipIf(!have)('real rulebook two-column pages', () => {
  const chunks: Chunk[] = have ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const text = (id: string) => chunks.filter((c) => c.sectionId === id).map((c) => c.text).join(' ');

  it('keeps 11.51 and 11.52 apart (page 24 interleaves its columns)', () => {
    expect(text('11.51')).toContain('except during the first three game turns');
    expect(text('11.51')).not.toContain('If China surrenders');
    expect(text('11.52')).toContain('If China surrenders');
    expect(text('11.52')).toContain('If the War In Europe is at level 4');
    expect(text('11.22')).not.toContain('except during the first three game turns');
  });
  it('keeps the 7.42 restrictions list and the 7.43 continuation under their own rules (page 15)', () => {
    expect(text('7.42')).toContain('Japanese ground units may enter Northern India');
    expect(text('7.43')).toContain('Otherwise a ground unit cannot leave the hex');
    expect(text('7.45')).toContain('Amphibious Assault ASP Requirements');
  });
  it('has no running page numbers glued into rule text', () => {
    expect(text('12.1')).not.toMatch(/hex\. 25$/);
    expect(text('11.21')).not.toContain('to 24 zero');
  });
});
