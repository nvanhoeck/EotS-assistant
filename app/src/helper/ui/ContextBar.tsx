import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../../theme';
import { contextSummary } from '../context';
import { progressDetail, progressOfWar } from '../logic/politicalWill';
import { useHelper } from '../nav';
import { ContextEditor } from './ContextEditor';

/** One tappable line at the top of every helper page. */
export function ContextBar() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const [open, setOpen] = useState(false);
  const progress = progressOfWar(ctx).active ? progressDetail(ctx) : undefined;
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[styles.bar, { backgroundColor: pal.bar, borderColor: pal.rule }]} accessibilityRole="button" accessibilityLabel="Edit game status">
        <View style={styles.texts}>
          <Text style={[styles.summary, { color: pal.ink }]}>{contextSummary(ctx)}</Text>
          {progress ? <Text style={[styles.progress, { color: pal.accent }]}>Progress of the War: {progress}</Text> : null}
        </View>
        <Text style={[styles.edit, { color: pal.accent }]}>Edit</Text>
      </Pressable>
      <ContextEditor visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  texts: { flex: 1, gap: 2 },
  summary: { fontSize: 14, fontWeight: '600' },
  progress: { fontSize: 13, fontWeight: '600' },
  edit: { fontSize: 14, fontWeight: '700' },
});
