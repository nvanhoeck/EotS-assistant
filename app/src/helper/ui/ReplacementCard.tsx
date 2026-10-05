import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { ReplacementResult } from '../logic/replacement';
import { PageLink } from './PageLink';
import { StepList } from './VerdictCard';

const LABEL = { yes: 'ELIGIBLE', no: 'NOT POSSIBLE', depends: 'DEPENDS' } as const;

export function ReplacementCard({ result }: { result: ReplacementResult }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{LABEL[result.verdict]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="How many you get" steps={result.availability} />
      <StepList title="What it costs" steps={result.cost} />
      <StepList title="Conditions" steps={result.where} />
      {result.mapChecks.length > 0 && (
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: pal.accent }]}>CHECK ON THE BOARD</Text>
          {result.mapChecks.map((c, i) => (
            <Text key={i} style={[styles.text, { color: pal.ink, fontFamily: serif }]}>☐ {c}</Text>
          ))}
        </View>
      )}
      <StepList title="Notes" steps={result.notes} />
      {result.links.map((id) => <PageLink key={id} id={id} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  block: { gap: 6 },
  blockTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  text: { fontSize: 16, lineHeight: 23 },
});
