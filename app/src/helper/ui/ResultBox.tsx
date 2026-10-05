import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';

/** The bordered answer card used by calculators: a small label, a big headline, then details. */
export function ResultBox({ label, headline, children }: { label: string; headline: string; children?: React.ReactNode }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.label, { color: pal.accent }]}>{label}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{headline}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 12, marginTop: 10 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
