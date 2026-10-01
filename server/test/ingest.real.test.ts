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
