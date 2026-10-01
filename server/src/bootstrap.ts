import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { OllamaLlm } from './llm/ollama.js';
import { Orchestrator } from './orchestrate/orchestrator.js';
import { SessionStore } from './orchestrate/session.js';
import { OllamaEmbedder } from './retrieve/embedder.js';
import { Retriever } from './retrieve/retriever.js';
import type { Chunk } from './types.js';

export function loadChunks(file: string): Chunk[] {
  if (!fs.existsSync(file)) {
    throw new Error(`Chunks file not found: ${file}. Run "npm run ingest -- <path-to-pdf>" first.`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Chunk[];
}

/** Returns vectors aligned with chunks, or undefined when absent or stale (BM25-only mode). */
export function loadEmbeddings(file: string, chunks: Chunk[]): number[][] | undefined {
  if (!fs.existsSync(file)) return undefined;
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { ids: string[]; vectors: number[][] };
  const aligned = data.ids.length === chunks.length && data.ids.every((id, i) => id === chunks[i].id);
  return aligned ? data.vectors : undefined;
}

export function buildRetriever(): { retriever: Retriever; hybrid: boolean } {
  const chunks = loadChunks(path.join(config.dataDir, 'chunks.json'));
  const vectors = loadEmbeddings(path.join(config.dataDir, 'embeddings.json'), chunks);
  const embedder = vectors ? new OllamaEmbedder(config.ollamaUrl, config.embedModel) : undefined;
  return { retriever: new Retriever(chunks, embedder, vectors), hybrid: !!vectors };
}

export function buildOrchestrator() {
  const { retriever, hybrid } = buildRetriever();
  const llm = new OllamaLlm(config.ollamaUrl, config.chatModel);
  return { orchestrator: new Orchestrator(retriever, llm, new SessionStore()), retriever, hybrid };
}
