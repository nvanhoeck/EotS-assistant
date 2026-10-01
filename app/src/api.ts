import type { AskResult } from './types';

export class ApiError extends Error {}

const TIMEOUT_MS = 180_000; // 7B models on CPU can be slow

export function createApi(baseUrl: string, fetchImpl: typeof fetch = fetch) {
  const root = baseUrl.trim().replace(/\/+$/, '');

  async function post<T>(path: string, body: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetchImpl(root + path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(`Cannot reach ${root}. Is the server running, and is your phone on the same Wi-Fi?`);
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `Server error ${res.status}`);
    return data as T;
  }

  return {
    ask: (sessionId: string, question: string) => post<AskResult>('/ask', { sessionId, question }),
    answerClarification: (sessionId: string, pendingId: string, answers: string[]) =>
      post<AskResult>('/answer-clarification', { sessionId, pendingId, answers }),
    reset: (sessionId: string) => post<{ ok: boolean }>('/reset', { sessionId }),
  };
}
