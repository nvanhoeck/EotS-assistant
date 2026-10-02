# Section Search and Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Search mode next to the AI assistant in the Expo app: debounced search over the rulebook, a ranked list of sections, and a book-style reader with subsections, previous/next, tappable cross-references and a Back trail.

**Architecture:** The server gains three read-only endpoints (`/search`, `/section/:id`, `/outline`) built on the existing hybrid retriever plus a new `SectionIndex` that merges chunks into one view per section. The app adds an AI|Search toggle, a `SearchScreen`, a `ReaderScreen` and a handful of pure, unit-tested modules (debounce, search reducer, history trail, reference linking, paragraph splitting). No navigation library.

**Tech Stack:** Node 22 + TypeScript (ESM/NodeNext), express 4, vitest, supertest; Expo / React Native 0.86, AsyncStorage.

**Spec:** `docs/superpowers/specs/2026-10-01-section-search-reader-design.md`

## Global Constraints

- Search is server-backed only; no rulebook text is bundled in the app. No new dependencies in `app/` or `server/`.
- Debounce is **1000 ms** after the last keystroke; submit searches immediately.
- `/search` returns about 15–20 hits, best first, **one hit per section**; blank `q` is **400**; no LLM, no session.
- `/section/:id` returns **404** for an unknown id; split chunks (`#n`) and duplicate ids (`~n`) are merged into one section.
- Previous/Next: siblings under the same parent first, falling back to the document-order neighbour; `null` at the ends of the rulebook.
- Back: pops one history entry; Previous/Next **replace** the top entry; Android hardware back is handled; returning to search keeps the query, results and scroll position.
- Reader look: system serif (`Georgia` on iOS, platform `serif` on Android), about 18 pt (three sizes) at 1.5–1.6 line height, left-aligned, column capped at 640 pt and centred, warm paper background, dark theme from the system setting, no cards or borders around the body.
- Text size (three steps) is remembered in AsyncStorage; text is selectable.
- Relative imports in `server/` use the `.js` suffix (NodeNext). Run commands from `C:\Users\Niko\Desktop\eots-assistant` unless a `cd` is shown.
- Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (matches the latest feature commit on this branch; the earlier plan's "no trailer" note predates it).

## Review Focus

Failure modes the spec implies but no obvious task test covers; each has a pinned test in the owning task.

1. A query with no searchable words (`"???"`, `"the of"`): empty list, never a 500 or a random embedding ranking. (Task 1, Task 3; UI shows "No matches".)
2. Non-numeric or unknown section ids (`ERRATA`, `nope`, ids whose parent heading does not exist such as `17.21`): `ERRATA` has no next, unknown is 404, orphans stay reachable from the outline. (Task 2, Task 3)
3. A slow older response arriving after a newer one, or the server going away mid-typing: the newer results win; errors show inline and keep the last results. (Task 5)
4. Cross-reference ids that are prefixes of each other (`4.1` vs `4.11`), followed by punctuation (`see 9.21).`), longer dotted ids (`4.11.5`) or part of a bigger number (`14.11`): only exact ids link. (Task 6)
5. A heading-only section (empty body, e.g. `4.1`) and a very long paragraph with no line breaks: the reader still shows content (children expanded by default) and the text is broken into readable paragraphs; abbreviations like "e.g." are not treated as sentence ends. (Task 6, Task 7)
6. Tapping a link to the section already on top must not stack duplicates. (Task 5)

## File Structure

```
server/
  src/types.ts                       + SectionRef, SectionChild, SectionView, SearchResult
  src/retrieve/retriever.ts          rank() extracted from retrieve(); new search()
  src/library/sections.ts            NEW SectionIndex: section(), outline(), hit()
  src/api/browse.ts                  NEW express Router: /search, /section/:id, /outline
  src/api/app.ts                     createApp(orchestrator, browse?)
  src/bootstrap.ts                   buildRetriever/buildOrchestrator also return chunks
  src/index.ts                       mounts the browse router
  test/retriever.test.ts             + search tests
  test/sections.test.ts              NEW
  test/sections.real.test.ts         NEW (real chunks.json)
  test/browse.test.ts                NEW
app/
  src/types.ts                       + the same shapes
  src/api.ts                         GET helper; search(), section(), outline()
  src/debounce.ts                    NEW
  src/searchState.ts                 NEW reducer with stale-response guard
  src/trail.ts                       NEW history stack helpers
  src/linkify.ts                     NEW splitReferences()
  src/paragraphs.ts                  NEW toParagraphs()
  src/textSize.ts                    NEW sizes + stepSize()
  src/storage.ts                     + loadTextSize/saveTextSize
  src/theme.ts                       NEW palettes, serif font, usePalette()
  src/components/ReaderText.tsx      NEW paragraphs with run-in leads and links
  src/components/ReaderScreen.tsx    NEW
  src/components/SearchScreen.tsx    NEW
  src/components/ModeToggle.tsx      NEW
  App.tsx                            mode toggle, trail, back handler, reader
  test/*.test.ts                     one new file per pure module + api tests
README.md                            Search section
```

---

### Task 1: Retriever.search

**Files:**
- Modify: `server/src/retrieve/retriever.ts` (the start of `retrieve()`)
- Test: `server/test/retriever.test.ts` (append)

**Interfaces:**
- Consumes: existing `Retriever` internals (`bm25`, `embedder`, `vectors`, `cfg`, `chunks`).
- Produces: `Retriever.search(query: string, limit?: number): Promise<Chunk[]>` — best first, at most `limit` (default 20) chunks, **one per `sectionId`**, `[]` when the query has no searchable words. `retrieve()` behaves exactly as before.

- [ ] **Step 1: Write the failing tests** — append to `server/test/retriever.test.ts`:

```ts
describe('Retriever.search', () => {
  const r = new Retriever(chunks);

  it('ranks the best match first', async () => {
    const out = await r.search('air or naval units survive');
    expect(out[0].sectionId).toBe('8.31');
  });
  it('honours the limit', async () => {
    expect((await r.search('units', 1)).length).toBe(1);
    expect((await r.search('units')).length).toBeGreaterThan(1);
  });
  it('returns one hit per section even when a section is split into parts', async () => {
    const parts = [
      mk('5.1', 'alpha beta gamma'),
      mk('5.1', 'alpha beta delta', { id: '5.1#1', part: 1 }),
      mk('6.1', 'unrelated words here'),
    ];
    const out = await new Retriever(parts).search('alpha beta');
    expect(out.map((c) => c.sectionId)).toEqual(['5.1']);
  });
  it('returns nothing for a query without searchable words', async () => {
    expect(await r.search('???')).toEqual([]);
    expect(await r.search('the of')).toEqual([]);
    expect(await r.search('   ')).toEqual([]);
  });
  it('keeps retrieve() unchanged', async () => {
    const out = await r.retrieve('What happens if no air or naval units survive?');
    expect(out.chunks[0].sectionId).toBe('8.31');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd server && npx vitest run test/retriever.test.ts -t "Retriever.search"`
Expected: FAIL — `r.search is not a function`.

- [ ] **Step 3: Implement.** In `server/src/retrieve/retriever.ts` replace the beginning of `retrieve()` (from `async retrieve(` through the `.map(([i]) => this.chunks[i]);` that ends the `ranked` computation) with a shared `rank()` plus the slimmer `retrieve()` and the new `search()`:

```ts
  /** BM25 and (when available) embedding hits fused with RRF, intent-boosted, best first. */
  private async rank(query: string, intentSource: string) {
    const bm = this.bm25.search(tokenize(query), 20);

    let vec: { index: number; score: number }[] = [];
    let mode: Retrieved['mode'] = 'bm25';
    if (this.embedder && this.vectors) {
      try {
        const [qv] = await this.embedder.embed(['search_query: ' + query]);
        vec = topCosine(qv, this.vectors, 20);
        mode = 'hybrid';
      } catch {
        // fall back to BM25 only
      }
    }

    const fused = rrf([bm.map((r) => r.index), vec.map((r) => r.index)]);
    const majors = intentMajors(intentSource);
    const order = [...fused.entries()]
      .map(([i, s]) => [i, majors.has(majorOf(this.chunks[i].sectionId)) ? s * this.cfg.intentBoost : s] as const)
      .sort((a, b) => b[1] - a[1])
      .map(([i]) => i);
    return { order, bm, vec, mode };
  }

  async retrieve(question: string, facts: string[] = []): Promise<Retrieved & { outline: string }> {
    const query = [question, ...facts].join(' ');
    const { order, bm, vec, mode } = await this.rank(query, question);
    const ranked = order.slice(0, this.cfg.topK).map((i) => this.chunks[i]);

    const lowConfidence =
      (bm[0]?.score ?? 0) < this.cfg.minBm25 && (vec[0]?.score ?? 0) < this.cfg.minCosine;

    return { ...this.expand(ranked), lowConfidence, mode };
  }

  /** Flat ranking for the Search screen: one hit per section, no sub-rule or cross-reference expansion. */
  async search(query: string, limit = 20): Promise<Chunk[]> {
    const q = query.trim();
    if (tokenize(q).length === 0) return [];
    const { order } = await this.rank(q, q);
    const seen = new Set<string>();
    const out: Chunk[] = [];
    for (const i of order) {
      const c = this.chunks[i];
      if (seen.has(c.sectionId)) continue;
      seen.add(c.sectionId);
      out.push(c);
      if (out.length === limit) break;
    }
    return out;
  }
```

Delete the old `lowConfidence` / `return` lines that followed the removed block so they are not duplicated.

- [ ] **Step 4: Run the whole server suite**

Run: `cd server && npx vitest run && npx tsc --noEmit`
Expected: all tests pass (previous 97 + 5 new), no type errors.

- [ ] **Step 5: Commit**

```bash
git add server/src/retrieve/retriever.ts server/test/retriever.test.ts
git commit -m "feat(retrieve): add flat per-section search

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: SectionIndex (section view, prev/next, outline)

**Files:**
- Modify: `server/src/types.ts` (append shared shapes)
- Create: `server/src/library/sections.ts`
- Test: `server/test/sections.test.ts`, `server/test/sections.real.test.ts`

**Interfaces:**
- Consumes: `Chunk` (`server/src/types.ts`), `parentId`, `summarize` (`../ingest/chunk.js`), `ruleOrder` (`../retrieve/retriever.js`).
- Produces (types in `server/src/types.ts`):
  ```ts
  export interface SectionRef { sectionId: string; label: string }
  export interface SectionChild extends SectionRef { summary: string }
  export interface SearchResult extends SectionRef {
    headingPath: string[]; pageStart: number; pageEnd: number; snippet: string;
  }
  export interface SectionView extends SectionRef {
    headingPath: string[]; pageStart: number; pageEnd: number;
    title: string | null;      // heading text without its number; null for body rules
    text: string;              // body; for headings the leading label line is removed
    prev: SectionRef | null; next: SectionRef | null;
    children: SectionChild[]; crossRefs: SectionRef[];
  }
  ```
  and `class SectionIndex { constructor(chunks: Chunk[]); section(id: string): SectionView | undefined; outline(): SectionChild[]; hit(chunk: Chunk): SearchResult }`.

Hierarchy uses the **nearest existing ancestor** as parent, because the rulebook skips levels (for example `17.21` exists but `17.2` does not).

- [ ] **Step 1: Add the types** — append to `server/src/types.ts`:

```ts
export interface SectionRef {
  sectionId: string;
  label: string;
}

export interface SectionChild extends SectionRef {
  summary: string;
}

export interface SearchResult extends SectionRef {
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  snippet: string;
}

export interface SectionView extends SectionRef {
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  title: string | null; // heading text without its rule number; null for body rules
  text: string; // body text; for headings the leading label line is removed
  prev: SectionRef | null;
  next: SectionRef | null;
  children: SectionChild[];
  crossRefs: SectionRef[];
}
```

- [ ] **Step 2: Write the failing tests** — `server/test/sections.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SectionIndex } from '../src/library/sections.js';
import type { Chunk } from '../src/types.js';

const mk = (id: string, text: string, extra: Partial<Chunk> = {}): Chunk => ({
  id, sectionId: id, label: id, headingPath: [], pageStart: 5, pageEnd: 5, text, crossRefs: [], conditionals: [], part: 0, ...extra,
});
const L411 = '4.11 Reinforcement Segment Each player receives';
const chunks: Chunk[] = [
  mk('4.0', '4.0 Sequence of Play\nThe sequence is repeated each turn.', { label: '4.0 Sequence of Play' }),
  mk('4.1', '4.1 The Strategic Phase', { label: '4.1 The Strategic Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('4.11', '4.11 Reinforcement Segment Each player receives reinforcements (see 9.0).', {
    label: L411, crossRefs: ['9.0'], pageStart: 6, pageEnd: 6,
    summary: 'Reinforcement Segment Each player receives reinforcements (see 9.0).',
  }),
  mk('4.11', 'It continues here.', { id: '4.11#1', part: 1, label: L411, pageStart: 6, pageEnd: 7 }),
  mk('4.12', '4.12 Replacement Segment Both players may receive replacements.', { label: '4.12 Replacement Segment Both players may' }),
  mk('4.2', '4.2 The Offensives Phase', { label: '4.2 The Offensives Phase', headingPath: ['4.0 Sequence of Play'], summary: '' }),
  mk('9.0', '9.0 Reinforcements\nNew units arrive.', { label: '9.0 Reinforcements' }),
  mk('ERRATA', 'ERRATA Errata and printing notes\nFix one.', { label: 'ERRATA Errata and printing notes' }),
];
const index = new SectionIndex(chunks);

describe('SectionIndex.section', () => {
  it('returns undefined for an unknown id', () => {
    expect(index.section('nope')).toBeUndefined();
  });
  it('merges split parts, pages and cross references of one section', () => {
    const s = index.section('4.11')!;
    expect(s.text).toBe('4.11 Reinforcement Segment Each player receives reinforcements (see 9.0). It continues here.');
    expect(s.pageStart).toBe(6);
    expect(s.pageEnd).toBe(7);
    expect(s.title).toBeNull();
    expect(s.crossRefs).toEqual([{ sectionId: '9.0', label: '9.0 Reinforcements' }]);
  });
  it('turns a heading into title + body without the label line', () => {
    const s = index.section('4.0')!;
    expect(s.title).toBe('Sequence of Play');
    expect(s.text).toBe('The sequence is repeated each turn.');
    expect(s.children.map((c) => c.sectionId)).toEqual(['4.1', '4.2']);
  });
  it('gives a heading-only section an empty body and its children', () => {
    const s = index.section('4.1')!;
    expect(s.title).toBe('The Strategic Phase');
    expect(s.text).toBe('');
    expect(s.headingPath).toEqual(['4.0 Sequence of Play']);
    expect(s.children.map((c) => c.sectionId)).toEqual(['4.11', '4.12']);
    expect(s.children[0].summary).toMatch(/^Reinforcement Segment/);
  });
  it('prefers siblings for prev/next and falls back to the document neighbour at the edges', () => {
    const first = index.section('4.11')!;
    expect(first.prev?.sectionId).toBe('4.1'); // no previous sibling -> parent heading
    expect(first.next?.sectionId).toBe('4.12');
    const last = index.section('4.12')!;
    expect(last.prev?.sectionId).toBe('4.11');
    expect(last.next?.sectionId).toBe('4.2'); // no next sibling -> next in document order
    expect(index.section('4.1')!.next?.sectionId).toBe('4.2');
  });
  it('has no prev before the first section and no next after the last', () => {
    expect(index.section('4.0')!.prev).toBeNull();
    expect(index.section('4.0')!.next?.sectionId).toBe('9.0');
    expect(index.section('ERRATA')!.prev?.sectionId).toBe('9.0');
    expect(index.section('ERRATA')!.next).toBeNull();
  });
  it('attaches a section whose parent heading is missing to its nearest existing ancestor', () => {
    const orphan = new SectionIndex([
      mk('17.0', '17.0 Scenarios\nIntro.', { label: '17.0 Scenarios' }),
      mk('17.21', '17.21 Orphan rule.'),
    ]);
    expect(orphan.section('17.0')!.children.map((c) => c.sectionId)).toEqual(['17.21']);
    expect(orphan.section('17.21')!.prev?.sectionId).toBe('17.0');
  });
});

describe('SectionIndex.outline and hit', () => {
  it('lists the top-level sections in rule order', () => {
    expect(index.outline().map((s) => s.sectionId)).toEqual(['4.0', '9.0', 'ERRATA']);
  });
  it('maps a chunk to a search hit using the section label and the chunk summary', () => {
    expect(index.hit(chunks[2])).toEqual({
      sectionId: '4.11', label: L411, headingPath: [], pageStart: 6, pageEnd: 6,
      snippet: 'Reinforcement Segment Each player receives reinforcements (see 9.0).',
    });
  });
  it('falls back to a computed summary when the chunk has none', () => {
    expect(index.hit(chunks[0]).snippet).toBe('The sequence is repeated each turn.');
  });
});
```

`server/test/sections.real.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadChunks } from '../src/bootstrap.js';
import { config } from '../src/config.js';
import { SectionIndex } from '../src/library/sections.js';

const chunks = loadChunks(path.join(config.dataDir, 'chunks.json'));
const index = new SectionIndex(chunks);
const ids = [...new Set(chunks.map((c) => c.sectionId))];

describe('SectionIndex on the real rulebook', () => {
  it('every section is reachable from the outline through children', () => {
    const seen = new Set<string>();
    const walk = (list: string[]) => {
      for (const id of list) {
        if (seen.has(id)) continue;
        seen.add(id);
        walk(index.section(id)!.children.map((c) => c.sectionId));
      }
    };
    walk(index.outline().map((s) => s.sectionId));
    expect([...seen].sort()).toEqual([...ids].sort());
  });
  it('prev and next always point at an existing section', () => {
    for (const id of ids) {
      const s = index.section(id)!;
      for (const ref of [s.prev, s.next]) if (ref) expect(index.section(ref.sectionId)).toBeDefined();
    }
  });
  it('a heading with a number in its label has a title', () => {
    expect(index.section('4.0')!.title).toBe('Sequence of Play');
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `cd server && npx vitest run test/sections.test.ts test/sections.real.test.ts`
Expected: FAIL — cannot find module `../src/library/sections.js`.

- [ ] **Step 4: Implement** — `server/src/library/sections.ts`:

```ts
import { parentId, summarize } from '../ingest/chunk.js';
import { ruleOrder } from '../retrieve/retriever.js';
import type { Chunk, SearchResult, SectionChild, SectionRef, SectionView } from '../types.js';

/** One entry per rule number: chunks of the same section (split parts, duplicate ids) are merged. */
export class SectionIndex {
  private groups = new Map<string, Chunk[]>();
  private ordered: string[];
  private kids = new Map<string | null, string[]>();

  constructor(chunks: Chunk[]) {
    for (const c of chunks) {
      const g = this.groups.get(c.sectionId) ?? [];
      g.push(c);
      this.groups.set(c.sectionId, g);
    }
    this.ordered = [...this.groups.keys()].sort(ruleOrder);
    for (const id of this.ordered) {
      const p = this.parentOf(id);
      const list = this.kids.get(p) ?? [];
      list.push(id);
      this.kids.set(p, list);
    }
  }

  /** Nearest ancestor that exists as a section (the rulebook skips levels, e.g. 17.21 has no 17.2). */
  private parentOf(id: string): string | null {
    for (let p = parentId(id); p; p = parentId(p)) if (this.groups.has(p)) return p;
    return null;
  }

  private ref(id: string): SectionRef {
    return { sectionId: id, label: this.groups.get(id)![0].label };
  }

  private child(id: string): SectionChild {
    const first = this.groups.get(id)![0];
    return { ...this.ref(id), summary: first.summary ?? summarize(first) };
  }

  section(id: string): SectionView | undefined {
    const group = this.groups.get(id);
    if (!group) return undefined;
    const first = group[0];
    const joined = group.reduce((acc, c) => (acc === '' ? c.text : acc + (c.part > 0 ? ' ' : '\n') + c.text), '');
    const heading = first.text === first.label || first.text.startsWith(first.label + '\n');

    const i = this.ordered.indexOf(id);
    const siblings = this.kids.get(this.parentOf(id)) ?? [];
    const s = siblings.indexOf(id);
    const prevId = siblings[s - 1] ?? this.ordered[i - 1];
    const nextId = siblings[s + 1] ?? this.ordered[i + 1];

    const refs = new Set<string>();
    for (const c of group) for (const r of c.crossRefs) if (r !== id && this.groups.has(r)) refs.add(r);

    return {
      ...this.ref(id),
      headingPath: first.headingPath,
      pageStart: Math.min(...group.map((c) => c.pageStart)),
      pageEnd: Math.max(...group.map((c) => c.pageEnd)),
      title: heading ? first.label.replace(/^\S+\s+/, '') : null,
      text: heading ? joined.slice(first.label.length).trimStart() : joined,
      prev: prevId ? this.ref(prevId) : null,
      next: nextId ? this.ref(nextId) : null,
      children: (this.kids.get(id) ?? []).map((k) => this.child(k)),
      crossRefs: [...refs].map((r) => this.ref(r)),
    };
  }

  /** Top-level sections (1.0, 2.0, ..., ERRATA) for the empty-search landing list. */
  outline(): SectionChild[] {
    return (this.kids.get(null) ?? []).map((id) => this.child(id));
  }

  hit(c: Chunk): SearchResult {
    const first = this.groups.get(c.sectionId)![0];
    return {
      sectionId: c.sectionId,
      label: first.label,
      headingPath: first.headingPath,
      pageStart: c.pageStart,
      pageEnd: c.pageEnd,
      snippet: c.summary ?? summarize(c),
    };
  }
}
```

- [ ] **Step 5: Run to verify pass**

Run: `cd server && npx vitest run test/sections.test.ts test/sections.real.test.ts && npx tsc --noEmit`
Expected: PASS. If the real-data reachability test lists missing ids, fix `parentOf`, not the test.

- [ ] **Step 6: Commit**

```bash
git add server/src/types.ts server/src/library/sections.ts server/test/sections.test.ts server/test/sections.real.test.ts
git commit -m "feat(library): add section index with prev/next, children and cross references

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Browse endpoints and wiring

**Files:**
- Create: `server/src/api/browse.ts`
- Modify: `server/src/api/app.ts`, `server/src/bootstrap.ts`, `server/src/index.ts`
- Test: `server/test/browse.test.ts`

**Interfaces:**
- Consumes: `SectionIndex` (Task 2), `Retriever.search` (Task 1).
- Produces: `interface Searcher { search(query: string, limit?: number): Promise<Chunk[]> }`; `createBrowseRouter(searcher: Searcher, index: SectionIndex): Router`; `createApp(orchestrator, browse?: Router)`; `buildRetriever()` and `buildOrchestrator()` additionally return `chunks: Chunk[]`.
  HTTP: `GET /search?q=` → `{ results: SearchResult[] }` (400 `{error}` when blank); `GET /section/:id` → `SectionView` (404 `{error}`); `GET /outline` → `{ sections: SectionChild[] }`.

- [ ] **Step 1: Write the failing tests** — `server/test/browse.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/api/app.js';
import { createBrowseRouter } from '../src/api/browse.js';
import { SectionIndex } from '../src/library/sections.js';
import { Orchestrator } from '../src/orchestrate/orchestrator.js';
import { SessionStore } from '../src/orchestrate/session.js';
import { MockLlm } from '../src/llm/mock.js';
import type { Chunk } from '../src/types.js';

const mk = (id: string, text: string, extra: Partial<Chunk> = {}): Chunk => ({
  id, sectionId: id, label: id, headingPath: [], pageStart: 5, pageEnd: 5, text, crossRefs: [], conditionals: [], part: 0, ...extra,
});
const chunks: Chunk[] = [
  mk('4.0', '4.0 Sequence of Play\nThe sequence is repeated each turn.', { label: '4.0 Sequence of Play' }),
  mk('4.11', '4.11 Reinforcement Segment Each player receives reinforcements.', { label: '4.11 Reinforcement Segment', summary: 'Each player receives reinforcements.' }),
  mk('9.0', '9.0 Reinforcements\nNew units arrive.', { label: '9.0 Reinforcements' }),
  mk('ERRATA', 'ERRATA Errata and printing notes\nFix one.', { label: 'ERRATA Errata and printing notes' }),
];
const index = new SectionIndex(chunks);
const calls: { q: string; limit?: number }[] = [];
const searcher = {
  search: async (q: string, limit?: number) => {
    calls.push({ q, limit });
    return q === 'nothing' ? [] : [chunks[1], chunks[0]];
  },
};
const orchestrator = new Orchestrator(
  { retrieve: async () => ({ chunks: [], lowConfidence: true, mode: 'bm25' as const }) },
  new MockLlm([]),
  new SessionStore(),
);
const app = () => createApp(orchestrator, createBrowseRouter(searcher, index));

describe('browse API', () => {
  it('GET /search returns ranked hits, best first', async () => {
    const res = await request(app()).get('/search').query({ q: 'reinforcement' });
    expect(res.status).toBe(200);
    expect(res.body.results.map((r: { sectionId: string }) => r.sectionId)).toEqual(['4.11', '4.0']);
    expect(res.body.results[0]).toMatchObject({ label: '4.11 Reinforcement Segment', snippet: 'Each player receives reinforcements.' });
  });
  it('asks the retriever for at most 20 hits and trims the query', async () => {
    calls.length = 0;
    await request(app()).get('/search').query({ q: '  air combat  ' });
    expect(calls).toEqual([{ q: 'air combat', limit: 20 }]);
  });
  it('GET /search with no hits is an empty list, not an error', async () => {
    const res = await request(app()).get('/search').query({ q: 'nothing' });
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });
  it('GET /search without a usable q is 400', async () => {
    expect((await request(app()).get('/search')).status).toBe(400);
    expect((await request(app()).get('/search').query({ q: '   ' })).status).toBe(400);
  });
  it('GET /section/:id returns the section view', async () => {
    const res = await request(app()).get('/section/4.0');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ sectionId: '4.0', title: 'Sequence of Play', prev: null, next: { sectionId: '9.0' } });
  });
  it('GET /section/ERRATA works and has no next', async () => {
    const res = await request(app()).get('/section/ERRATA');
    expect(res.status).toBe(200);
    expect(res.body.next).toBeNull();
  });
  it('GET /section/:id for an unknown id is 404 with a message', async () => {
    const res = await request(app()).get('/section/99.9');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/99\.9/);
  });
  it('GET /outline lists the top-level sections', async () => {
    const res = await request(app()).get('/outline');
    expect(res.body.sections.map((s: { sectionId: string }) => s.sectionId)).toEqual(['4.0', '9.0', 'ERRATA']);
  });
  it('the browse routes are absent when no router is given', async () => {
    expect((await request(createApp(orchestrator)).get('/outline')).status).toBe(404);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd server && npx vitest run test/browse.test.ts`
Expected: FAIL — cannot find module `../src/api/browse.js`.

- [ ] **Step 3: Implement** — `server/src/api/browse.ts`:

```ts
import { Router } from 'express';
import type { SectionIndex } from '../library/sections.js';
import type { Chunk } from '../types.js';

export interface Searcher {
  search(query: string, limit?: number): Promise<Chunk[]>;
}

const RESULT_LIMIT = 20;
const MAX_QUERY_CHARS = 200;

/** Read-only rulebook browsing for the app's Search mode: no LLM, no session. */
export function createBrowseRouter(searcher: Searcher, index: SectionIndex): Router {
  const router = Router();

  router.get('/search', async (req, res, next) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (!q) return void res.status(400).json({ error: '"q" is required' });
      const hits = await searcher.search(q.slice(0, MAX_QUERY_CHARS), RESULT_LIMIT);
      res.json({ results: hits.map((c) => index.hit(c)) });
    } catch (e) {
      next(e);
    }
  });

  router.get('/section/:id', (req, res) => {
    const section = index.section(req.params.id);
    if (!section) return void res.status(404).json({ error: `No section ${req.params.id}` });
    res.json(section);
  });

  router.get('/outline', (_req, res) => {
    res.json({ sections: index.outline() });
  });

  return router;
}
```

In `server/src/api/app.ts` change the signature and mount the router. Add `type Router` to the express import, i.e. `import express, { type NextFunction, type Request, type Response, type Router } from 'express';`, then:

```ts
export function createApp(orchestrator: Orchestrator, browse?: Router) {
  const app = express();
  app.use(express.json());
  if (browse) app.use(browse);
```

In `server/src/bootstrap.ts`:

```ts
export function buildRetriever(): { retriever: Retriever; chunks: Chunk[]; hybrid: boolean } {
  const chunks = loadChunks(path.join(config.dataDir, 'chunks.json'));
  const vectors = loadEmbeddings(path.join(config.dataDir, 'embeddings.json'), chunks);
  const embedder = vectors ? new OllamaEmbedder(config.ollamaUrl, config.embedModel) : undefined;
  return { retriever: new Retriever(chunks, embedder, vectors), chunks, hybrid: !!vectors };
}

export function buildOrchestrator() {
  const { retriever, chunks, hybrid } = buildRetriever();
  const llm = new OllamaLlm(config.ollamaUrl, config.chatModel);
  return { orchestrator: new Orchestrator(retriever, llm, new SessionStore()), retriever, chunks, hybrid };
}
```

`server/src/index.ts`:

```ts
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
```

- [ ] **Step 4: Run the whole server suite and a live smoke check**

Run: `cd server && npx vitest run && npx tsc --noEmit`
Expected: PASS.

Smoke check against the real data (Ollama is not needed for these routes): start the server in the background with `cd server && PORT=8799 npm start`, then
`curl "http://localhost:8799/search?q=sequence%20of%20play"`, `curl http://localhost:8799/section/4.1`, `curl http://localhost:8799/outline`, `curl -i http://localhost:8799/section/nope`, `curl -i "http://localhost:8799/search?q="`.
Expected: ranked JSON with a "Sequence of Play" section near the top; section 4.1 with children; the outline of top-level sections; 404; 400. Stop the server afterwards.

- [ ] **Step 5: Commit**

```bash
git add server/src/api/browse.ts server/src/api/app.ts server/src/bootstrap.ts server/src/index.ts server/test/browse.test.ts
git commit -m "feat(api): add /search, /section/:id and /outline

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: App types and API client

**Files:**
- Modify: `app/src/types.ts` (append), `app/src/api.ts`
- Test: `app/test/api.test.ts` (append)

**Interfaces:**
- Consumes: the HTTP contract from Task 3.
- Produces: in `app/src/types.ts` the same `SectionRef`, `SectionChild`, `SearchResult`, `SectionView` shapes as the server; `createApi(...)` gains `search(q: string): Promise<SearchResult[]>`, `section(id: string): Promise<SectionView>`, `outline(): Promise<SectionChild[]>`. Existing `ask`/`answerClarification`/`reset` keep working.

- [ ] **Step 1: Write the failing tests** — append inside `describe('createApi', …)` in `app/test/api.test.ts`:

```ts
  it('GETs /search with the query URL-encoded and unwraps results', async () => {
    let seen: any;
    const fake = (async (url: string, init: any) => {
      seen = { url, method: init.method };
      return { ok: true, json: async () => ({ results: [{ sectionId: '4.0' }] }) };
    }) as any;
    const res = await createApi('http://x/', fake).search('air & naval');
    expect(seen).toEqual({ url: 'http://x/search?q=air%20%26%20naval', method: 'GET' });
    expect(res).toEqual([{ sectionId: '4.0' }]);
  });
  it('GETs /section/:id and /outline', async () => {
    const urls: string[] = [];
    const fake = (async (url: string) => {
      urls.push(url);
      return { ok: true, json: async () => (url.endsWith('/outline') ? { sections: [{ sectionId: '1.0' }] } : { sectionId: 'ERRATA' }) };
    }) as any;
    const api = createApi('http://x', fake);
    expect((await api.section('ERRATA')).sectionId).toBe('ERRATA');
    expect(await api.outline()).toEqual([{ sectionId: '1.0' }]);
    expect(urls).toEqual(['http://x/section/ERRATA', 'http://x/outline']);
  });
  it('surfaces a 404 message from /section', async () => {
    const fake = (async () => ({ ok: false, status: 404, json: async () => ({ error: 'No section 99.9' }) })) as any;
    await expect(createApi('http://x', fake).section('99.9')).rejects.toThrow('No section 99.9');
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `cd app && npx vitest run test/api.test.ts`
Expected: FAIL — `search is not a function`.

- [ ] **Step 3: Implement.** Append to `app/src/types.ts`:

```ts
export interface SectionRef {
  sectionId: string;
  label: string;
}
export interface SectionChild extends SectionRef {
  summary: string;
}
export interface SearchResult extends SectionRef {
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  snippet: string;
}
export interface SectionView extends SectionRef {
  headingPath: string[];
  pageStart: number;
  pageEnd: number;
  title: string | null;
  text: string;
  prev: SectionRef | null;
  next: SectionRef | null;
  children: SectionChild[];
  crossRefs: SectionRef[];
}
```

Replace `app/src/api.ts` with:

```ts
import type { AskResult, SearchResult, SectionChild, SectionView } from './types';

export class ApiError extends Error {}

const TIMEOUT_MS = 180_000; // 7B models on CPU can be slow
const READ_TIMEOUT_MS = 20_000; // search and section reads never touch the LLM

export function createApi(baseUrl: string, fetchImpl: typeof fetch = fetch) {
  const root = baseUrl.trim().replace(/\/+$/, '');

  async function request<T>(path: string, init: RequestInit, timeoutMs: number): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetchImpl(root + path, { ...init, signal: controller.signal });
    } catch {
      throw new ApiError(`Cannot reach ${root}. Is the server running, and is your phone on the same Wi-Fi?`);
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `Server error ${res.status}`);
    return data as T;
  }

  const post = <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, TIMEOUT_MS);
  const get = <T>(path: string) => request<T>(path, { method: 'GET' }, READ_TIMEOUT_MS);

  return {
    ask: (sessionId: string, question: string) => post<AskResult>('/ask', { sessionId, question }),
    answerClarification: (sessionId: string, pendingId: string, answers: string[]) =>
      post<AskResult>('/answer-clarification', { sessionId, pendingId, answers }),
    reset: (sessionId: string) => post<{ ok: boolean }>('/reset', { sessionId }),
    search: async (q: string) => (await get<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`)).results,
    section: (id: string) => get<SectionView>(`/section/${encodeURIComponent(id)}`),
    outline: async () => (await get<{ sections: SectionChild[] }>('/outline')).sections,
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd app && npx vitest run && npx tsc --noEmit`
Expected: PASS (11 old + 3 new), no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/src/types.ts app/src/api.ts app/test/api.test.ts
git commit -m "feat(app): add search, section and outline API calls

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Debounce, search state and history trail (pure logic)

**Files:**
- Create: `app/src/debounce.ts`, `app/src/searchState.ts`, `app/src/trail.ts`
- Test: `app/test/debounce.test.ts`, `app/test/searchState.test.ts`, `app/test/trail.test.ts`

**Interfaces:**
- Consumes: `SearchResult`, `SectionRef` (Task 4).
- Produces:
  - `debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number): ((...a: A) => void) & { cancel(): void; flush(): void }`
  - `SearchState = { query: string; status: 'idle'|'loading'|'done'|'error'; results: SearchResult[]; error?: string }`, `initialSearchState`, `reduceSearch(state, action)` with actions `typed | started | loaded | failed` (each of the last three carries the `query` it was issued for and is ignored when it no longer matches the current trimmed query).
  - `Trail = SectionRef[]`; `openSection(trail, ref)`, `stepSection(trail, ref)`, `backFrom(trail)`, `backLabel(trail)`.

- [ ] **Step 1: Write the failing tests.**

`app/test/debounce.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { debounce } from '../src/debounce';

afterEach(() => vi.useRealTimers());

describe('debounce', () => {
  it('fires once, 1s after the last call, with the last arguments', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 1000);
    d('a');
    vi.advanceTimersByTime(999);
    d('ab');
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('ab');
  });
  it('cancel drops the pending call', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 1000);
    d('a');
    d.cancel();
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });
  it('flush runs the pending call immediately, once', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 1000);
    d('a');
    d.flush();
    d.flush();
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });
});
```

`app/test/searchState.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { initialSearchState, reduceSearch, type SearchState } from '../src/searchState';
import type { SearchResult } from '../src/types';

const hit = (id: string): SearchResult => ({ sectionId: id, label: id, headingPath: [], pageStart: 1, pageEnd: 1, snippet: '' });
const ids = (s: SearchState) => s.results.map((r) => r.sectionId);

describe('search reducer', () => {
  it('typing keeps the previous results visible but is no longer "done"', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air' });
    s = reduceSearch(s, { type: 'started', query: 'air' });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('8.0')] });
    expect(s.status).toBe('done');
    s = reduceSearch(s, { type: 'typed', query: 'air c' });
    expect(ids(s)).toEqual(['8.0']);
    expect(s.status).toBe('idle');
  });
  it('clearing the box clears results and error', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air' });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('8.0')] });
    s = reduceSearch(s, { type: 'typed', query: '   ' });
    expect(s).toMatchObject({ status: 'idle', results: [] });
  });
  it('ignores a slow response for an older query', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air' });
    s = reduceSearch(s, { type: 'started', query: 'air' });
    s = reduceSearch(s, { type: 'typed', query: 'air combat' });
    s = reduceSearch(s, { type: 'started', query: 'air combat' });
    s = reduceSearch(s, { type: 'loaded', query: 'air combat', results: [hit('8.0')] });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('1.0')] });
    expect(ids(s)).toEqual(['8.0']);
    expect(s.status).toBe('done');
  });
  it('ignores a late response after the box was cleared', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air' });
    s = reduceSearch(s, { type: 'started', query: 'air' });
    s = reduceSearch(s, { type: 'typed', query: '' });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('1.0')] });
    expect(s.results).toEqual([]);
  });
  it('compares queries after trimming', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air ' });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('8.0')] });
    expect(ids(s)).toEqual(['8.0']);
  });
  it('a failure keeps the last results and records the message; a stale failure is ignored', () => {
    let s = reduceSearch(initialSearchState, { type: 'typed', query: 'air' });
    s = reduceSearch(s, { type: 'loaded', query: 'air', results: [hit('8.0')] });
    s = reduceSearch(s, { type: 'typed', query: 'air c' });
    s = reduceSearch(s, { type: 'failed', query: 'air', message: 'old' });
    expect(s.status).toBe('idle');
    s = reduceSearch(s, { type: 'failed', query: 'air c', message: 'Cannot reach http://x' });
    expect(s).toMatchObject({ status: 'error', error: 'Cannot reach http://x' });
    expect(ids(s)).toEqual(['8.0']);
  });
});
```

`app/test/trail.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { backFrom, backLabel, openSection, stepSection } from '../src/trail';

const a = { sectionId: '4.0', label: '4.0 Sequence of Play' };
const b = { sectionId: '4.1', label: '4.1 The Strategic Phase' };
const c = { sectionId: '9.0', label: '9.0 Reinforcements' };

describe('trail', () => {
  it('open pushes; opening the section already on top does nothing', () => {
    expect(openSection([], a)).toEqual([a]);
    expect(openSection([a], b)).toEqual([a, b]);
    expect(openSection([a, b], b)).toEqual([a, b]);
  });
  it('step replaces the top entry (previous/next stay in place in the history)', () => {
    expect(stepSection([a, b], c)).toEqual([a, c]);
    expect(stepSection([], c)).toEqual([c]);
  });
  it('back pops one entry and ends up empty (the search list)', () => {
    expect(backFrom([a, b])).toEqual([a]);
    expect(backFrom([a])).toEqual([]);
    expect(backFrom([])).toEqual([]);
  });
  it('back label names where Back leads', () => {
    expect(backLabel([a])).toBe('Back to results');
    expect(backLabel([a, b])).toBe('Back to 4.0 Sequence of Play');
  });
  it('following a reference then stepping then going back returns to where the reference was tapped', () => {
    let t = openSection([], a); // opened from search
    t = openSection(t, c); // tapped "see 9.0"
    t = stepSection(t, b); // pressed Next inside 9.0's slot
    expect(backFrom(t)).toEqual([a]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd app && npx vitest run test/debounce.test.ts test/searchState.test.ts test/trail.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement.**

`app/src/debounce.ts`:

```ts
export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel(): void; flush(): void };

/** Calls fn with the last arguments once `ms` has passed without another call. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const run = () => {
    timer = undefined;
    const args = pending;
    pending = undefined;
    if (args) fn(...args);
  };

  const debounced = ((...args: A) => {
    pending = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, ms);
  }) as Debounced<A>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  debounced.flush = () => {
    if (!timer) return;
    clearTimeout(timer);
    run();
  };
  return debounced;
}
```

`app/src/searchState.ts`:

```ts
import type { SearchResult } from './types';

export interface SearchState {
  query: string;
  status: 'idle' | 'loading' | 'done' | 'error';
  results: SearchResult[];
  error?: string;
}

export type SearchAction =
  | { type: 'typed'; query: string }
  | { type: 'started'; query: string }
  | { type: 'loaded'; query: string; results: SearchResult[] }
  | { type: 'failed'; query: string; message: string };

export const initialSearchState: SearchState = { query: '', status: 'idle', results: [] };

/** Responses carry the query they were issued for; anything that no longer matches the box is ignored. */
export function reduceSearch(state: SearchState, action: SearchAction): SearchState {
  if (action.type === 'typed') {
    if (action.query.trim() === '') return { query: action.query, status: 'idle', results: [] };
    return { ...state, query: action.query, status: 'idle', error: undefined };
  }
  if (action.query.trim() !== state.query.trim()) return state;
  switch (action.type) {
    case 'started':
      return { ...state, status: 'loading', error: undefined };
    case 'loaded':
      return { ...state, status: 'done', results: action.results, error: undefined };
    case 'failed':
      return { ...state, status: 'error', error: action.message };
  }
}
```

`app/src/trail.ts`:

```ts
import type { SectionRef } from './types';

/** Reader history, oldest first. Empty means the search list is showing. */
export type Trail = SectionRef[];

export function openSection(trail: Trail, ref: SectionRef): Trail {
  return trail[trail.length - 1]?.sectionId === ref.sectionId ? trail : [...trail, ref];
}

/** Previous/Next move within the document, so they replace the current entry instead of stacking. */
export function stepSection(trail: Trail, ref: SectionRef): Trail {
  return trail.length === 0 ? [ref] : [...trail.slice(0, -1), ref];
}

export function backFrom(trail: Trail): Trail {
  return trail.slice(0, -1);
}

export function backLabel(trail: Trail): string {
  return trail.length >= 2 ? `Back to ${trail[trail.length - 2].label}` : 'Back to results';
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd app && npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/debounce.ts app/src/searchState.ts app/src/trail.ts app/test/debounce.test.ts app/test/searchState.test.ts app/test/trail.test.ts
git commit -m "feat(app): add debounce, search reducer and reader history trail

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Reference links, paragraphs and text size (pure logic)

**Files:**
- Create: `app/src/linkify.ts`, `app/src/paragraphs.ts`, `app/src/textSize.ts`
- Modify: `app/src/storage.ts`
- Test: `app/test/linkify.test.ts`, `app/test/paragraphs.test.ts`, `app/test/textSize.test.ts`

**Interfaces:**
- Produces:
  - `splitReferences(text: string, refs: string[]): { text: string; ref?: string }[]` — `ref` is set on segments that are a tappable exact rule id from `refs`.
  - `toParagraphs(text: string): { lead: string | null; text: string }[]` — `lead` is a leading rule number such as `4.11`.
  - `TEXT_SIZES = [16, 18, 21]`, `DEFAULT_SIZE_INDEX = 1`, `stepSize(index: number, delta: -1 | 1): number`.
  - `loadTextSize(): Promise<number>`, `saveTextSize(index: number): Promise<void>`.
- Avoids regex lookbehind (older Hermes) by capturing the preceding character instead.

- [ ] **Step 1: Write the failing tests.**

`app/test/linkify.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { splitReferences } from '../src/linkify';

const refs = (s: ReturnType<typeof splitReferences>) => s.filter((x) => x.ref).map((x) => x.ref);
const rejoin = (s: ReturnType<typeof splitReferences>) => s.map((x) => x.text).join('');

describe('splitReferences', () => {
  it('links known ids and keeps all the text', () => {
    const text = 'Allied reinforcements (WIE, see 9.21), then section 7.35.';
    const out = splitReferences(text, ['9.21', '7.35']);
    expect(refs(out)).toEqual(['9.21', '7.35']);
    expect(rejoin(out)).toBe(text);
  });
  it('does not confuse ids that are prefixes of each other', () => {
    const text = 'see 4.11 and 4.1.';
    const out = splitReferences(text, ['4.1', '4.11']);
    expect(refs(out)).toEqual(['4.11', '4.1']);
    expect(rejoin(out)).toBe(text);
  });
  it('ignores numbers that merely contain a known id', () => {
    expect(refs(splitReferences('page 14.11 and 4.11.5 and 4.110', ['4.11']))).toEqual([]);
  });
  it('links consecutive ids and ids at the start or end of the text', () => {
    const out = splitReferences('9.21, 9.22/9.23', ['9.21', '9.22', '9.23']);
    expect(refs(out)).toEqual(['9.21', '9.22', '9.23']);
    expect(out[0]).toEqual({ text: '9.21', ref: '9.21' });
  });
  it('links lettered sub-rule ids', () => {
    expect(refs(splitReferences('see 9.21.A for details', ['9.21', '9.21.A']))).toEqual(['9.21.A']);
  });
  it('returns plain text when there is nothing to link', () => {
    expect(splitReferences('no refs here 4.11', [])).toEqual([{ text: 'no refs here 4.11' }]);
    expect(splitReferences('', ['4.11'])).toEqual([]);
  });
});
```

`app/test/paragraphs.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { toParagraphs } from '../src/paragraphs';

describe('toParagraphs', () => {
  it('splits on line breaks and drops empties', () => {
    expect(toParagraphs('First part.\n\nSecond part.\n')).toEqual([
      { lead: null, text: 'First part.' },
      { lead: null, text: 'Second part.' },
    ]);
  });
  it('pulls a leading rule number out as the run-in lead', () => {
    expect(toParagraphs('4.11 Reinforcement Segment Each player receives units.')).toEqual([
      { lead: '4.11', text: 'Reinforcement Segment Each player receives units.' },
    ]);
    expect(toParagraphs('9.21.A Lettered rule.')[0].lead).toBe('9.21.A');
  });
  it('does not treat a decimal in the middle of the text as a lead', () => {
    expect(toParagraphs('Roll 4.5 times.')).toEqual([{ lead: null, text: 'Roll 4.5 times.' }]);
  });
  it('collapses hard-wrapped whitespace inside a paragraph', () => {
    expect(toParagraphs('one   two\tthree')).toEqual([{ lead: null, text: 'one two three' }]);
  });
  it('breaks a very long paragraph at sentence ends without losing text', () => {
    const text = Array.from({ length: 30 }, (_, i) => `This is sentence number ${i + 1}.`).join(' ');
    const out = toParagraphs(text);
    expect(out.length).toBeGreaterThan(1);
    expect(out.every((p) => p.text.length <= 500 && p.text.endsWith('.'))).toBe(true);
    expect(out.map((p) => p.text).join(' ')).toBe(text);
  });
  it('does not split after abbreviations such as e.g. or U.S.', () => {
    const filler = Array.from({ length: 20 }, (_, i) => `Filler sentence number ${i + 1}.`).join(' ');
    const text = `${filler} Units move, e.g. Japanese naval units. The U.S. Navy may react.`;
    const joined = toParagraphs(text).map((p) => p.text);
    expect(joined.some((p) => p.includes('e.g. Japanese'))).toBe(true);
    expect(joined.some((p) => p.includes('U.S. Navy'))).toBe(true);
  });
  it('returns nothing for empty text', () => {
    expect(toParagraphs('')).toEqual([]);
    expect(toParagraphs(' \n ')).toEqual([]);
  });
});
```

`app/test/textSize.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_SIZE_INDEX, TEXT_SIZES, stepSize } from '../src/textSize';

describe('text size', () => {
  it('has three steps and defaults to the middle (about 18pt)', () => {
    expect(TEXT_SIZES).toHaveLength(3);
    expect(TEXT_SIZES[DEFAULT_SIZE_INDEX]).toBe(18);
  });
  it('steps within bounds', () => {
    expect(stepSize(1, 1)).toBe(2);
    expect(stepSize(2, 1)).toBe(2);
    expect(stepSize(1, -1)).toBe(0);
    expect(stepSize(0, -1)).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd app && npx vitest run test/linkify.test.ts test/paragraphs.test.ts test/textSize.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement.**

`app/src/linkify.ts`:

```ts
export interface Segment {
  text: string;
  ref?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Splits text into plain and tappable parts. Only ids in `refs` become links, and only as whole rule numbers:
 * not inside a bigger number (14.11), not followed by more digits or a further ".x" (4.110, 4.11.5).
 */
export function splitReferences(text: string, refs: string[]): Segment[] {
  if (text === '') return [];
  const ids = [...new Set(refs)].sort((a, b) => b.length - a.length);
  if (ids.length === 0) return [{ text }];
  // Group 1 is the character before the id (no lookbehind, for older Hermes engines).
  const re = new RegExp(`(^|[^\\w.])(${ids.map(escape).join('|')})(?!\\w|\\.\\w)`, 'g');
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index! + m[1].length;
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ text: m[2], ref: m[2] });
    last = start + m[2].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
```

`app/src/paragraphs.ts`:

```ts
export interface Paragraph {
  lead: string | null; // a leading rule number such as "4.11", shown as a bold run-in
  text: string;
}

const LEAD = /^(\d{1,2}\.\d{1,3}(?:\.[A-Z0-9]{1,2})?)\s+([\s\S]*)$/;
const LONG = 600; // paragraphs up to this length are left alone
const TARGET = 420; // longer ones are re-wrapped into pieces of about this size

/** Sentence pieces; a full stop inside a token such as "e.g." or "U.S." is not a sentence end. */
function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  const re = /[.!?]\s+(?=[A-Z(])/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const end = m.index + 1;
    const token = text.slice(start, end).split(/\s+/).pop() ?? '';
    if (/[A-Za-z]\.[A-Za-z]/.test(token)) continue;
    out.push(text.slice(start, end));
    start = m.index + m[0].length;
  }
  out.push(text.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

function wrap(text: string): string[] {
  if (text.length <= LONG) return [text];
  const out: string[] = [];
  let current = '';
  for (const s of sentences(text)) {
    if (current && current.length + s.length + 1 > TARGET) {
      out.push(current);
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) out.push(current);
  return out;
}

export function toParagraphs(text: string): Paragraph[] {
  const out: Paragraph[] = [];
  for (const raw of text.split(/\n+/)) {
    const flat = raw.replace(/\s+/g, ' ').trim();
    if (!flat) continue;
    wrap(flat).forEach((piece, i) => {
      const m = i === 0 ? LEAD.exec(piece) : null;
      out.push(m ? { lead: m[1], text: m[2] } : { lead: null, text: piece });
    });
  }
  return out;
}
```

`app/src/textSize.ts`:

```ts
export const TEXT_SIZES = [16, 18, 21] as const;
export const DEFAULT_SIZE_INDEX = 1;

export function stepSize(index: number, delta: -1 | 1): number {
  return Math.min(TEXT_SIZES.length - 1, Math.max(0, index + delta));
}
```

In `app/src/storage.ts` add at the top `import { DEFAULT_SIZE_INDEX, TEXT_SIZES } from './textSize';`, a key `const SIZE_KEY = 'eots.textSize';` and:

```ts
export async function loadTextSize(): Promise<number> {
  const raw = await AsyncStorage.getItem(SIZE_KEY);
  if (raw == null) return DEFAULT_SIZE_INDEX;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n < TEXT_SIZES.length ? n : DEFAULT_SIZE_INDEX;
}
export async function saveTextSize(index: number): Promise<void> {
  await AsyncStorage.setItem(SIZE_KEY, String(index));
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd app && npx vitest run && npx tsc --noEmit`
Expected: PASS. If the abbreviation or long-paragraph test fails, fix `sentences()`/`wrap()` rather than weakening the test.

- [ ] **Step 5: Commit**

```bash
git add app/src/linkify.ts app/src/paragraphs.ts app/src/textSize.ts app/src/storage.ts app/test/linkify.test.ts app/test/paragraphs.test.ts app/test/textSize.test.ts
git commit -m "feat(app): add reference linking, paragraph splitting and text size

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Theme and the book-style reader

**Files:**
- Create: `app/src/theme.ts`, `app/src/components/ReaderText.tsx`, `app/src/components/ReaderScreen.tsx`

**Interfaces:**
- Consumes: `createApi` return type (Task 4), `toParagraphs`, `splitReferences`, `TEXT_SIZES` (Task 6), `SectionRef`, `SectionView`.
- Produces: `usePalette(): Palette`, `serif: string`; `<ReaderScreen api entry backText sizeIndex onBack onOpen onStep onSize />` where `onOpen(ref: SectionRef)` is used for references and subsections, `onStep(ref)` for Previous/Next, `onSize(delta: -1 | 1)` for A−/A+.

These are screens; the repo tests only pure logic, so the check is typecheck now and the manual run in Task 8.

- [ ] **Step 1: Create `app/src/theme.ts`:**

```ts
import { Platform, useColorScheme } from 'react-native';

export interface Palette {
  page: string; // paper
  ink: string; // body text
  muted: string; // breadcrumb, page numbers, summaries
  rule: string; // hairlines
  accent: string; // rule numbers and links
  bar: string; // top and bottom bars
}

const paper: Palette = { page: '#f6efe0', ink: '#2b2418', muted: '#8a7d66', rule: '#d9ccb0', accent: '#8a3b12', bar: '#efe6d0' };
const night: Palette = { page: '#1d1a15', ink: '#e6dcc6', muted: '#9c917b', rule: '#3a3428', accent: '#e0955c', bar: '#252118' };

/** System serif: no font dependency. */
export const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? night : paper;
}
```

- [ ] **Step 2: Create `app/src/components/ReaderText.tsx`:**

```tsx
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { splitReferences } from '../linkify';
import type { Paragraph } from '../paragraphs';
import { serif, usePalette } from '../theme';
import type { SectionRef } from '../types';

interface Props {
  paragraphs: Paragraph[];
  refs: SectionRef[];
  size: number;
  onOpen(ref: SectionRef): void;
}

/** Body text set like a page: spaced paragraphs, bold run-in rule numbers, underlined cross-references. */
export function ReaderText({ paragraphs, refs, size, onOpen }: Props) {
  const pal = usePalette();
  const byId = useMemo(() => new Map(refs.map((r) => [r.sectionId, r])), [refs]);
  const ids = useMemo(() => refs.map((r) => r.sectionId), [refs]);

  return (
    <View>
      {paragraphs.map((p, i) => (
        <Text
          key={i}
          selectable
          style={{
            fontFamily: serif,
            fontSize: size,
            lineHeight: Math.round(size * 1.55),
            color: pal.ink,
            textAlign: 'left',
            marginBottom: Math.round(size * 0.9),
          }}
        >
          {p.lead !== null && <Text style={{ fontWeight: '700' }}>{p.lead}{'  '}</Text>}
          {splitReferences(p.text, ids).map((s, j) =>
            s.ref ? (
              <Text
                key={j}
                style={{ color: pal.accent, textDecorationLine: 'underline' }}
                onPress={() => onOpen(byId.get(s.ref!)!)}
              >
                {s.text}
              </Text>
            ) : (
              s.text
            ),
          )}
        </Text>
      ))}
    </View>
  );
}
```

- [ ] **Step 3: Create `app/src/components/ReaderScreen.tsx`:**

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { createApi } from '../api';
import { toParagraphs } from '../paragraphs';
import { TEXT_SIZES } from '../textSize';
import { serif, usePalette } from '../theme';
import type { SectionRef, SectionView } from '../types';
import { ReaderText } from './ReaderText';

type Api = ReturnType<typeof createApi>;

interface Props {
  api: Api;
  entry: SectionRef;
  backText: string;
  sizeIndex: number;
  onBack(): void;
  onOpen(ref: SectionRef): void;
  onStep(ref: SectionRef): void;
  onSize(delta: -1 | 1): void;
}

function pages(v: SectionView): string {
  return v.pageStart === v.pageEnd ? `p. ${v.pageStart}` : `pp. ${v.pageStart}–${v.pageEnd}`;
}

export function ReaderScreen({ api, entry, backText, sizeIndex, onBack, onOpen, onStep, onSize }: Props) {
  const pal = usePalette();
  const [view, setView] = useState<SectionView>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [showKids, setShowKids] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let live = true;
    setView(undefined);
    setError(undefined);
    api.section(entry.sectionId).then(
      (v) => {
        if (!live) return;
        setView(v);
        setShowKids(v.text.trim() === ''); // a bare heading would otherwise be an empty page
        scroll.current?.scrollTo({ y: 0, animated: false });
        fade.setValue(0);
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      },
      (e: Error) => {
        if (live) setError(e.message);
      },
    );
    return () => {
      live = false;
    };
  }, [api, entry.sectionId, attempt, fade]);

  const paragraphs = useMemo(() => toParagraphs(view?.text ?? ''), [view]);
  const size = TEXT_SIZES[sizeIndex];

  return (
    <View style={[styles.fill, { backgroundColor: pal.page }]}>
      <View style={[styles.topBar, { backgroundColor: pal.bar, borderColor: pal.rule }]}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backWrap}>
          <Text style={[styles.back, { color: pal.accent }]} numberOfLines={1}>
            ‹ {backText}
          </Text>
        </Pressable>
        {view && <Text style={[styles.page, { color: pal.muted }]}>{pages(view)}</Text>}
        <Pressable onPress={() => onSize(-1)} hitSlop={8}>
          <Text style={[styles.size, { color: pal.ink, opacity: sizeIndex === 0 ? 0.3 : 1 }]}>A−</Text>
        </Pressable>
        <Pressable onPress={() => onSize(1)} hitSlop={8}>
          <Text style={[styles.size, styles.sizeBig, { color: pal.ink, opacity: sizeIndex === TEXT_SIZES.length - 1 ? 0.3 : 1 }]}>A+</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: pal.ink, fontFamily: serif }]}>{error}</Text>
          <Pressable onPress={() => setAttempt((n) => n + 1)} style={[styles.retry, { borderColor: pal.accent }]}>
            <Text style={{ color: pal.accent, fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      ) : !view ? (
        <ActivityIndicator style={styles.spin} color={pal.accent} />
      ) : (
        <>
          <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
            <Animated.View style={[styles.column, { opacity: fade }]}>
              <Text style={[styles.eyebrow, { color: pal.accent, fontFamily: serif }]}>{view.sectionId}</Text>
              {view.title !== null && (
                <Text selectable style={[styles.title, { color: pal.ink, fontFamily: serif }]}>
                  {view.title}
                </Text>
              )}
              {view.headingPath.length > 0 && (
                <Text style={[styles.crumbs, { color: pal.muted }]}>{view.headingPath.join('  ›  ')}</Text>
              )}
              <View style={[styles.hair, { backgroundColor: pal.rule }]} />

              <ReaderText paragraphs={paragraphs} refs={view.crossRefs} size={size} onOpen={onOpen} />

              {view.children.length > 0 && (
                <View style={styles.kids}>
                  <Pressable onPress={() => setShowKids((v) => !v)} style={styles.kidsHead}>
                    <Text style={[styles.kidsTitle, { color: pal.ink, fontFamily: serif }]}>
                      Subsections ({view.children.length}) {showKids ? '▾' : '▸'}
                    </Text>
                  </Pressable>
                  {showKids &&
                    view.children.map((k) => (
                      <Pressable
                        key={k.sectionId}
                        onPress={() => onOpen({ sectionId: k.sectionId, label: k.label })}
                        style={[styles.kid, { borderColor: pal.rule }]}
                      >
                        <View style={styles.fill}>
                          <Text numberOfLines={1} style={{ color: pal.ink, fontFamily: serif, fontSize: 16, fontWeight: '600' }}>
                            {k.label}
                          </Text>
                          {k.summary !== '' && (
                            <Text numberOfLines={2} style={{ color: pal.muted, fontSize: 13, marginTop: 2 }}>
                              {k.summary}
                            </Text>
                          )}
                        </View>
                        <Text style={{ color: pal.muted, fontSize: 22, marginLeft: 8 }}>›</Text>
                      </Pressable>
                    ))}
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.nav, { backgroundColor: pal.bar, borderColor: pal.rule }]}>
            <Pressable
              disabled={!view.prev}
              onPress={() => view.prev && onStep(view.prev)}
              style={[styles.navBtn, !view.prev && styles.dim]}
            >
              <Text numberOfLines={1} style={{ color: pal.accent, fontFamily: serif }}>
                ‹ {view.prev?.label ?? ''}
              </Text>
            </Pressable>
            <Pressable
              disabled={!view.next}
              onPress={() => view.next && onStep(view.next)}
              style={[styles.navBtn, styles.navNext, !view.next && styles.dim]}
            >
              <Text numberOfLines={1} style={{ color: pal.accent, fontFamily: serif, textAlign: 'right' }}>
                {view.next?.label ?? ''} ›
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  backWrap: { flex: 1 },
  back: { fontSize: 15, fontWeight: '600' },
  page: { fontSize: 13 },
  size: { fontSize: 15, fontWeight: '600' },
  sizeBig: { fontSize: 19 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, textAlign: 'center' },
  retry: { marginTop: 16, borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  spin: { marginTop: 40 },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 640 },
  eyebrow: { fontSize: 13, letterSpacing: 2, fontVariant: ['small-caps'] },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700', marginTop: 6 },
  crumbs: { fontSize: 12, marginTop: 8 },
  hair: { height: 1, width: 48, marginVertical: 20 },
  kids: { marginTop: 12 },
  kidsHead: { paddingVertical: 10 },
  kidsTitle: { fontSize: 17, fontWeight: '700' },
  kid: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1 },
  nav: { flexDirection: 'row', borderTopWidth: 1 },
  navBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 16 },
  navNext: { alignItems: 'flex-end' },
  dim: { opacity: 0.3 },
});
```

- [ ] **Step 4: Typecheck**

Run: `cd app && npx tsc --noEmit`
Expected: no errors. (`Platform.select` with a `default` returns `string`; if the installed typings make `serif` possibly `undefined`, change it to `Platform.select({ ios: 'Georgia', default: 'serif' }) ?? 'serif'`.)

- [ ] **Step 5: Commit**

```bash
git add app/src/theme.ts app/src/components/ReaderText.tsx app/src/components/ReaderScreen.tsx
git commit -m "feat(app): add the book-style section reader

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Search screen, AI | Search toggle and wiring

**Files:**
- Create: `app/src/components/SearchScreen.tsx`, `app/src/components/ModeToggle.tsx`
- Modify: `app/App.tsx` (replace), `README.md`

**Interfaces:**
- Consumes: everything above. `SearchScreen` props: `{ api: Api; onOpen(ref: SectionRef): void }`. `ModeToggle` props: `{ mode: 'ai' | 'search'; onChange(mode: 'ai' | 'search'): void }`.
- Produces: the finished feature.

- [ ] **Step 1: Create `app/src/components/ModeToggle.tsx`:**

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type Mode = 'ai' | 'search';

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange(mode: Mode): void }) {
  return (
    <View style={styles.wrap}>
      {(['ai', 'search'] as const).map((m) => (
        <Pressable key={m} onPress={() => onChange(m)} style={[styles.seg, mode === m && styles.on]}>
          <Text style={[styles.text, mode === m && styles.textOn]}>{m === 'ai' ? 'AI' : 'Search'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 10, padding: 3, marginHorizontal: 12, marginVertical: 8 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  on: { backgroundColor: '#1e3a8a' },
  text: { fontWeight: '600', color: '#374151' },
  textOn: { color: '#fff' },
});
```

- [ ] **Step 2: Create `app/src/components/SearchScreen.tsx`:**

```tsx
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { createApi } from '../api';
import { debounce } from '../debounce';
import { initialSearchState, reduceSearch } from '../searchState';
import type { SearchResult, SectionChild, SectionRef } from '../types';

type Api = ReturnType<typeof createApi>;

export const SEARCH_DEBOUNCE_MS = 1000;

interface Row {
  sectionId: string;
  label: string;
  path: string;
  text: string;
}
const fromResult = (r: SearchResult): Row => ({ sectionId: r.sectionId, label: r.label, path: r.headingPath.join(' › '), text: r.snippet });
const fromChild = (c: SectionChild): Row => ({ sectionId: c.sectionId, label: c.label, path: '', text: c.summary });

export function SearchScreen({ api, onOpen }: { api: Api; onOpen(ref: SectionRef): void }) {
  const [state, dispatch] = useReducer(reduceSearch, initialSearchState);
  const [outline, setOutline] = useState<SectionChild[]>([]);
  const [outlineError, setOutlineError] = useState<string>();

  useEffect(() => {
    let live = true;
    setOutlineError(undefined);
    api.outline().then(
      (s) => {
        if (live) setOutline(s);
      },
      (e: Error) => {
        if (live) setOutlineError(e.message);
      },
    );
    return () => {
      live = false;
    };
  }, [api]);

  const run = useMemo(
    () =>
      debounce((q: string) => {
        dispatch({ type: 'started', query: q });
        api.search(q).then(
          (results) => dispatch({ type: 'loaded', query: q, results }),
          (e: Error) => dispatch({ type: 'failed', query: q, message: e.message }),
        );
      }, SEARCH_DEBOUNCE_MS),
    [api],
  );
  useEffect(() => () => run.cancel(), [run]);

  function change(text: string) {
    dispatch({ type: 'typed', query: text });
    if (text.trim()) run(text.trim());
    else run.cancel();
  }

  const searching = state.query.trim() !== '';
  const rows = searching ? state.results.map(fromResult) : outline.map(fromChild);

  return (
    <View style={styles.fill}>
      <TextInput
        style={styles.input}
        value={state.query}
        onChangeText={change}
        onSubmitEditing={() => run.flush()}
        placeholder="Search the rules…"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {searching && state.status === 'loading' && <ActivityIndicator style={styles.spin} />}
      {searching && state.status === 'error' && <Text style={styles.error}>{state.error}</Text>}
      {searching && state.status === 'done' && rows.length === 0 && (
        <Text style={styles.empty}>No matches for “{state.query.trim()}”.</Text>
      )}
      {!searching && outlineError && <Text style={styles.error}>{outlineError}</Text>}
      <FlatList
        data={rows}
        keyExtractor={(r) => r.sectionId}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={!searching && rows.length > 0 ? <Text style={styles.hint}>Browse the rulebook, or type to search.</Text> : null}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => onOpen({ sectionId: item.sectionId, label: item.label })} style={styles.row}>
            {searching && index === 0 && <Text style={styles.best}>BEST MATCH</Text>}
            <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
            {item.path !== '' && <Text style={styles.path} numberOfLines={1}>{item.path}</Text>}
            {item.text !== '' && <Text style={styles.snippet} numberOfLines={2}>{item.text}</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginTop: 4, fontSize: 16 },
  spin: { margin: 8 },
  error: { color: '#b91c1c', marginVertical: 8 },
  empty: { color: '#6b7280', marginVertical: 16 },
  hint: { color: '#6b7280', marginVertical: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  best: { color: '#1e3a8a', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  label: { fontSize: 16, fontWeight: '600' },
  path: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  snippet: { color: '#374151', fontSize: 14, marginTop: 4 },
});
```

- [ ] **Step 3: Replace `app/App.tsx`** (the AI chat code is unchanged apart from being moved into the AI pane):

```tsx
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator, BackHandler, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { createApi } from './src/api';
import { initialState, reduce } from './src/chatState';
import { AnswerCard } from './src/components/AnswerCard';
import { ClarificationCard } from './src/components/ClarificationCard';
import { ModeToggle, type Mode } from './src/components/ModeToggle';
import { ReaderScreen } from './src/components/ReaderScreen';
import { SearchScreen } from './src/components/SearchScreen';
import { loadServerUrl, loadSessionId, loadTextSize, saveServerUrl, saveTextSize } from './src/storage';
import { DEFAULT_SIZE_INDEX, stepSize } from './src/textSize';
import { usePalette } from './src/theme';
import { backFrom, backLabel, openSection, stepSection, type Trail } from './src/trail';

export default function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const [serverUrl, setServerUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('ai');
  const [trail, setTrail] = useState<Trail>([]);
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE_INDEX);
  const list = useRef<FlatList>(null);
  const pal = usePalette();

  useEffect(() => {
    loadServerUrl().then(setServerUrl);
    loadSessionId().then(setSessionId);
    loadTextSize().then(setSizeIndex);
  }, []);

  const reading = mode === 'search' && trail.length > 0;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!reading) return false;
      setTrail(backFrom);
      return true;
    });
    return () => sub.remove();
  }, [reading]);

  const api = useMemo(() => createApi(serverUrl), [serverUrl]);

  async function run(call: () => Promise<import('./src/types').AskResult>) {
    try {
      dispatch({ type: 'result', result: await call() });
    } catch (e) {
      dispatch({ type: 'failed', message: (e as Error).message });
    }
  }

  function send() {
    const text = input.trim();
    if (!text || state.busy || !sessionId) return;
    setInput('');
    dispatch({ type: 'asked', text });
    run(() => api.ask(sessionId, text));
  }

  function submitClarification() {
    if (!state.pending) return;
    const { pendingId, selected } = state.pending;
    dispatch({ type: 'submitted' });
    run(() => api.answerClarification(sessionId, pendingId, selected as string[]));
  }

  async function clearContext() {
    try {
      await api.reset(sessionId);
    } catch {
      // ignore: local state is cleared regardless
    }
    dispatch({ type: 'reset' });
  }

  function changeSize(delta: -1 | 1) {
    const next = stepSize(sizeIndex, delta);
    setSizeIndex(next);
    saveTextSize(next).catch(() => {});
  }

  return (
    <SafeAreaView style={[styles.root, reading && { backgroundColor: pal.page }]}>
      {!reading && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Empire of the Sun Rules</Text>
            <View style={styles.headerButtons}>
              {mode === 'ai' && <Pressable onPress={clearContext}><Text style={styles.link}>Clear</Text></Pressable>}
              <Pressable onPress={() => setShowSettings((v) => !v)}><Text style={styles.link}>Server</Text></Pressable>
            </View>
          </View>
          <ModeToggle mode={mode} onChange={setMode} />
          {showSettings && (
            <View style={styles.settings}>
              <Text>Server address (your PC's LAN IP)</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setServerUrl}
                onEndEditing={() => saveServerUrl(serverUrl)}
              />
            </View>
          )}
        </>
      )}

      <View style={[styles.fill, mode !== 'ai' && styles.hidden]}>
        <FlatList
          ref={list}
          style={styles.list}
          data={state.messages}
          keyExtractor={(_, i) => String(i)}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.hint}>
              Ask about setup, the sequence of play, special cases or combat. For example: "What happens if no air or naval units survive a battle?"
            </Text>
          }
          renderItem={({ item }) =>
            item.kind === 'user' ? (
              <View style={styles.userBubble}><Text style={styles.userText}>{item.text}</Text></View>
            ) : item.kind === 'error' ? (
              <Text style={styles.error}>{item.text}</Text>
            ) : (
              <AnswerCard result={item.result} />
            )
          }
          ListFooterComponent={
            <>
              {state.pending && (
                <ClarificationCard
                  pending={state.pending}
                  disabled={state.busy}
                  onSelect={(index, option) => dispatch({ type: 'select', index, option })}
                  onSubmit={submitClarification}
                />
              )}
              {state.busy && <ActivityIndicator style={{ margin: 12 }} />}
            </>
          }
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask a rules question…"
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Pressable onPress={send} style={[styles.send, state.busy && { opacity: 0.4 }]} disabled={state.busy}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Kept mounted while reading or in AI mode, so the query, results and scroll position survive Back. */}
      <View style={[styles.fill, (mode !== 'search' || reading) && styles.hidden]}>
        <SearchScreen api={api} onOpen={(ref) => setTrail((t) => openSection(t, ref))} />
      </View>

      {reading && (
        <ReaderScreen
          api={api}
          entry={trail[trail.length - 1]}
          backText={backLabel(trail)}
          sizeIndex={sizeIndex}
          onBack={() => setTrail(backFrom)}
          onOpen={(ref) => setTrail((t) => openSection(t, ref))}
          onStep={(ref) => setTrail((t) => stepSection(t, ref))}
          onSize={changeSize}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 32 : 0 },
  fill: { flex: 1 },
  hidden: { display: 'none' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 17, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', gap: 16 },
  link: { color: '#1e3a8a', fontWeight: '600' },
  settings: { padding: 12, backgroundColor: '#f9fafb' },
  list: { flex: 1, paddingHorizontal: 12 },
  hint: { color: '#6b7280', marginTop: 24, lineHeight: 22 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1e3a8a', borderRadius: 12, padding: 10, marginVertical: 6, maxWidth: '85%' },
  userText: { color: '#fff', fontSize: 15 },
  error: { color: '#b91c1c', marginVertical: 8 },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8, borderTopWidth: 1, borderColor: '#e5e7eb' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginTop: 4 },
  send: { backgroundColor: '#1e3a8a', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', marginTop: 4 },
  sendText: { color: '#fff', fontWeight: '600' },
});
```

- [ ] **Step 4: Update `README.md`.** Under the "Phone app" section, add:

```
### Search mode

Tap **Search** (next to **AI**) to browse and search the rulebook without the model. Type a query (it searches 1 s after you stop typing, or on the keyboard's search key); results are ranked with the best match first. Open a section to read it; use the subsection list, Previous/Next and the underlined cross-references; **Back** returns to where you came from. A−/A+ change the text size. Search needs the server running but not Ollama.
```

- [ ] **Step 5: Typecheck and run all tests**

Run: `cd app && npx tsc --noEmit && npx vitest run` and `cd server && npx tsc --noEmit && npx vitest run`
Expected: all pass, no type errors.

- [ ] **Step 6: Manual verification on a phone** (not run before; Expo Go on the same Wi-Fi, `cd server && npm start`, `cd app && npx expo start`). Check each:
  - [ ] AI | Search toggle appears under the header; switching keeps the chat messages; **Clear** shows only in AI mode.
  - [ ] Empty Search shows the top-level outline; typing shows a spinner about 1 s after the last keystroke, then ranked rows with a "BEST MATCH" tag on the first; the keyboard search key searches immediately.
  - [ ] Typing quickly never shows an older query's results; `???` shows "No matches"; stopping the server and typing shows the red error and keeps the previous list.
  - [ ] "sequence of play" → open **4.0**: serif page, rule-number eyebrow, title, breadcrumb, hairline, spaced paragraphs; **4.1** (heading only) opens with its subsections already expanded.
  - [ ] An underlined reference (for example "see 9.21" in 4.11) jumps to that section and the top bar reads "‹ Back to 4.11 …"; Back (button and Android hardware back) returns there; after the last Back, the search list still has the query, results and scroll position.
  - [ ] Previous/Next show neighbour titles, disable at the ends (ERRATA has no Next), and do not add Back steps.
  - [ ] A−/A+ change the size and persist after restarting the app; dark mode uses the night palette; text is selectable.
  - Record anything that looks wrong in `TODO.md` instead of fixing it silently.

- [ ] **Step 7: Commit**

```bash
git add app/App.tsx app/src/components/SearchScreen.tsx app/src/components/ModeToggle.tsx README.md
git commit -m "feat(app): add Search mode with reader navigation

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-review

- **Spec coverage:** toggle + 1 s debounce + ranked list (Tasks 1, 3, 5, 8); `/search`, `/section/:id`, `/outline` with the stated status codes (Task 3); merged split chunks and sibling-first prev/next (Task 2); history stack, Back label, hardware back, kept search state (Tasks 5, 8); reference linking against known `crossRefs` only (Task 6, 7); book look: serif, 18 pt/1.55, 640 pt column, paper/night palettes, eyebrow + title + breadcrumb + hairline, run-in leads, subsections as contents list, fixed bottom bar with neighbour titles, top bar with Back/page/A−A+, remembered text size, selectable text, short fade (Tasks 6, 7, 8). Out-of-scope items are not built.
- **Deliberate refinements of the spec:** hierarchy uses the nearest existing ancestor because 24 real sections (for example `17.21`) have no parent heading; a heading with an empty body opens with subsections expanded; non-heading rules have no big title (their first words are not a real title).
- **Type consistency:** `SectionRef`, `SectionChild`, `SearchResult`, `SectionView` are identical on both sides; `openSection`/`stepSection`/`backFrom`/`backLabel`, `reduceSearch`, `debounce`, `splitReferences`, `toParagraphs`, `stepSize`, `loadTextSize`/`saveTextSize` are used with the same names in Tasks 7 and 8.
- **Known limits:** inline links are small tap targets (nested `Text` has no hit slop); sections the ingest report flags as poorly parsed (`6.2`, `6.21`, `6.22`, `7.43`, `11.3`) may read roughly.
