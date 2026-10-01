import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { loadChunks } from '../bootstrap.js';
import { OllamaEmbedder } from '../retrieve/embedder.js';
import { searchText } from '../retrieve/retriever.js';

const chunks = loadChunks(path.join(config.dataDir, 'chunks.json'));
const embedder = new OllamaEmbedder(config.ollamaUrl, config.embedModel);
const vectors: number[][] = [];
const BATCH = 16;

for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH).map((c) => 'search_document: ' + searchText(c));
  vectors.push(...(await embedder.embed(batch)));
  console.log(`embedded ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
}

fs.writeFileSync(
  path.join(config.dataDir, 'embeddings.json'),
  JSON.stringify({ model: config.embedModel, ids: chunks.map((c) => c.id), vectors }),
);
console.log('wrote embeddings.json');
