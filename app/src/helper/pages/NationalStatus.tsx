import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { SURRENDER_RULES, checkSurrender, ruleFor, type SurrenderTarget } from '../logic/nationalStatus';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import type { NationId } from '../types';
import { Accordion } from '../ui/Accordion';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { PageLink } from '../ui/PageLink';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleRef } from '../ui/RuleRef';
import { RuleSection } from '../ui/RuleSection';
import { StepList } from '../ui/VerdictCard';

const PAGE = 'national-status';

const STATUS_LABEL = { surrenders: 'SURRENDERS', notYet: 'NOT YET', already: 'ALREADY SURRENDERED', gameOver: 'GAME OVER' } as const;

function Checker() {
  const { ctx, dispatch } = useHelper();
  const pal = usePalette();
  const [target, setTarget] = useState<SurrenderTarget>('philippines');
  const [checked, setChecked] = useState<boolean[]>([]);
  const rule = ruleFor(target);
  const result = checkSurrender(target, checked, ctx);

  function pick(id: SurrenderTarget) {
    setTarget(id);
    setChecked([]);
  }

  return (
    <View style={{ gap: 10 }}>
      <Text style={[styles.hint, { color: pal.muted }]}>Pick a nation, then tick what is true on the board.</Text>
      <View style={styles.pills}>
        {SURRENDER_RULES.map((r) => (
          <Pressable key={r.id} onPress={() => pick(r.id)} style={[styles.pill, { borderColor: pal.accent, backgroundColor: target === r.id ? pal.accent : 'transparent' }]}>
            <Text style={{ color: target === r.id ? pal.page : pal.accent, fontWeight: '700' }}>{r.label.replace('The ', '')}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.mode, { color: pal.muted }]}>{rule.mode === 'any' ? 'Either one is enough:' : 'All of these are needed:'}</Text>
      {rule.conditions.map((cnd, i) => (
        <Pressable key={i} onPress={() => setChecked((c) => { const n = [...c]; n[i] = !n[i]; return n; })} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: !!checked[i] }}>
          <Text style={[styles.box, { color: pal.accent }]}>{checked[i] ? '☑' : '☐'}</Text>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>{cnd.text}</Text>
            <RuleRef cite={cnd.cite} />
          </View>
        </Pressable>
      ))}
      <View style={[styles.card, { borderColor: pal.accent, backgroundColor: pal.bar }]}>
        <Text style={[styles.status, { color: pal.accent }]}>{STATUS_LABEL[result.status]}</Text>
        <Text style={[styles.headline, { color: pal.ink, fontFamily: serif }]}>{result.headline}</Text>
        {result.status === 'notYet' && result.missing.length > 0 && (
          <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>Still missing: {result.missing.map((m) => m.text.replace(/\.$/, '')).join('; ')}.</Text>
        )}
        <StepList title="What happens" steps={result.consequences} />
        <StepList title="Effect on the Allies" steps={result.effects} />
        {result.status === 'surrenders' && target !== 'japan' && !ctx.surrendered.includes(target as NationId) && (
          <Pressable onPress={() => dispatch({ type: 'toggleSurrender', nation: target as NationId })} style={[styles.button, { borderColor: pal.accent }]} accessibilityRole="button">
            <Text style={[styles.buttonText, { color: pal.accent }]}>Mark {rule.label.replace('The ', '')} as surrendered in the game status</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function NationalStatus() {
  const { ctx } = useHelper();
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);
  return (
    <PageShell title="National Status Segment" subtitle="Rulebook 12.0 and 4.31">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Surrender checker" defaultOpen>
        <Checker />
      </Accordion>
      <GroupHeading>The rules</GroupHeading>
      {section(['general', 'hex-control'])}
      <GroupHeading>Nation by nation</GroupHeading>
      {section(['philippines', 'malaya', 'dei', 'burma', 'india', 'china', 'australia', 'japan'])}
      <View style={{ marginTop: 16, gap: 8 }}>
        <PageLink id="national-india" />
        <PageLink id="national-china" />
        <PageLink id="war-in-europe" />
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  mode: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  box: { fontSize: 22 },
  text: { fontSize: 16, lineHeight: 23 },
  card: { borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 12, marginTop: 8 },
  status: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  button: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
