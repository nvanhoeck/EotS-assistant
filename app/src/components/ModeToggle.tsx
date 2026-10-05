import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type Mode = 'ai' | 'search' | 'helper';

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'ai', label: 'AI' },
  { mode: 'search', label: 'Search' },
  { mode: 'helper', label: 'Helper' },
];

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange(mode: Mode): void }) {
  return (
    <View style={styles.wrap}>
      {MODES.map((m) => (
        <Pressable key={m.mode} onPress={() => onChange(m.mode)} style={[styles.seg, mode === m.mode && styles.on]}>
          <Text style={[styles.text, mode === m.mode && styles.textOn]}>{m.label}</Text>
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
