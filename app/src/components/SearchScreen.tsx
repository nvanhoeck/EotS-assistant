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
