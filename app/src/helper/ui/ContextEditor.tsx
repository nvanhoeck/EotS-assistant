import React from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { LIMITS, type NumberField } from '../context';
import { useHelper } from '../nav';
import { NATIONS, USED_FLAGS } from '../types';
import { Stepper } from './Stepper';

function Check({ label, on, onPress }: { label: string; on: boolean; onPress(): void }) {
  const pal = usePalette();
  return (
    <Pressable onPress={onPress} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <Text style={[styles.box, { color: pal.accent }]}>{on ? '☑' : '☐'}</Text>
      <Text style={[styles.checkLabel, { color: pal.ink }]}>{label}</Text>
    </Pressable>
  );
}

const FIELDS: { field: NumberField; label: string; start: number }[] = [
  { field: 'turn', label: 'Game turn', start: 1 },
  { field: 'wieLevel', label: 'War in Europe level (0 = no effect)', start: 0 },
  { field: 'japanResourceHexes', label: 'Japanese-controlled resource hexes (of 14)', start: 0 },
  { field: 'alliedAsps', label: 'Allied ASPs after Reinforcement (this turn)', start: 0 },
  { field: 'capturedNet', label: 'Net Japanese hexes captured and kept (this turn)', start: 0 },
];

export function ContextEditor({ visible, onClose }: { visible: boolean; onClose(): void }) {
  const { ctx, dispatch } = useHelper();
  const pal = usePalette();

  function confirmReset() {
    Alert.alert('Reset game?', 'This clears the turn, counters and checkboxes on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => dispatch({ type: 'reset' }) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: pal.page }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: pal.ink, fontFamily: serif }]}>Game status</Text>
          <Text style={[styles.note, { color: pal.muted }]}>
            Everything here is optional. The helper uses it to tailor forms and reminders; anything you leave unset is simply shown with its condition written out.
          </Text>

          {FIELDS.map((f) => (
            <Stepper
              key={f.field}
              label={f.label}
              value={ctx[f.field]}
              min={LIMITS[f.field].min}
              max={LIMITS[f.field].max}
              start={f.start}
              onChange={(value) => dispatch({ type: 'set', field: f.field, value })}
            />
          ))}

          <Text style={[styles.heading, { color: pal.accent }]}>NATIONS THAT HAVE SURRENDERED</Text>
          {NATIONS.map((n) => (
            <Check key={n.id} label={n.label} on={ctx.surrendered.includes(n.id)} onPress={() => dispatch({ type: 'toggleSurrender', nation: n.id })} />
          ))}

          <Text style={[styles.heading, { color: pal.accent }]}>ONCE-PER-GAME RESULTS ALREADY SCORED</Text>
          {USED_FLAGS.map((f) => (
            <Check key={f.id} label={f.label} on={ctx.used.includes(f.id)} onPress={() => dispatch({ type: 'toggleUsed', flag: f.id })} />
          ))}

          <View style={styles.actions}>
            <Pressable onPress={() => dispatch({ type: 'nextTurn' })} style={[styles.action, { borderColor: pal.accent }]}>
              <Text style={[styles.actionText, { color: pal.accent }]}>Next turn (resets this turn’s counters)</Text>
            </Pressable>
            <Pressable onPress={confirmReset} style={[styles.action, { borderColor: pal.muted }]}>
              <Text style={[styles.actionText, { color: pal.muted }]}>Reset game</Text>
            </Pressable>
            <Pressable onPress={onClose} style={[styles.action, { backgroundColor: pal.accent, borderColor: pal.accent }]}>
              <Text style={[styles.actionText, { color: pal.page }]}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 6, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  note: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  heading: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 18, marginBottom: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  box: { fontSize: 22 },
  checkLabel: { flex: 1, fontSize: 15 },
  actions: { gap: 10, marginTop: 24 },
  action: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  actionText: { fontSize: 16, fontWeight: '700' },
});
