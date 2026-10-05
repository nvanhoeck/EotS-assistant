import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { usePalette } from '../../theme';

export function CheckRow({ label, on, onPress }: { label: string; on: boolean; onPress(): void }) {
  const pal = usePalette();
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <Text style={[styles.box, { color: pal.accent }]}>{on ? '☑' : '☐'}</Text>
      <Text style={[styles.label, { color: pal.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  box: { fontSize: 22 },
  label: { flex: 1, fontSize: 15 },
});
