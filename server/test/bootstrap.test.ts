import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadChunks, loadEmbeddings } from '../src/bootstrap.js';
import type { Chunk } from '../src/types.js';

const chunk = (id: string): Chunk => ({
  id, sectionId: id, label: id, headingPath: [], pageStart: 2, pageEnd: 2, text: 't', crossRefs: [], conditionals: [], part: 0,
});

describe('bootstrap', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eots-'));
  const chunks = [chunk('1.0'), chunk('1.1')];

  it('loadChunks throws a helpful error when missing', () => {
    expect(() => loadChunks(path.join(dir, 'nope.json'))).toThrow(/npm run ingest/);
  });
  it('loadEmbeddings returns undefined when absent', () => {
    expect(loadEmbeddings(path.join(dir, 'none.json'), chunks)).toBeUndefined();
  });
  it('loadEmbeddings returns vectors when ids match and undefined when stale', () => {
    const f = path.join(dir, 'emb.json');
    fs.writeFileSync(f, JSON.stringify({ model: 'm', ids: ['1.0', '1.1'], vectors: [[1], [2]] }));
    expect(loadEmbeddings(f, chunks)).toEqual([[1], [2]]);
    fs.writeFileSync(f, JSON.stringify({ model: 'm', ids: ['1.0', '9.9'], vectors: [[1], [2]] }));
    expect(loadEmbeddings(f, chunks)).toBeUndefined();
  });
});
