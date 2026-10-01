import { createApp } from './api/app.js';
import { createBrowseRouter } from './api/browse.js';
import { buildOrchestrator } from './bootstrap.js';
import { config } from './config.js';
import { SectionIndex } from './library/sections.js';

const { orchestrator, retriever, chunks, hybrid } = buildOrchestrator();
const browse = createBrowseRouter(retriever, new SectionIndex(chunks));
createApp(orchestrator, browse).listen(config.port, config.host, () => {
  console.log(`EotS assistant listening on http://${config.host}:${config.port}`);
  console.log(`Chat model: ${config.chatModel} | Ollama: ${config.ollamaUrl}`);
  console.log(hybrid ? 'Retrieval: hybrid (BM25 + embeddings)' : 'Retrieval: BM25 only (run "npm run embed" for hybrid)');
});
