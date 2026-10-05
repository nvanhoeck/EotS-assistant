# Empire of the Sun Rules Assistant

Free, local rules helper for *Empire of the Sun* (rules v2.0). A Node server next to Ollama does retrieval and prompting; an Expo app is the chat UI. Answers cite section number, heading path and page.

The ingested rulebook text in `server/data/chunks.json` is derived from a copyrighted PDF. Keep this repository private.

## One-time setup on the machine that runs Ollama

1. Install Ollama, then pull models:
   ```
   ollama pull qwen3:8b
   ollama pull nomic-embed-text
   ```
   (Use another 7B chat model by setting `CHAT_MODEL`.)
2. `cd server && npm install`
3. Build embeddings (needs Ollama running): `npm run embed`
4. Allow inbound TCP 8787 in the OS firewall.
5. Start: `npm start` (startup log says whether retrieval is hybrid or BM25-only).

Re-ingest only if the PDF changes (or the extraction in `server/src/ingest` changes): `npm run ingest -- <pdf>` (needs `pdftotext`, poppler or xpdf, on PATH), then `npm run embed` (chunk ids change, so old embeddings are ignored until rebuilt). The ingest refuses to overwrite `data/chunks.json` if the new result has lost a rule id that the old one had; pass `--allow-drops` if that is intended. Two-column pages are read column by column when that provably fixes the rule order (`server/src/ingest/columns.ts`).

## Phone app

```
cd app
npm install
npx expo start
```
Open in Expo Go on a phone on the same Wi-Fi. Tap **Server** and enter `http://<PC LAN IP>:8787`.

### Search mode

Tap **Search** (next to **AI**) to browse and search the rulebook without the model. Type a query (it searches 1 s after you stop typing, or on the keyboard's search key); results are ranked with the best match first. Open a section to read it; use the subsection list, Previous/Next and the underlined cross-references; **Back** returns to where you came from. A−/A+ change the text size. Search needs the server running but not Ollama.

### Helper mode

Tap **Helper** for a rules helper organised by the Sequence of Play, with topic pages that gather rules spread over several rulebook pages. It works offline (the content is bundled in the app); the rulebook chips (`§9.12 · p. 22`) open the full text in the Reader and need the server.

- **Game status bar** (top of every page): optionally set the turn, War in Europe level, Japanese resource hexes, Allied ASPs and net hexes captured this turn, surrendered nations and once-per-game results. Reminders and forms use it; leave it empty and everything is still shown, with its condition written out. **Next turn** resets the per-turn counters.
- **Reminders** appear on the page and in the accordion section they belong to: *Applies now* (highlighted), *Check* (needs a human look) or *Not now* (greyed, with the reason).
- **Pages so far:** Reinforcement Segment (eligibility form: who can be placed where, delays, Sent to Europe), Replacement Segment (form: can this unit receive a replacement, what it costs, where it goes), Strategic Warfare Segment (draw calculator) and US Political Will (everything that moves it, plus the Progress of the War countdown). Other segments show "coming soon" and link to the rulebook.
- **Back** returns through everything you opened, one step at a time.

The helper text is in `app/src/helper/content/*.ts` and the logic in `app/src/helper/logic/*.ts`. After re-ingesting the PDF run `npm run gen:pages` in `app/`; `npm test` fails if a cited section id no longer exists.

## Evaluate

```
cd server
npm run eval            # retrieval hit rate (no LLM)
npm run eval -- --llm   # also runs the clarify/answer loop; reports result types and verified citations
```
Edit `server/eval/questions.json` to add cases. Tunables: `server/src/retrieve/retriever.ts` (`DEFAULT_RETRIEVER_CONFIG`: `minBm25`, `minCosine`, `topK`, `budgetChars`), prompts in `server/src/orchestrate/prompts.ts`.

## Tuning notes

- Slow or truncated answers: lower `budgetChars` or `topK`; smaller context helps a 7B model.
- Too many or silly clarifying questions: tighten `DECIDE_SYSTEM` in `prompts.ts`. Questions are already restricted to conditions found in the retrieved text.
- "No matching rule" too often: lower `minBm25` or `minCosine`.
- Check `server/data/ingest-report.json` for pages that parsed poorly (tables, card text).
