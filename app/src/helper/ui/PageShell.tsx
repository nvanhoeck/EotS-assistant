import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pal = usePalette();
  return (
    <ScrollView style={{ backgroundColor: pal.page }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: pal.ink, fontFamily: serif }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: pal.muted }]}>{subtitle}</Text> : null}
      <View style={[styles.rule, { backgroundColor: pal.rule }]} />
      {children}
    </ScrollView>
  );
}

export function GroupHeading({ children }: { children: string }) {
  const pal = usePalette();
  return <Text style={[styles.group, { color: pal.accent }]}>{children.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
  group: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 22, marginBottom: 2 },
});
