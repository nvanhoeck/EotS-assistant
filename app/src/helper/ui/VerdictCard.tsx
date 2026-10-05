import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { ReinforcementResult } from '../logic/reinforcement';
import type { Step } from '../types';
import { RuleRef } from './RuleRef';

function StepList({ title, steps, numbered }: { title: string; steps: Step[]; numbered?: boolean }) {
  const pal = usePalette();
  if (steps.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={[styles.blockTitle, { color: pal.accent }]}>{title.toUpperCase()}</Text>
      {steps.map((s, i) => (
        <View key={i} style={styles.step}>
          <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>{numbered ? `${i + 1}. ` : '• '}{s.text}</Text>
          <RuleRef cite={s.cite} />
        </View>
      ))}
    </View>
  );
}

const VERDICT_LABEL = { place: 'CAN BE PLACED', delay: 'GOES TO THE DELAY BOX', depends: 'DEPENDS' } as const;

export function VerdictCard({ result }: { result: ReinforcementResult }) {
  const pal = usePalette();
  const ste = result.sentToEurope;
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{VERDICT_LABEL[result.verdict]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="Do first" steps={result.doFirst} numbered />
      <StepList title="Where it can go" steps={result.where} />
      {result.mapChecks.length > 0 && (
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: pal.accent }]}>CHECK ON THE BOARD</Text>
          {result.mapChecks.map((c, i) => (
            <Text key={i} style={[styles.text, { color: pal.ink, fontFamily: serif }]}>☐ {c}</Text>
          ))}
        </View>
      )}
      <StepList title="Restrictions" steps={result.restrictions} />
      {ste && (
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: pal.accent }]}>SENT TO EUROPE: {ste.eligible === 'yes' ? 'ELIGIBLE' : ste.eligible === 'no' ? 'EXEMPT' : 'MAYBE'}</Text>
          <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>{ste.text}</Text>
          {ste.eligible !== 'no' && <Text style={[styles.range, { color: pal.ink }]}>{ste.range}</Text>}
          <RuleRef cite={['9.22', '9.24']} />
        </View>
      )}
      <StepList title="Notes" steps={result.notes} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  block: { gap: 6 },
  blockTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  step: { gap: 4 },
  text: { fontSize: 16, lineHeight: 23 },
  range: { fontSize: 14, fontWeight: '700' },
});
