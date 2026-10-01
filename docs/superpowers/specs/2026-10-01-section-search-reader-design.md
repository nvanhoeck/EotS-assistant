# Section search and reader

## Goal

Add a **Search** mode next to the AI assistant in the mobile app. The user types a query, sees ranked rule sections (best match first), opens one in a clean reader, and can move through the rulebook: subsections, previous/next, and tappable cross-references with a Back option.

## Decisions

- **Server-backed.** Search needs the PC server, like the AI. It reuses the hybrid (BM25 + embedding) retriever so ranking matches the AI's. No offline mode, no rulebook text bundled in the app.
- Retrieval only: no LLM, no session.
- No new navigation library; a small history stack in app state.

## Server

Three read-only endpoints in `server/src/api/app.ts`.

### `GET /search?q=…`
- 400 when `q` is missing or blank.
- Returns `{ results: [{ sectionId, label, headingPath, pageStart, pageEnd, snippet }] }`, best match first, about 15–20 hits.
- New retriever method (e.g. `search(query, limit)`) returning the fused and intent-boosted ranking without the AI's `topK` cut, sub-rule expansion or outline. `lowConfidence` is not exposed: weak matches are still listed.
- Multiple chunks of one section (split parts, duplicate ids) collapse to one result at the best rank.
- `snippet` is the chunk `summary` (fallback: first characters of the text).

### `GET /section/:id`
- 404 for an unknown id.
- Returns `{ sectionId, label, headingPath, pageStart, pageEnd, text, prev, next, children: [{ sectionId, label, summary }], crossRefs: [{ sectionId, label }] }`.
- Split chunks and duplicate ids are merged into one section, text joined in order.
- `prev`/`next` follow `ruleOrder`: siblings under the same parent, falling back to the document-order neighbour at the edges; `null` at the ends of the rulebook.

### `GET /outline` (optional)
Top-level sections, used as the landing list when the search box is empty.

## App

### Mode switch
Segmented **AI | Search** toggle in the header. Chat state is kept when switching.

### Search mode
- Text input, 1s debounce, also searches on submit.
- Stale/in-flight requests are cancelled or ignored so a slow older response never overwrites a newer one.
- Result row: label, heading path (grey), one-line snippet.

### Reader
- Title, breadcrumb path, body text.
- Subsections list, collapsed by default, expands on tap.
- Previous / Next buttons.
- Inline references ("see 4.2", "section 4.2", "(4.2)") are tappable. They are matched only against the section's own `crossRefs`, so stray decimals never become links.

### Navigation
- History stack in state. Tapping a result, subsection or reference pushes. Previous/Next replace the top entry (movement within the document).
- **Back** pops one entry, including the Android hardware back button. Returning to search restores the query, results and scroll position.

## Errors
Unreachable server or unknown section: inline error in the existing chat style; the reader offers a retry.

## Testing
- Server: `/search` ranking and blank-query 400; `/section` prev/next at boundaries, merged split chunks, unknown id 404.
- App: pure-function tests for debounce/stale-response handling, the history-stack reducer and the reference-linking parser (same style as `chatState`). Screens are verified manually.

## Out of scope
Offline use, bookmarks, search history, match highlighting, special handling of tables/maps, opening the reader from AI citation chips.
