import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { citeLabel } from '../cite';
import { useHelper } from '../nav';
import { usePalette } from '../../theme';

/** Tappable rulebook chips: "§9.12 · p. 22". Tapping opens the section in the Reader (needs the server). */
export function RuleRef({ cite }: { cite: string[] }) {
  const { openSection } = useHelper();
  const pal = usePalette();
  if (cite.length === 0) return null;
  return (
    <View style={styles.row}>
      {cite.map((id) => (
        <Pressable key={id} onPress={() => openSection(id)} hitSlop={8} style={[styles.chip, { borderColor: pal.rule }]} accessibilityRole="link">
          <Text style={[styles.text, { color: pal.accent }]}>§{citeLabel(id)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
