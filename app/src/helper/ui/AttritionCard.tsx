import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { AttritionResult } from '../logic/attrition';
import { StepList } from './VerdictCard';

const LABEL = { none: 'NO EFFECT', flip: 'FLIP TO REDUCED', stay: 'STAYS REDUCED', eliminated: 'ELIMINATED', depends: 'DEPENDS' } as const;

export function AttritionCard({ result }: { result: AttritionResult }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{LABEL[result.outcome]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="Why" steps={result.steps} />
      {result.mapChecks.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={[styles.blockTitle, { color: pal.accent }]}>CHECK ON THE BOARD</Text>
          {result.mapChecks.map((c, i) => <Text key={i} style={[styles.text, { color: pal.ink, fontFamily: serif }]}>☐ {c}</Text>)}
        </View>
      )}
      <StepList title="Good to know" steps={result.notes} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  blockTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  text: { fontSize: 16, lineHeight: 23 },
});
