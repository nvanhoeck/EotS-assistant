import path from 'node:path';
import { buildRetriever } from '../bootstrap.js';
import { config } from '../config.js';
import { intentMajors } from '../retrieve/intent.js';
import { tokenize } from '../retrieve/bm25.js';

const args = process.argv.slice(2);
const full = args.includes('--full');
const question = args.filter((a) => a !== '--full').join(' ').trim();
if (!question) {
  console.error('Usage: npm run search -- "your rules question" [--full]');
  process.exit(1);
}

const { retriever, hybrid } = buildRetriever();
const r = await retriever.retrieve(question);

console.log(`Question:   ${question}`);
console.log(`Tokens:     ${tokenize(question).join(' ')}`);
console.log(`Intent:     rule sections boosted: ${[...intentMajors(question)].join(', ') || '(none)'}`);
console.log(`Mode:       ${r.mode}${hybrid ? '' : ' (no embeddings.json in ' + path.basename(config.dataDir) + ')'}`);
console.log(`Confidence: ${r.lowConfidence ? 'LOW -> the assistant would answer "no matching rule"' : 'ok'}`);
console.log(`Chunks sent to the model (${r.chunks.length}, in order):\n`);

r.chunks.forEach((c, i) => {
  const pages = c.pageStart === c.pageEnd ? `p.${c.pageStart}` : `pp.${c.pageStart}-${c.pageEnd}`;
  console.log(`${i + 1}. [${c.sectionId}] ${c.label}  (${pages})`);
  if (c.headingPath.length) console.log(`   ${c.headingPath.join(' > ')}`);
  if (c.crossRefs.length) console.log(`   refs: ${c.crossRefs.join(', ')}`);
  const body = c.text.replace(/\s+/g, ' ');
  console.log(`   ${full ? body : body.slice(0, 220) + (body.length > 220 ? ' … (use --full)' : '')}\n`);
});

if (r.outline) console.log(`Outline given to the model:\n${r.outline}`);
