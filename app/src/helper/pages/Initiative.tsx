import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { initiative } from '../logic/initiative';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleRef } from '../ui/RuleRef';
import { RuleSection } from '../ui/RuleSection';
import { Stepper } from '../ui/Stepper';

const PAGE = 'initiative';

function Calculator() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const [japan, setJapan] = useState<number | undefined>();
  const [allies, setAllies] = useState<number | undefined>();
  const [fo, setFo] = useState(false);
  const result = japan !== undefined && allies !== undefined ? initiative({ japanCards: japan, alliedCards: allies, turn: ctx.turn, fewerHasFutureOffensive: fo }) : undefined;
  const text = [styles.text, { color: pal.ink, fontFamily: serif }];
  return (
    <View style={{ gap: 8 }}>
      <Stepper label="Cards in the Japanese hand" value={japan} min={0} max={20} start={5} onChange={setJapan} />
      <Stepper label="Cards in the Allied hand" value={allies} min={0} max={20} start={5} onChange={setAllies} />
      <Pressable onPress={() => setFo((v) => !v)} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: fo }}>
        <Text style={[styles.box, { color: pal.accent }]}>{fo ? '☑' : '☐'}</Text>
        <Text style={[styles.checkLabel, { color: pal.ink }]}>The player with fewer cards holds a designated Future Offensives card</Text>
      </Pressable>
      {result ? (
        <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
          <Text style={[styles.big, { color: pal.ink, fontFamily: serif }]}>
            {result.first === undefined ? 'Tie: it depends on the year' : `${result.first === 'japan' ? 'Japanese' : 'Allied'} player goes first`}
          </Text>
          {[...result.steps, ...(result.futureOffensive ? [result.futureOffensive] : [])].map((s, i) => (
            <View key={i} style={{ gap: 4 }}>
              <Text style={text}>{s.text}</Text>
              <RuleRef cite={s.cite} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.hint, { color: pal.muted }]}>Enter both hand sizes to see who goes first.</Text>
      )}
    </View>
  );
}

export function Initiative() {
  const { ctx } = useHelper();
  return (
    <PageShell title="Initiative Segment" subtitle="Rulebook 4.21 and 6.29">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Who goes first?" defaultOpen>
        <Calculator />
      </Accordion>
      {pickSections(PAGE, ['initiative', 'future']).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />)}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, lineHeight: 23 },
  big: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  hint: { fontSize: 14 },
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 10, marginTop: 8 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  box: { fontSize: 22 },
  checkLabel: { flex: 1, fontSize: 15 },
});
