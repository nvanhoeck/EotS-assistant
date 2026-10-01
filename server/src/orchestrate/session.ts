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

export class SessionStore {
  private sessions = new Map<string, Session>();

  get(id: string): Session {
    let s = this.sessions.get(id);
    if (!s) {
      s = { facts: [], recent: [] };
      this.sessions.set(id, s);
    }
    return s;
  }

  reset(id: string): void {
    this.sessions.delete(id);
  }
}
