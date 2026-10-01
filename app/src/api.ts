import type { AskResult, SearchResult, SectionChild, SectionView } from './types';

export class ApiError extends Error {}

const TIMEOUT_MS = 180_000; // 7B models on CPU can be slow
const READ_TIMEOUT_MS = 20_000; // search and section reads never touch the LLM

export function createApi(baseUrl: string, fetchImpl: typeof fetch = fetch) {
  const root = baseUrl.trim().replace(/\/+$/, '');

  async function request<T>(path: string, init: RequestInit, timeoutMs: number): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetchImpl(root + path, { ...init, signal: controller.signal });
    } catch {
      throw new ApiError(`Cannot reach ${root}. Is the server running, and is your phone on the same Wi-Fi?`);
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `Server error ${res.status}`);
    return data as T;
  }

  const post = <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, TIMEOUT_MS);
  const get = <T>(path: string) => request<T>(path, { method: 'GET' }, READ_TIMEOUT_MS);

  return {
    ask: (sessionId: string, question: string) => post<AskResult>('/ask', { sessionId, question }),
    answerClarification: (sessionId: string, pendingId: string, answers: string[]) =>
      post<AskResult>('/answer-clarification', { sessionId, pendingId, answers }),
    reset: (sessionId: string) => post<{ ok: boolean }>('/reset', { sessionId }),
    search: async (q: string) => (await get<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`)).results,
    section: (id: string) => get<SectionView>(`/section/${encodeURIComponent(id)}`),
    outline: async () => (await get<{ sections: SectionChild[] }>('/outline')).sections,
  };
}
