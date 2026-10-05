import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { ActivationResult } from '../logic/activation';
import { StepList } from './VerdictCard';

const LABEL = { yes: 'CAN ACTIVATE', no: 'CANNOT ACTIVATE', depends: 'DEPENDS' } as const;

export function ActivationCard({ result }: { result: ActivationResult }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{LABEL[result.verdict]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="The rule" steps={result.steps} />
      <StepList title="Good to know" steps={result.notes} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
