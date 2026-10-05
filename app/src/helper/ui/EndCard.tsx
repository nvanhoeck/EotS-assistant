import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { EndResult } from '../logic/endOfTurn';
import { StepList } from './VerdictCard';

const LABEL = { alliesWin: 'GAME OVER', japanWins: 'GAME OVER', scoreGame: 'LAST TURN', continue: 'GAME CONTINUES', depends: 'DEPENDS' } as const;

export function EndCard({ result, children }: { result: EndResult; children?: React.ReactNode }) {
  const pal = usePalette();
  return (
    <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
      <Text style={[styles.verdict, { color: pal.accent }]}>{LABEL[result.outcome]}</Text>
      <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
      <StepList title="Steps" steps={result.steps} numbered={result.outcome === 'continue'} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 14, marginTop: 14 },
  verdict: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
