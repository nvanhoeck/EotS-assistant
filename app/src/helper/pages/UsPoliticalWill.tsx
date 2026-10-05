import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { ALL_SURRENDERED_PW, SURRENDER_PW, progressDetail, progressOfWar } from '../logic/politicalWill';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';
import { PageLink } from '../ui/PageLink';

const PAGE = 'us-political-will';

function SurrenderTable() {
  const { ctx } = useHelper();
  const pal = usePalette();
  return (
    <View style={{ gap: 4 }}>
      {SURRENDER_PW.map((s) => {
        const gone = ctx.surrendered.includes(s.id);
        return (
          <View key={s.id} style={styles.tr}>
            <Text style={[styles.cell, { color: pal.ink, fontFamily: serif, fontWeight: gone ? '700' : '400' }]}>
              {gone ? '● ' : '○ '}{s.label}{s.recapture ? ' *' : ''}
            </Text>
            <Text style={[styles.val, { color: pal.ink }]}>−{s.value}</Text>
          </View>
        );
      })}
      <View style={styles.tr}>
        <Text style={[styles.cell, { color: pal.ink, fontFamily: serif }]}>All of the above have surrendered</Text>
        <Text style={[styles.val, { color: pal.ink }]}>−{ALL_SURRENDERED_PW}</Text>
      </View>
      <Text style={[styles.note, { color: pal.muted }]}>● = marked as surrendered in the game status. * = value is given back on recapture.</Text>
    </View>
  );
}

function ProgressMeter() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const p = progressOfWar(ctx);
  const detail = progressDetail(ctx);
  return (
    <View>
      <Text style={[styles.meter, { color: p.active && p.met === false ? pal.accent : pal.ink, fontFamily: serif }]}>
        {detail ?? 'Set the turn in the game status bar to see the countdown.'}
      </Text>
      {p.active && p.met === false && <Text style={[styles.note, { color: pal.accent }]}>If this stands at the end of the US Political Will segment: US Political Will −1.</Text>}
    </View>
  );
}

export function UsPoliticalWill() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const extras: Record<string, React.ReactNode> = { surrenders: <SurrenderTable />, progress: <ProgressMeter /> };
  return (
    <PageShell title="US Political Will" subtitle="Rulebook 16.4 · adjusted in the US Political Will segment (4.32)">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Text style={[styles.intro, { color: pal.muted }]}>Everything that moves the marker, in one place.</Text>
      {pickSections(PAGE, ['surrenders', 'occupation', 'strategic-warfare', 'events', 'casualties', 'naval', 'progress']).map((s) => (
        <RuleSection key={s.key} pageId={PAGE} section={s} extra={extras[s.key]} />
      ))}
      <View style={{ marginTop: 16 }}>
        <PageLink id="strategic-warfare" />
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, marginBottom: 8 },
  tr: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cell: { flex: 1, fontSize: 16, lineHeight: 24 },
  val: { fontSize: 16, fontWeight: '700' },
  note: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  meter: { fontSize: 18, fontWeight: '700' },
});
