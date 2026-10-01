import { describe, it, expect } from 'vitest';
import { createApi, ApiError } from '../src/api';

describe('createApi', () => {
  it('posts /ask to the configured server and strips trailing slashes', async () => {
    let seen: any;
    const fake = (async (url: string, init: any) => {
      seen = { url, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ type: 'not_found', nearest: [] }) };
    }) as any;
    const api = createApi('http://192.168.1.5:8787/', fake);
    const res = await api.ask('sess', 'hello');
    expect(res.type).toBe('not_found');
    expect(seen.url).toBe('http://192.168.1.5:8787/ask');
    expect(seen.body).toEqual({ sessionId: 'sess', question: 'hello' });
  });
  it('posts clarification answers', async () => {
    let seen: any;
    const fake = (async (url: string, init: any) => {
      seen = { url, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ type: 'not_found', nearest: [] }) };
    }) as any;
    await createApi('http://x', fake).answerClarification('s', 'p', ['Yes']);
    expect(seen.url).toBe('http://x/answer-clarification');
    expect(seen.body).toEqual({ sessionId: 's', pendingId: 'p', answers: ['Yes'] });
  });
  it('surfaces server error messages', async () => {
    const fake = (async () => ({ ok: false, status: 503, json: async () => ({ error: 'Cannot reach Ollama' }) })) as any;
    await expect(createApi('http://x', fake).ask('s', 'q')).rejects.toThrow('Cannot reach Ollama');
  });
  it('explains network failures', async () => {
    const fake = (async () => {
      throw new Error('Network request failed');
    }) as any;
    const err = await createApi('http://x', fake).ask('s', 'q').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toMatch(/same Wi-Fi/);
  });
});
