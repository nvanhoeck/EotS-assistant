import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PendingClarification } from '../chatState';

interface Props {
  pending: PendingClarification;
  disabled: boolean;
  onSelect: (index: number, option: string) => void;
  onSubmit: () => void;
}

export function ClarificationCard({ pending, disabled, onSelect, onSubmit }: Props) {
  const ready = pending.selected.every((s) => s !== undefined);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>I need a bit more information</Text>
      {pending.questions.map((q, qi) => (
        <View key={qi} style={styles.q}>
          <Text style={styles.qText}>{q.text}</Text>
          <View style={styles.options}>
            {q.options.map((o) => (
              <Pressable
                key={o}
                onPress={() => onSelect(qi, o)}
                style={[styles.option, pending.selected[qi] === o && styles.optionOn]}
              >
                <Text style={pending.selected[qi] === o ? styles.optionTextOn : styles.optionText}>{o}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <Pressable onPress={onSubmit} disabled={!ready || disabled} style={[styles.submit, (!ready || disabled) && styles.submitOff]}>
        <Text style={styles.submitText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#eef2ff', borderRadius: 12, padding: 12, marginVertical: 6 },
  title: { color: '#111827', fontWeight: '700', marginBottom: 8 },
  q: { marginBottom: 10 },
  qText: { color: '#111827', fontSize: 15, marginBottom: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { borderWidth: 1, borderColor: '#6366f1', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  optionOn: { backgroundColor: '#6366f1' },
  optionText: { color: '#4338ca' },
  optionTextOn: { color: '#fff' },
  submit: { backgroundColor: '#4338ca', borderRadius: 8, padding: 12, alignItems: 'center' },
  submitOff: { opacity: 0.4 },
  submitText: { color: '#fff', fontWeight: '600' },
});
