import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { CardPlayResult } from '../logic/strategyCards';
import { PageLink } from './PageLink';
import { StepList } from './VerdictCard';

const LABEL = { yes: 'ALLOWED', no: 'NOT ALLOWED', depends: 'DEPENDS' } as const;

export function CardPlayCard({ result }: { result: CardPlayResult }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{LABEL[result.verdict]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="What happens" steps={result.effect} />
      <StepList title="Conditions" steps={result.conditions} />
      <StepList title="Afterwards" steps={result.afterwards} />
      <StepList title="Good to know" steps={result.notes} />
      {result.links.map((id) => <PageLink key={id} id={id} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
