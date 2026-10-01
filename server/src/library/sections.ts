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
