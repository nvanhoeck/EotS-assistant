import fs from 'node:fs';
import path from 'node:path';
import { buildOrchestrator } from '../bootstrap.js';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const questions = JSON.parse(fs.readFileSync(path.resolve(here, '../../eval/questions.json'), 'utf8')) as {
  q: string;
  expected: string[];
}[];
const withLlm = process.argv.includes('--llm');

const { orchestrator, retriever, hybrid } = buildOrchestrator();
console.log(`Retrieval mode: ${hybrid ? 'hybrid' : 'bm25'} | LLM stage: ${withLlm ? 'on' : 'off (add --llm)'}\n`);

let hits = 0;
const kinds: Record<string, number> = {};
let verified = 0;
let citationsTotal = 0;

for (const [i, { q, expected }] of questions.entries()) {
  const r = await retriever.retrieve(q);
  const ids = r.chunks.map((c) => c.sectionId);
  const hit = expected.some((e) => ids.includes(e));
  if (hit) hits++;
  console.log(`${hit ? 'HIT ' : 'MISS'} ${q}\n     retrieved: ${ids.join(', ')}  expected: ${expected.join('|')}`);

  if (withLlm) {
    const res = await orchestrator.ask(`eval-${i}`, q);
    kinds[res.type] = (kinds[res.type] ?? 0) + 1;
    if (res.type === 'answer') {
      citationsTotal += res.citations.length;
      verified += res.citations.filter((c) => c.verified).length;
    }
  }
}

console.log(`\nRetrieval hit rate: ${hits}/${questions.length}`);
if (withLlm) {
  console.log(`Result types: ${JSON.stringify(kinds)}`);
  console.log(`Verified citations: ${verified}/${citationsTotal}`);
}
