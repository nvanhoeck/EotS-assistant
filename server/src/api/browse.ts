import { Router } from 'express';
import type { SectionIndex } from '../library/sections.js';
import type { Chunk } from '../types.js';

export interface Searcher {
  search(query: string, limit?: number): Promise<Chunk[]>;
}

const RESULT_LIMIT = 20;
const MAX_QUERY_CHARS = 200;

/** Read-only rulebook browsing for the app's Search mode: no LLM, no session. */
export function createBrowseRouter(searcher: Searcher, index: SectionIndex): Router {
  const router = Router();

  router.get('/search', async (req, res, next) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (!q) return void res.status(400).json({ error: '"q" is required' });
      const hits = await searcher.search(q.slice(0, MAX_QUERY_CHARS), RESULT_LIMIT);
      res.json({ results: hits.map((c) => index.hit(c)) });
    } catch (e) {
      next(e);
    }
  });

  router.get('/section/:id', (req, res) => {
    const section = index.section(req.params.id);
    if (!section) return void res.status(404).json({ error: `No section ${req.params.id}` });
    res.json(section);
  });

  router.get('/outline', (_req, res) => {
    res.json({ sections: index.outline() });
  });

  return router;
}
