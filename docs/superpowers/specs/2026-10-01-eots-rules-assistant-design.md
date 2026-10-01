# Empire of the Sun Rules Assistant — Design

Date: 2026-10-01

## Goal

A free, local rules assistant for the board game *Empire of the Sun* (GMT Games, rules v2.0). It helps with setup, the sequence of play, special cases ("unless…" conditions) and combat resolution, and cites the rulebook page and section header for every answer so the user can cross-check.

## Constraints

- The LLM is a local ~7B model served by Ollama. It is weak, so the harness (retrieval, prompting, validation) carries most of the quality.
- Must be free to run. No cloud calls.
- The development laptop cannot run Ollama, so nothing LLM-dependent can be tested here. Ingest and retrieval must be testable without an LLM.
- The client is a simple React Native (Expo) mobile app.
- Source: `C:\Users\Niko\Downloads\eotsrulesv2.0.pdf` (48 pages, extractable text, no PDF bookmarks, numbered headings such as `4.4 Deal Strategy Cards Segment`).

## Decisions

| Topic | Decision |
|---|---|
| Hosting | Small Node/TypeScript server on the user's PC next to Ollama. The phone app is a thin client over the LAN. |
| Guided flows | Pure RAG chat. No scripted step skeletons. The harness compensates (see Retrieval, Clarify-then-answer). |
| Game context | No pinned state chips. The assistant asks clarifying questions only when it lacks information, then answers. |
| Retrieval | Hybrid: BM25 + embeddings (`nomic-embed-text` via Ollama) with rank fusion; BM25 alone if embeddings are unavailable. |
| Chunking | Context-dependent: by numbered rule, with parent heading path, page range and cross-references. |

## Architecture

```
eots-assistant/
  server/   Node + TypeScript
    ingest/       PDF -> pages -> section tree -> chunks -> index.json
    retrieve/     BM25 + embeddings + fusion + expansion + budget
    orchestrate/  clarify-then-answer loop, prompts, validation
    llm/          OllamaClient interface (+ mock for tests)
    api/          POST /ask, POST /answer-clarification
  app/      Expo React Native
    chat screen, clarification cards, citation chips, settings (server URL)
```

Units communicate through narrow interfaces: `Chunk[]` from ingest, `retrieve(query, facts) -> RetrievedContext`, `LlmClient.generate(prompt, jsonSchema) -> JSON`. Each is testable on its own.

## Ingest (run once, offline from the app)

1. Extract text per page, keeping page numbers.
2. Strip repeated header/footer lines ("Empire of the Sun (v2.0)", copyright lines).
3. Detect numbered headings (`N.0`, `N.N`, `N.N.N`) to build a section tree.
4. Chunk by section. Long sections split at paragraph or lettered-item boundaries (`A.`, `B.`, …). Every piece keeps its full heading path.
5. Chunk metadata: `id`, `sectionId`, `headingPath`, `pageStart`, `pageEnd`, `text`, `crossRefs[]` (parsed from references like `(11.0)`), `conditionals[]` (sentences containing if / unless / except / only / may not / cannot).
6. Compute embeddings and write `index.json`.
7. Emit an ingest report listing pages or blocks that parsed poorly (tables, card text, maps) so the user can see what is missing.

## Retrieval

1. Optional query rewrite to keywords by the LLM; fallback is the raw query plus session facts.
2. BM25 and embedding search, merged with reciprocal rank fusion.
3. Intent boost: words such as setup, sequence of play, combat, battle, invasion boost the matching top-level sections.
4. Take top ~6 chunks, add sibling and cross-referenced chunks, trim to a ~3k-token budget.
5. If top scores are below a threshold, report "no matching rule found" and show the nearest sections instead of answering.

## Clarify-then-answer loop

1. **Decide.** The model receives the question, session facts and numbered chunks, and returns JSON `{status: "ready" | "need_info", questions: [{text, options[], sourceSectionId}]}`. Questions must be derived from conditionals present in the retrieved chunks (prevents invented questions). Maximum 3 questions.
2. **Ask.** The app shows each question as a card with tappable options (plus "Not sure").
3. **Answer.** The user's answers are stored as session facts, retrieval is rerun with them, and the model returns JSON `{steps[], answer, citations: [{sectionId, quote}]}`.
4. Only one clarification round per question. If still unsure, the model answers and states which condition it assumed.
5. Session facts persist for the conversation so the same thing is not asked twice. Chat history sent to the model is kept short.

## Citation validation

The harness, not the model, guarantees citations. Each cited `sectionId` must be in the retrieved set and each `quote` must appear in that chunk's text. Failures are dropped or marked "unverified". The UI displays page and heading from the chunk metadata (e.g. `§4.4 Deal Strategy Cards Segment · p.6`); tapping a chip opens the full source passage.

## Error handling

- Ollama unreachable or timeout: clear in-app message with the server address being used.
- Malformed JSON: one retry, then fall back to a plain-text answer built from the retrieved chunks.
- Missing embeddings: BM25-only mode with a notice.

## Testing

- Unit tests: heading detection, chunking, cross-reference and conditional extraction against the real PDF (runs on the dev laptop).
- Retrieval tests: ~30 question -> expected-section pairs drafted from the rulebook; extensible.
- Orchestrator and citation validator tested with a mock LLM.
- `npm run eval` on the home machine with real Ollama: retrieval hit rate, clarification rate, citation-validation pass rate.
- App: component tests for the chat and clarification card; manual check on a device.

## Out of scope

- Game-state tracking, scripted step flows, voice input, multi-user, cloud hosting.
- Reading map or card images (text extraction only; poorly parsed content is reported by ingest).

## Risks

- A 7B model may still produce weak answers; mitigated by narrow JSON-schema tasks, grounded questions and citation validation, and measured by `npm run eval`.
- PDF tables or sidebars may chunk badly; surfaced by the ingest report.
- LLM behaviour cannot be verified on the dev laptop; prompts will need tuning on the home machine.
