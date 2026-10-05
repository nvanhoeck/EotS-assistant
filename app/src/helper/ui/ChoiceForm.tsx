import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
interface Question<K extends string> {
  key: K;
  prompt: string;
  hint?: string;
  options: { value: string; label: string }[];
}

interface Props<K extends string> {
  answered: { key: string; prompt: string; label: string }[];
  question?: Question<K>;
  onAnswer(key: K, value: string): void;
  onBack(): void;
  onRestart(): void;
}

/** One question at a time. Answered questions stay listed above as a trail. */
export function ChoiceForm<K extends string>({ answered, question, onAnswer, onBack, onRestart }: Props<K>) {
  const pal = usePalette();
  return (
    <View style={styles.wrap}>
      {answered.map((a) => (
        <Text key={a.key} style={[styles.answered, { color: pal.muted, fontFamily: serif }]}>
          {a.prompt} <Text style={{ color: pal.ink, fontWeight: '700' }}>{a.label}</Text>
        </Text>
      ))}
      {question && (
        <View style={styles.question}>
          <Text style={[styles.prompt, { color: pal.ink, fontFamily: serif }]}>{question.prompt}</Text>
          {question.hint ? <Text style={[styles.hint, { color: pal.muted }]}>{question.hint}</Text> : null}
          <View style={styles.options}>
            {question.options.map((o) => (
              <Pressable key={o.value} onPress={() => onAnswer(question.key, o.value)} style={[styles.option, { borderColor: pal.accent }]}>
                <Text style={[styles.optionText, { color: pal.accent }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      {answered.length > 0 && (
        <View style={styles.row}>
          <Pressable onPress={onBack} hitSlop={8}><Text style={[styles.link, { color: pal.accent }]}>‹ Back</Text></Pressable>
          <Pressable onPress={onRestart} hitSlop={8}><Text style={[styles.link, { color: pal.accent }]}>Start over</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  answered: { fontSize: 15, lineHeight: 21 },
  question: { marginTop: 10, gap: 6 },
  prompt: { fontSize: 20, fontWeight: '700' },
  hint: { fontSize: 14, lineHeight: 20 },
  options: { gap: 8, marginTop: 8 },
  option: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  optionText: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 24, marginTop: 12 },
  link: { fontSize: 15, fontWeight: '600' },
});
