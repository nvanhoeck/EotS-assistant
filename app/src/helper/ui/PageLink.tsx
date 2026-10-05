import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useHelper } from '../nav';
import { pageTitle } from '../registry';
import { usePalette } from '../../theme';

export function PageLink({ id }: { id: string }) {
  const { openPage } = useHelper();
  const pal = usePalette();
  return (
    <Pressable onPress={() => openPage(id)} hitSlop={8} accessibilityRole="link">
      <Text style={[styles.text, { color: pal.accent }]}>→ {pageTitle(id)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ text: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' } });
