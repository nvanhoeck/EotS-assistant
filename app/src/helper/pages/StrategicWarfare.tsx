import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { alliedDraw, japaneseBaseDraw, japaneseDraw, japanesePasses } from '../logic/strategicWarfare';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'strategic-warfare';

function Pill({ label, on, onPress }: { label: string; on: boolean; onPress(): void }) {
  const pal = usePalette();
  return (
    <Pressable onPress={onPress} style={[styles.pill, { borderColor: pal.accent, backgroundColor: on ? pal.accent : 'transparent' }]}>
      <Text style={{ color: on ? pal.page : pal.accent, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Calculator() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const [sub, setSub] = useState(false);
  const [bombs, setBombs] = useState(0);
  const base = japaneseBaseDraw(ctx.turn, ctx.japanResourceHexes);
  const draw = base === undefined ? undefined : japaneseDraw(base, sub, bombs);
  const allied = alliedDraw(ctx);
  const text = [styles.text, { color: pal.ink, fontFamily: serif }];
  return (
    <View style={{ gap: 10 }}>
      <Text style={[styles.heading, { color: pal.accent }]}>JAPANESE DRAW</Text>
      <View style={styles.pills}>
        <Pill label="Submarine hit" on={sub} onPress={() => setSub((s) => !s)} />
        {[0, 1, 2].map((n) => <Pill key={n} label={`${n} bombing`} on={bombs === n} onPress={() => setBombs(n)} />)}
      </View>
      {draw === undefined || base === undefined ? (
        <Text style={text}>Set the turn and/or the Japanese resource hexes in the game status bar to see the draw.</Text>
      ) : (
        <>
          <Text style={text}>Base draw {base} (never fewer than 4).</Text>
          <Text style={[styles.big, { color: pal.ink, fontFamily: serif }]}>
            Japan draws {draw} cards · {japanesePasses(draw)} {japanesePasses(draw) === 1 ? 'pass' : 'passes'}
          </Text>
        </>
      )}

      <Text style={[styles.heading, { color: pal.accent }]}>ALLIED DRAW</Text>
      {allied === undefined ? (
        <Text style={text}>Set the turn in the game status bar to see the draw.</Text>
      ) : (
        <>
          <Text style={[styles.big, { color: pal.ink, fontFamily: serif }]}>
            Allies draw {allied.cards} cards · {allied.basePasses + allied.extraPasses > 0 ? `${allied.basePasses}${allied.extraPasses ? ` + ${allied.extraPasses}` : ''} passes` : 'no passes'}
          </Text>
          {allied.conditions.map((c) => <Text key={c} style={text}>• {c}: one card fewer</Text>)}
          {allied.wieAssumed && <Text style={[styles.note, { color: pal.muted }]}>War in Europe level not set; level 4 is assumed not to apply.</Text>}
        </>
      )}
    </View>
  );
}

export function StrategicWarfare() {
  const { ctx } = useHelper();
  return (
    <PageShell title="Strategic Warfare Segment" subtitle="Rulebook 12.0 and 4.13">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Draw calculator" defaultOpen>
        <Calculator />
      </Accordion>
      {pickSections(PAGE, ['japan-cards', 'submarine', 'bombing', 'allied-cards']).map((s) => (
        <RuleSection key={s.key} pageId={PAGE} section={s} />
      ))}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  text: { fontSize: 16, lineHeight: 23 },
  big: { fontSize: 20, fontWeight: '700' },
  note: { fontSize: 13 },
});
