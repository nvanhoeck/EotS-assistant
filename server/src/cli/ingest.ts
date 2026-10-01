import fs from 'node:fs';
import path from 'node:path';
import { ingestPdf } from '../ingest/index.js';
import { config } from '../config.js';

const pdf = process.argv[2] ?? process.env.EOTS_PDF;
if (!pdf) {
  console.error('Usage: npm run ingest -- <path-to-eotsrulesv2.0.pdf>   (or set EOTS_PDF)');
  process.exit(1);
}

const { chunks, report } = ingestPdf(pdf);
fs.mkdirSync(config.dataDir, { recursive: true });
fs.writeFileSync(path.join(config.dataDir, 'chunks.json'), JSON.stringify(chunks, null, 1));
fs.writeFileSync(path.join(config.dataDir, 'ingest-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
