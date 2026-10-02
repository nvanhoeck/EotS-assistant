import { LlmError, LlmFormatError, type JsonRequest, type LlmClient } from './types.js';

// Thinking models (qwen3) otherwise reason for an unbounded time before answering.
const THINKING_MODEL = /^qwen3/i;
// Two attempts at this limit must stay under the app's 180 s request timeout.
const MAX_OUTPUT_TOKENS = 1500;

export class OllamaLlm implements LlmClient {
  constructor(
    private baseUrl: string,
    private model: string,
    private fetchImpl: typeof fetch = fetch,
    private timeoutMs = 80_000,
  ) {}

  async generateJson<T>({ system, user, schema }: JsonRequest): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await this.fetchImpl(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            stream: false,
            format: schema,
            ...(THINKING_MODEL.test(this.model) ? { think: false } : {}),
            options: { temperature: 0.1, num_ctx: 8192, num_predict: MAX_OUTPUT_TOKENS },
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
          }),
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (e) {
        throw new LlmError(`Cannot reach Ollama at ${this.baseUrl}: ${(e as Error).message}`);
      }
      if (!res.ok) throw new LlmError(`Ollama returned HTTP ${res.status}`);
      const data = (await res.json()) as { message?: { content?: string } };
      try {
        return JSON.parse(data.message?.content ?? '') as T;
      } catch {
        // retry once
      }
    }
    throw new LlmFormatError('Model returned malformed JSON twice');
  }
}
