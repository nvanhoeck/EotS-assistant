export interface JsonRequest {
  system: string;
  user: string;
  schema: object;
}

export interface LlmClient {
  generateJson<T>(req: JsonRequest): Promise<T>;
}

/** Ollama unreachable or returned an HTTP error. */
export class LlmError extends Error {}
/** Model reply was not valid JSON (after retry). */
export class LlmFormatError extends Error {}
