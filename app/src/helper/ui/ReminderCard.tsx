import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import type { ReminderItem, Status } from '../types';
import { PageLink } from './PageLink';
import { RuleRef } from './RuleRef';

const LABEL: Record<Status, string> = { applies: 'Applies now', notNow: 'Not now', unknown: 'Check' };

/** Mount with a key that includes the status, so the open/closed default follows a status change. */
export function ReminderCard({ item }: { item: ReminderItem }) {
  const pal = usePalette();
  const { reminder, status, detail } = item;
  const [open, setOpen] = useState(status !== 'notNow');
  const tone = status === 'applies' ? pal.accent : pal.muted;
  return (
    <View
      style={[
        styles.card,
        { borderColor: tone, backgroundColor: status === 'applies' ? pal.bar : 'transparent', opacity: status === 'notNow' ? 0.75 : 1 },
      ]}
    >
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={[styles.label, { color: tone }]}>{LABEL[status].toUpperCase()}</Text>
        {open ? (
          <>
            <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>{reminder.text}</Text>
            <Text style={[styles.condition, { color: pal.muted }]}>{reminder.condition}</Text>
            {detail ? <Text style={[styles.detail, { color: pal.ink }]}>{detail}</Text> : null}
          </>
        ) : (
          <Text style={[styles.detail, { color: pal.ink }]}>{detail ?? reminder.text}</Text>
        )}
      </Pressable>
      {open && (
        <View style={styles.refs}>
          <RuleRef cite={reminder.cite} />
          {reminder.links?.map((id) => <PageLink key={id} id={id} />)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 8, padding: 12, gap: 6 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  text: { fontSize: 16, lineHeight: 23, marginTop: 4 },
  condition: { fontSize: 13, lineHeight: 18, fontStyle: 'italic', marginTop: 4 },
  detail: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  refs: { gap: 8, marginTop: 6 },
});
