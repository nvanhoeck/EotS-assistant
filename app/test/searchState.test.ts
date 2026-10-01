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
