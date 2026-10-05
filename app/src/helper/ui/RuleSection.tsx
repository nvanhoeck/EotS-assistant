import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { useHelper } from '../nav';
import { remindersFor } from '../reminders';
import type { Section, Statement } from '../types';
import { Accordion } from './Accordion';
import { PageLink } from './PageLink';
import { ReminderCard } from './ReminderCard';
import { RuleRef } from './RuleRef';

function StatementView({ statement }: { statement: Statement }) {
  const pal = usePalette();
  return (
    <View style={styles.statement}>
      <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>{statement.text}</Text>
      {statement.cite ? <RuleRef cite={statement.cite} /> : null}
      {statement.links?.map((id) => <PageLink key={id} id={id} />)}
    </View>
  );
}

/** An accordion section: its reminders first (all statuses), optional extra content, then the rule statements. */
export function RuleSection({ pageId, section, extra }: { pageId: string; section: Section; extra?: React.ReactNode }) {
  const { ctx } = useHelper();
  const items = remindersFor(`${pageId}#${section.key}`, ctx);
  const live = items.filter((i) => i.status === 'applies').length;
  return (
    <Accordion title={section.title} badge={live} defaultOpen={live > 0}>
      {items.map((i) => <ReminderCard key={`${i.reminder.id}-${i.status}`} item={i} />)}
      {extra}
      {section.statements.map((s, n) => <StatementView key={n} statement={s} />)}
    </Accordion>
  );
}

const styles = StyleSheet.create({
  statement: { gap: 6 },
  text: { fontSize: 17, lineHeight: 25 },
});
