import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../../theme';

interface Props {
  label: string;
  value: number | undefined;
  min: number;
  max: number;
  /** Where the first tap on + or − lands when the value is unset. */
  start: number;
  onChange(value: number | undefined): void;
}

export function Stepper({ label, value, min, max, start, onChange }: Props) {
  const pal = usePalette();
  const dec = () => onChange(value === undefined ? start : Math.max(min, value - 1));
  const inc = () => onChange(value === undefined ? start : Math.min(max, value + 1));
  const btn = [styles.btn, { borderColor: pal.accent }];
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: pal.ink }]}>{label}</Text>
      <View style={styles.controls}>
        <Pressable onPress={dec} style={btn} accessibilityLabel={`${label} minus`}><Text style={[styles.btnText, { color: pal.accent }]}>−</Text></Pressable>
        <Text style={[styles.value, { color: pal.ink }]}>{value === undefined ? '—' : value}</Text>
        <Pressable onPress={inc} style={btn} accessibilityLabel={`${label} plus`}><Text style={[styles.btnText, { color: pal.accent }]}>+</Text></Pressable>
        <Pressable onPress={() => onChange(undefined)} hitSlop={8} style={styles.clear} accessibilityLabel={`Clear ${label}`}>
          <Text style={{ color: pal.muted }}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  label: { flex: 1, fontSize: 15, paddingRight: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { width: 38, height: 38, borderWidth: 1.5, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 22, lineHeight: 24, fontWeight: '600' },
  value: { minWidth: 30, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  clear: { width: 24, alignItems: 'center' },
});
