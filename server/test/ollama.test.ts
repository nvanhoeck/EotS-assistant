import { describe, it, expect } from 'vitest';
import { OllamaLlm } from '../src/llm/ollama.js';
import { LlmError, LlmFormatError } from '../src/llm/types.js';

const reply = (content: string) => ({ ok: true, status: 200, json: async () => ({ message: { content } }) });
const opts = { system: 's', user: 'u', schema: { type: 'object' } };

describe('OllamaLlm', () => {
  it('sends a JSON-schema constrained chat request and parses the reply', async () => {
    let body: any;
    const fake = (async (_u: string, init: any) => {
      body = JSON.parse(init.body);
      return reply('{"a":1}');
    }) as any;
    const llm = new OllamaLlm('http://x:11434', 'qwen2.5:7b', fake);
    expect(await llm.generateJson(opts)).toEqual({ a: 1 });
    expect(body.format).toEqual({ type: 'object' });
    expect(body.stream).toBe(false);
    expect(body.messages.map((m: any) => m.role)).toEqual(['system', 'user']);
  });
  it('retries once on malformed JSON', async () => {
    const replies = [reply('not json'), reply('{"ok":true}')];
    const fake = (async () => replies.shift()) as any;
    expect(await new OllamaLlm('http://x', 'm', fake).generateJson(opts)).toEqual({ ok: true });
  });
  it('throws LlmFormatError after two malformed replies', async () => {
    const fake = (async () => reply('nope')) as any;
    await expect(new OllamaLlm('http://x', 'm', fake).generateJson(opts)).rejects.toBeInstanceOf(LlmFormatError);
  });
  it('throws LlmError when Ollama is unreachable', async () => {
    const fake = (async () => {
      throw new Error('ECONNREFUSED');
    }) as any;
    await expect(new OllamaLlm('http://x', 'm', fake).generateJson(opts)).rejects.toBeInstanceOf(LlmError);
  });
  it('throws LlmError on HTTP errors', async () => {
    const fake = (async () => ({ ok: false, status: 404, json: async () => ({}) })) as any;
    await expect(new OllamaLlm('http://x', 'm', fake).generateJson(opts)).rejects.toThrow(/404/);
  });
});
