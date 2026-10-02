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
