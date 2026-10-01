import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Citation } from '../types';

export function pageText(c: Citation): string {
  return c.pageStart === c.pageEnd ? `p.${c.pageStart}` : `pp.${c.pageStart}-${c.pageEnd}`;
}

export function CitationChip({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[styles.chip, !citation.verified && styles.unverified]}>
        <Text style={styles.chipText}>
          §{citation.sectionId} · {pageText(citation)}
          {citation.verified ? '' : ' ?'}
        </Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {citation.label} · {pageText(citation)}
          </Text>
          {citation.headingPath.length > 0 && <Text style={styles.path}>{citation.headingPath.join('  ›  ')}</Text>}
          <ScrollView style={styles.body}>
            {citation.quote !== '' && <Text style={styles.quote}>“{citation.quote}”</Text>}
            <Text style={styles.text}>{citation.text}</Text>
          </ScrollView>
          <Pressable onPress={() => setOpen(false)} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: '#dbeafe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginTop: 6 },
  unverified: { backgroundColor: '#fef3c7' },
  chipText: { fontSize: 12, color: '#1e3a8a' },
  modal: { flex: 1, padding: 20, paddingTop: 56, backgroundColor: '#fff' },
  title: { color: '#111827', fontSize: 18, fontWeight: '700' },
  path: { color: '#6b7280', marginTop: 4, marginBottom: 12 },
  body: { flex: 1 },
  quote: { color: '#111827', fontStyle: 'italic', backgroundColor: '#fef9c3', padding: 8, marginBottom: 12 },
  text: { color: '#111827', fontSize: 15, lineHeight: 22 },
  close: { backgroundColor: '#1e3a8a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  closeText: { color: '#fff', fontWeight: '600' },
});
