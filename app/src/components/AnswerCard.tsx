import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AnswerResult, NotFoundResult } from '../types';
import { CitationChip } from './CitationChip';

export function AnswerCard({ result }: { result: AnswerResult | NotFoundResult }) {
  if (result.type === 'not_found') {
    return (
      <View style={styles.card}>
        <Text style={styles.answer}>I did not find a matching rule. Nearest sections:</Text>
        <View style={styles.row}>
          {result.nearest.map((c) => (
            <CitationChip key={c.sectionId + c.pageStart} citation={c} />
          ))}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <Text style={styles.answer}>{result.answer}</Text>
      {result.steps.map((s, i) => (
        <Text key={i} style={styles.step}>
          {i + 1}. {s}
        </Text>
      ))}
      {result.assumptions.length > 0 && (
        <View style={styles.assumptions}>
          <Text style={styles.assumptionsTitle}>Assumed</Text>
          {result.assumptions.map((a, i) => (
            <Text key={i}>• {a}</Text>
          ))}
        </View>
      )}
      <View style={styles.row}>
        {result.citations.map((c) => (
          <CitationChip key={c.sectionId + c.quote} citation={c} />
        ))}
      </View>
      {result.unverified > 0 && (
        <Text style={styles.warn}>{result.unverified} citation(s) could not be verified. Check the rulebook.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, marginVertical: 6, alignSelf: 'flex-start', maxWidth: '95%' },
  answer: { fontSize: 15, lineHeight: 22 },
  step: { marginTop: 6, fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  assumptions: { marginTop: 8, padding: 8, backgroundColor: '#fef3c7', borderRadius: 8 },
  assumptionsTitle: { fontWeight: '700' },
  warn: { marginTop: 8, color: '#b45309', fontSize: 12 },
});
