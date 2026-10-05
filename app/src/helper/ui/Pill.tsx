import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { usePalette } from '../../theme';

/** A rounded toggle button, used in rows of choices. */
export function Pill({ label, on, onPress }: { label: string; on: boolean; onPress(): void }) {
  const pal = usePalette();
  return (
    <Pressable onPress={onPress} style={[styles.pill, { borderColor: pal.accent, backgroundColor: on ? pal.accent : 'transparent' }]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      <Text style={{ color: on ? pal.page : pal.accent, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ pill: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 } });
