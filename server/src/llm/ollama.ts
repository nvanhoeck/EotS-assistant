import { LlmError, LlmFormatError, type JsonRequest, type LlmClient } from './types.js';

export class OllamaLlm implements LlmClient {
  constructor(
    private baseUrl: string,
    private model: string,
    private fetchImpl: typeof fetch = fetch,
    private timeoutMs = 120_000,
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
            options: { temperature: 0.1, num_ctx: 8192 },
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
