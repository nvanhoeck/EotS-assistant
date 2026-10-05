import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { useHelper } from '../nav';
import { SEQUENCE, TOPICS, type PageDef } from '../registry';
import { appliesCount } from '../reminders';
import { GroupHeading, PageShell } from '../ui/PageShell';

function Row({ def, index }: { def: PageDef; index?: number }) {
  const { ctx, openPage, openSection } = useHelper();
  const pal = usePalette();
  const live = def.ready ? appliesCount(def.id, ctx) : 0;
  const open = () => (def.ready ? openPage(def.id) : def.sectionId ? openSection(def.sectionId) : undefined);
  return (
    <Pressable onPress={open} style={[styles.row, { borderColor: pal.rule }]} accessibilityRole="button">
      <Text style={[styles.index, { color: pal.accent }]}>{index !== undefined ? index + 1 : '•'}</Text>
      <View style={styles.texts}>
        <Text style={[styles.title, { color: def.ready ? pal.ink : pal.muted, fontFamily: serif }]}>{def.title}</Text>
        {!def.ready && (
          <Text style={[styles.sub, { color: pal.muted }]}>
            Coming soon{def.sectionId ? ` · read §${def.sectionId} in the rulebook` : ''}
          </Text>
        )}
      </View>
      {live > 0 && (
        <View style={[styles.badge, { backgroundColor: pal.accent }]}>
          <Text style={[styles.badgeText, { color: pal.page }]}>{live} {live === 1 ? 'reminder' : 'reminders'}</Text>
        </View>
      )}
      <Text style={[styles.chev, { color: pal.accent }]}>›</Text>
    </Pressable>
  );
}

export function Home() {
  return (
    <PageShell title="Rules helper" subtitle="Pick the part of the turn you are in.">
      <GroupHeading>Sequence of play</GroupHeading>
      {SEQUENCE.map((d, i) => <Row key={`${d.id}-${i}`} def={d} index={i} />)}
      <GroupHeading>Topics</GroupHeading>
      {TOPICS.map((d) => <Row key={d.id} def={d} />)}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  index: { width: 22, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 13 },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chev: { fontSize: 22 },
});
