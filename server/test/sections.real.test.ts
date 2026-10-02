import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadChunks } from '../src/bootstrap.js';
import { config } from '../src/config.js';
import { SectionIndex } from '../src/library/sections.js';

const chunks = loadChunks(path.join(config.dataDir, 'chunks.json'));
const index = new SectionIndex(chunks);
const ids = [...new Set(chunks.map((c) => c.sectionId))];

describe('SectionIndex on the real rulebook', () => {
  it('every section is reachable from the outline through children', () => {
    const seen = new Set<string>();
    const walk = (list: string[]) => {
      for (const id of list) {
        if (seen.has(id)) continue;
        seen.add(id);
        walk(index.section(id)!.children.map((c) => c.sectionId));
      }
    };
    walk(index.outline().map((s) => s.sectionId));
    expect([...seen].sort()).toEqual([...ids].sort());
  });
  it('prev and next always point at an existing section', () => {
    for (const id of ids) {
      const s = index.section(id)!;
      for (const ref of [s.prev, s.next]) if (ref) expect(index.section(ref.sectionId)).toBeDefined();
    }
  });
  it('a heading with a number in its label has a title', () => {
    expect(index.section('4.0')!.title).toBe('Sequence of Play');
  });
});
