import type { Chunk, ClarifyQuestion } from '../types.js';

export interface Pending {
  id: string;
  question: string;
  questions: ClarifyQuestion[];
  chunks: Chunk[];
}

export interface Session {
  facts: string[];
  recent: { q: string; a: string }[];
  pending?: Pending;
}

const MAX_SESSIONS = 200;

export class SessionStore {
  private sessions = new Map<string, Session>();

  get(id: string): Session {
    let s = this.sessions.get(id);
    if (s) this.sessions.delete(id); // refresh recency
    else s = { facts: [], recent: [] };
    this.sessions.set(id, s);
    while (this.sessions.size > MAX_SESSIONS) {
      this.sessions.delete(this.sessions.keys().next().value as string);
    }
    return s;
  }

  reset(id: string): void {
    this.sessions.delete(id);
  }
}
