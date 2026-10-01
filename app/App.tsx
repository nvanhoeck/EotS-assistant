import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { createApi } from './src/api';
import { initialState, reduce } from './src/chatState';
import { AnswerCard } from './src/components/AnswerCard';
import { ClarificationCard } from './src/components/ClarificationCard';
import { loadServerUrl, loadSessionId, saveServerUrl } from './src/storage';

export default function App() {
  const [state, dispatch] = useReducer(reduce, initialState);
  const [serverUrl, setServerUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const list = useRef<FlatList>(null);

  useEffect(() => {
    loadServerUrl().then(setServerUrl);
    loadSessionId().then(setSessionId);
  }, []);

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

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Empire of the Sun Rules</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={clearContext}><Text style={styles.link}>Clear</Text></Pressable>
          <Pressable onPress={() => setShowSettings((v) => !v)}><Text style={styles.link}>Server</Text></Pressable>
        </View>
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 32 : 0 },
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
