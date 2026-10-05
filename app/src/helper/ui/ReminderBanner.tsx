import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../../theme';
import type { ReminderItem } from '../types';
import { ReminderCard } from './ReminderCard';

/** The reminders that apply right now, at the top of a page. Renders nothing when none do. */
export function ReminderBanner({ items }: { items: ReminderItem[] }) {
  const pal = usePalette();
  const live = items.filter((i) => i.status === 'applies');
  if (live.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: pal.accent }]}>REMINDERS FOR NOW</Text>
      {live.map((i) => <ReminderCard key={`${i.reminder.id}-${i.status}`} item={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  title: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
