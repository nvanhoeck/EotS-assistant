import fs from 'node:fs';
import path from 'node:path';
import { droppedIds, ingestPdf } from '../ingest/index.js';
import { config } from '../config.js';
import type { Chunk } from '../types.js';

const args = process.argv.slice(2);
const allowDrops = args.includes('--allow-drops') || process.env.npm_config_allow_drops === 'true';
const pdf = args.find((a) => !a.startsWith('--')) ?? process.env.EOTS_PDF;
if (!pdf) {
  console.error('Usage: npm run ingest -- <path-to-eotsrulesv2.0.pdf> [--allow-drops]   (or set EOTS_PDF)');
  process.exit(1);
}

const { chunks, report } = ingestPdf(pdf);
const chunksFile = path.join(config.dataDir, 'chunks.json');

// A re-ingest must not silently lose rules that the previous ingest had.
if (fs.existsSync(chunksFile) && !allowDrops) {
  const dropped = droppedIds(JSON.parse(fs.readFileSync(chunksFile, 'utf8')) as Chunk[], chunks);
  if (dropped.length > 0) {
    console.error(`Refusing to write: the new ingest has no section for ${dropped.length} rule id(s): ${dropped.join(', ')}`);
    console.error('Nothing was written. If this is expected, run again with --allow-drops.');
    process.exit(1);
  }
}

fs.mkdirSync(config.dataDir, { recursive: true });
fs.writeFileSync(chunksFile, JSON.stringify(chunks, null, 1));
fs.writeFileSync(path.join(config.dataDir, 'ingest-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
