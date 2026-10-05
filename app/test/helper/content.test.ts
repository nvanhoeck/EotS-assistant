import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PAGE_SECTIONS, pickSections, sectionKeys } from '../../src/helper/content';
import { PAGES, SEQUENCE, TOPICS, pageTitle } from '../../src/helper/registry';
import { ALL_REMINDERS } from '../../src/helper/reminders';
import type { GameContext } from '../../src/helper/types';
import { checkReinforcement } from '../../src/helper/logic/reinforcement';
import { checkReplacement } from '../../src/helper/logic/replacement';
import { checkCardPlay } from '../../src/helper/logic/strategyCards';
import { allCardPaths, allPaths, allReplacementPaths } from './paths';

const raw = JSON.parse(readFileSync(new URL('../../../server/data/chunks.json', import.meta.url), 'utf8'));
const chunks: { sectionId: string }[] = Array.isArray(raw) ? raw : raw.chunks;
const SECTION_IDS = new Set(chunks.map((c) => c.sectionId));
const ctx = (p: Partial<GameContext> = {}): GameContext => ({ surrendered: [], used: [], ...p });

function reinforcementCites(): string[] {
  const out: string[] = [];
  for (const c of [ctx(), ctx({ wieLevel: 2 })]) {
    for (const a of allPaths(c)) {
      const r = checkReinforcement(a, c);
      for (const s of [...r.doFirst, ...r.where, ...r.restrictions, ...r.notes]) out.push(...s.cite);
    }
  }
  return out;
}

function replacementCites(): string[] {
  const out: string[] = [];
  for (const c of [ctx(), ctx({ turn: 6 }), ctx({ turn: 3, surrendered: ['china'] })]) {
    for (const a of allReplacementPaths(c)) {
      const r = checkReplacement(a, c);
      for (const s of [...r.availability, ...r.cost, ...r.where, ...r.notes]) out.push(...s.cite);
    }
  }
  return out;
}

function cardCites(): string[] {
  return allCardPaths().flatMap((a) => {
    const r = checkCardPlay(a);
    return [...r.effect, ...r.conditions, ...r.afterwards, ...r.notes].flatMap((s) => s.cite);
  });
}

describe('rulebook references', () => {
  it('every content statement cites sections that exist in the ingested rulebook', () => {
    const missing: string[] = [];
    for (const [page, sections] of Object.entries(PAGE_SECTIONS)) {
      for (const s of sections) for (const st of s.statements) for (const id of st.cite ?? []) if (!SECTION_IDS.has(id)) missing.push(`${page}#${s.key}: ${id}`);
    }
    expect(missing).toEqual([]);
  });
  it('every reminder cites sections that exist', () => {
    const missing = ALL_REMINDERS.flatMap((r) => r.cite.filter((id) => !SECTION_IDS.has(id)).map((id) => `${r.id}: ${id}`));
    expect(missing).toEqual([]);
  });
  it('every step the reinforcement form can produce cites sections that exist', () => {
    const missing = [...new Set(reinforcementCites())].filter((id) => !SECTION_IDS.has(id));
    expect(missing).toEqual([]);
  });
  it('every step the replacement form can produce cites sections that exist', () => {
    const missing = [...new Set(replacementCites())].filter((id) => !SECTION_IDS.has(id));
    expect(missing).toEqual([]);
  });
  it('every step the card-play form can produce cites sections that exist', () => {
    const missing = [...new Set(cardCites())].filter((id) => !SECTION_IDS.has(id));
    expect(missing).toEqual([]);
  });
  it('every "coming soon" row points at a real section', () => {
    const bad = [...SEQUENCE, ...TOPICS].filter((p) => p.sectionId && !SECTION_IDS.has(p.sectionId)).map((p) => p.id);
    expect(bad).toEqual([]);
  });
});

describe('helper links', () => {
  it('every page link in content and reminders targets a registered page', () => {
    const bad: string[] = [];
    for (const [page, sections] of Object.entries(PAGE_SECTIONS)) {
      for (const s of sections) for (const st of s.statements) for (const id of st.links ?? []) if (!PAGES[id]) bad.push(`${page}#${s.key}: ${id}`);
    }
    for (const r of ALL_REMINDERS) for (const id of r.links ?? []) if (!PAGES[id]) bad.push(`${r.id}: ${id}`);
    expect(bad).toEqual([]);
  });
  it('every reminder is attached to a real page and section', () => {
    const bad: string[] = [];
    for (const r of ALL_REMINDERS) {
      for (const key of r.pages) {
        const [page, section] = key.split('#');
        if (!PAGES[page]) bad.push(`${r.id}: no page ${page}`);
        else if (section && !sectionKeys(page).includes(section)) bad.push(`${r.id}: no section ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('registry', () => {
  it('lists the ten segments of the Sequence of Play', () => {
    expect(SEQUENCE).toHaveLength(10);
  });
  it('has content for every ready page', () => {
    for (const p of [...SEQUENCE, ...TOPICS].filter((x) => x.ready)) expect(PAGE_SECTIONS[p.id]?.length).toBeGreaterThan(0);
  });
  it('has unique section keys per page', () => {
    for (const sections of Object.values(PAGE_SECTIONS)) {
      const keys = sections.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
  it('pickSections returns in the requested order and throws on a typo', () => {
    expect(pickSections('reinforcements', ['air', 'ground']).map((s) => s.key)).toEqual(['air', 'ground']);
    expect(() => pickSections('reinforcements', ['nope'])).toThrow();
  });
  it('titles fall back to the id', () => {
    expect(pageTitle('reinforcements')).toBe('Reinforcement Segment');
    expect(pageTitle('zzz')).toBe('zzz');
  });
});
