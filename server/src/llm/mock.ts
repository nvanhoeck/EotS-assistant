import type { JsonRequest, LlmClient } from './types.js';

/** Returns queued responses in order. A queued Error is thrown instead. Records every request. */
export class MockLlm implements LlmClient {
  calls: JsonRequest[] = [];
  constructor(private queue: unknown[]) {}

  async generateJson<T>(req: JsonRequest): Promise<T> {
    this.calls.push(req);
    if (this.queue.length === 0) throw new Error('MockLlm: no queued response');
    const next = this.queue.shift();
    if (next instanceof Error) throw next;
    return next as T;
  }
}
