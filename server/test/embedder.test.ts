import { describe, it, expect } from 'vitest';
import { OllamaEmbedder } from '../src/retrieve/embedder.js';

describe('OllamaEmbedder', () => {
  it('posts to /api/embed and returns embeddings', async () => {
    let seen: any;
    const fake = (async (url: string, init: any) => {
      seen = { url, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ embeddings: [[1, 2], [3, 4]] }) };
    }) as any;
    const e = new OllamaEmbedder('http://x:11434', 'nomic-embed-text', fake);
    const out = await e.embed(['a', 'b']);
    expect(out).toEqual([[1, 2], [3, 4]]);
    expect(seen.url).toBe('http://x:11434/api/embed');
    expect(seen.body).toEqual({ model: 'nomic-embed-text', input: ['a', 'b'] });
  });
  it('throws on HTTP errors', async () => {
    const fake = (async () => ({ ok: false, status: 500, json: async () => ({}) })) as any;
    const e = new OllamaEmbedder('http://x', 'm', fake);
    await expect(e.embed(['a'])).rejects.toThrow(/500/);
  });
});
