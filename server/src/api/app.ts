import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import { LlmError } from '../llm/types.js';
import { NotFoundError, type Orchestrator } from '../orchestrate/orchestrator.js';

class BadRequest extends Error {}

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

function str(v: unknown, name: string): string {
  if (typeof v !== 'string' || v.trim() === '') throw new BadRequest(`"${name}" is required`);
  return v;
}

export function createApp(orchestrator: Orchestrator, browse?: Router) {
  const app = express();
  app.use(express.json());
  if (browse) app.use(browse);

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post(
    '/ask',
    wrap(async (req, res) => {
      const result = await orchestrator.ask(str(req.body?.sessionId, 'sessionId'), str(req.body?.question, 'question'));
      res.json(result);
    }),
  );

  app.post(
    '/answer-clarification',
    wrap(async (req, res) => {
      const answers = req.body?.answers;
      if (!Array.isArray(answers) || answers.some((a) => typeof a !== 'string')) {
        throw new BadRequest('"answers" must be an array of strings');
      }
      const result = await orchestrator.resolve(
        str(req.body?.sessionId, 'sessionId'),
        str(req.body?.pendingId, 'pendingId'),
        answers,
      );
      res.json(result);
    }),
  );

  app.post(
    '/reset',
    wrap(async (req, res) => {
      orchestrator.reset(str(req.body?.sessionId, 'sessionId'));
      res.json({ ok: true });
    }),
  );

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof BadRequest) return void res.status(400).json({ error: err.message });
    if (err instanceof NotFoundError) return void res.status(404).json({ error: err.message });
    if (err instanceof LlmError) return void res.status(503).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
