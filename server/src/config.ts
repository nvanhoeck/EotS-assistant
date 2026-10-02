import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  chatModel: process.env.CHAT_MODEL ?? 'qwen3:8b',
  embedModel: process.env.EMBED_MODEL ?? 'nomic-embed-text',
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '0.0.0.0',
  dataDir: process.env.DATA_DIR ?? path.resolve(here, '../data'),
};
