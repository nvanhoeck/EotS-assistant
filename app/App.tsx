import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator, BackHandler, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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

// Hidden panes stay mounted and laid out (never display:none: iOS Fabric unmounts that subtree and
// the search list would lose its scroll position).
function layerStyle(active: boolean) {
  return [StyleSheet.absoluteFill, { opacity: active ? 1 : 0 }];
}

function layerProps(active: boolean) {
  return {
    pointerEvents: (active ? 'auto' : 'none') as 'auto' | 'none',
    importantForAccessibility: (active ? 'auto' : 'no-hide-descendants') as 'auto' | 'no-hide-descendants',
    accessibilityElementsHidden: !active,
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const [serverUrl, setServerUrl] = useState(''); // text-box draft
  const [committedUrl, setCommittedUrl] = useState(''); // what the api is built from
  const [sessionId, setSessionId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('ai');
  const [trail, setTrail] = useState<Trail>([]);
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE_INDEX);
  const list = useRef<FlatList>(null);
  const pal = usePalette();

  useEffect(() => {
    loadServerUrl().then((u) => {
      setServerUrl(u);
      setCommittedUrl(u);
    });
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

  const api = useMemo(() => createApi(committedUrl), [committedUrl]);

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
              <Text style={styles.label}>Server address (your PC's LAN IP)</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#6b7280"
                onChangeText={setServerUrl}
                onEndEditing={() => {
                  saveServerUrl(serverUrl);
                  setCommittedUrl(serverUrl);
                }}
              />
            </View>
          )}
        </>
      )}

      <View style={styles.stack}>
      <View style={layerStyle(mode === 'ai' && !reading)} {...layerProps(mode === 'ai' && !reading)}>
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
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask a rules question…"
              placeholderTextColor="#6b7280"
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
      <View style={layerStyle(mode === 'search' && !reading)} {...layerProps(mode === 'search' && !reading)}>
        <SearchScreen api={api} onOpen={(ref) => setTrail((t) => openSection(t, ref))} />
      </View>

      {reading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: pal.page }]} pointerEvents="auto">
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
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  stack: { flex: 1, position: 'relative' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  label: { color: '#111827' },
  title: { color: '#111827', fontSize: 17, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', gap: 16 },
  link: { color: '#1e3a8a', fontWeight: '600' },
  settings: { padding: 12, backgroundColor: '#f9fafb' },
  list: { flex: 1, paddingHorizontal: 12 },
  hint: { color: '#6b7280', marginTop: 24, lineHeight: 22 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1e3a8a', borderRadius: 12, padding: 10, marginVertical: 6, maxWidth: '85%' },
  userText: { color: '#fff', fontSize: 15 },
  error: { color: '#b91c1c', marginVertical: 8 },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8, borderTopWidth: 1, borderColor: '#e5e7eb' },
  input: { color: '#111827', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginTop: 4 },
  send: { backgroundColor: '#1e3a8a', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', marginTop: 4 },
  sendText: { color: '#fff', fontWeight: '600' },
});
