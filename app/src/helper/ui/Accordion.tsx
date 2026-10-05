import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';

interface Props {
  title: string;
  /** Number of reminders that apply now; shown as a pill. */
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({ title, badge = 0, defaultOpen = false, children }: Props) {
  const pal = usePalette();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.wrap, { borderColor: pal.rule }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.head} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={[styles.chev, { color: pal.accent }]}>{open ? '▾' : '▸'}</Text>
        <Text style={[styles.title, { color: pal.ink, fontFamily: serif }]}>{title}</Text>
        {badge > 0 && (
          <View style={[styles.badge, { backgroundColor: pal.accent }]}>
            <Text style={[styles.badgeText, { color: pal.page }]}>{badge}</Text>
          </View>
        )}
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10 },
  chev: { fontSize: 16, width: 16 },
  title: { flex: 1, fontSize: 18, fontWeight: '600' },
  badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  body: { paddingBottom: 14, gap: 10 },
});
