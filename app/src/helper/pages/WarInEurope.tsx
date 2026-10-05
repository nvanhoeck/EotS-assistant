import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { WIE_LEVELS, effectsAt, wieLevelForTrack } from '../logic/warInEurope';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import type { WieLevel } from '../types';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';
import { Stepper } from '../ui/Stepper';
import { StepList } from '../ui/VerdictCard';

const PAGE = 'war-in-europe';

function LevelTable() {
  const { ctx, dispatch } = useHelper();
  const pal = usePalette();
  const [track, setTrack] = useState<number | undefined>();
  const fromTrack: WieLevel | undefined = track === undefined ? undefined : wieLevelForTrack(track);
  const shown: WieLevel | undefined = fromTrack ?? ctx.wieLevel;
  return (
    <View style={{ gap: 10 }}>
      {WIE_LEVELS.map((l) => (
        <View key={l.level} style={[styles.row, { borderColor: shown === l.level ? pal.accent : pal.rule, backgroundColor: shown === l.level ? pal.bar : 'transparent' }]}>
          <Text style={[styles.level, { color: pal.ink, fontFamily: serif }]}>{l.label}</Text>
          <Text style={[styles.track, { color: pal.muted }]}>track {l.track}</Text>
        </View>
      ))}
      <Stepper label="Where is the marker on the WIE track?" value={track} min={-7} max={3} start={0} onChange={setTrack} />
      {shown !== undefined ? (
        <View style={{ gap: 8 }}>
          <Text style={[styles.big, { color: pal.ink, fontFamily: serif }]}>{shown === 0 ? 'No Effect' : `Level ${shown}`}</Text>
          {shown === 0 ? <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>No impact on play.</Text> : <StepList title="Effects" steps={effectsAt(shown)} />}
          {fromTrack !== undefined && fromTrack !== ctx.wieLevel && (
            <Pressable onPress={() => dispatch({ type: 'set', field: 'wieLevel', value: fromTrack })} style={[styles.button, { borderColor: pal.accent }]} accessibilityRole="button">
              <Text style={[styles.buttonText, { color: pal.accent }]}>Set the game status to {fromTrack === 0 ? 'No Effect' : `level ${fromTrack}`}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Text style={[styles.text, { color: pal.muted }]}>Enter the marker position, or set the W.I.E. level in the game status.</Text>
      )}
    </View>
  );
}

export function WarInEurope() {
  const { ctx } = useHelper();
  const pal = usePalette();
  return (
    <PageShell title="War in Europe" subtitle="Rulebook 15.0">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Text style={[styles.text, { color: pal.muted, marginBottom: 8 }]}>Tap a level or enter the marker to see what applies.</Text>
      <LevelTable />
      {pickSections(PAGE, ['effects', 'rules']).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />)}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  level: { fontSize: 17, fontWeight: '600' },
  track: { fontSize: 14 },
  big: { fontSize: 22, fontWeight: '700' },
  text: { fontSize: 15, lineHeight: 22 },
  button: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
