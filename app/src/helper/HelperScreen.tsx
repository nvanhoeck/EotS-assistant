import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../theme';
import { emptyContext, reduceContext, type ContextAction } from './context';
import { loadContext, saveContext } from './contextStorage';
import { HelperProvider, type HelperApi } from './nav';
import { Home } from './pages/Home';
import { SCREENS } from './screens';
import type { GameContext } from './types';
import { ContextBar } from './ui/ContextBar';

interface Props {
  pageId?: string;
  canGoBack: boolean;
  backText: string;
  onBack(): void;
  onOpenPage(id: string): void;
  onOpenSection(sectionId: string): void;
}

export function HelperScreen({ pageId, canGoBack, backText, onBack, onOpenPage, onOpenSection }: Props) {
  const pal = usePalette();
  const [ctx, setCtx] = useState<GameContext>(emptyContext);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadContext().then((c) => {
      setCtx(c);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveContext(ctx);
  }, [ctx, loaded]);

  const dispatch = useCallback((a: ContextAction) => setCtx((c) => reduceContext(c, a)), []);
  const api = useMemo<HelperApi>(() => ({ ctx, dispatch, openPage: onOpenPage, openSection: onOpenSection }), [ctx, dispatch, onOpenPage, onOpenSection]);

  const Screen = (pageId && SCREENS[pageId]) || Home;

  return (
    <HelperProvider value={api}>
      <View style={[styles.root, { backgroundColor: pal.page }]}>
        {canGoBack && (
          <Pressable onPress={onBack} style={[styles.back, { borderColor: pal.rule, backgroundColor: pal.bar }]} accessibilityRole="button">
            <Text style={[styles.backText, { color: pal.accent }]}>‹ {backText}</Text>
          </Pressable>
        )}
        <ContextBar />
        <View style={styles.page}>
          <Screen />
        </View>
      </View>
    </HelperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  backText: { fontSize: 15, fontWeight: '700' },
  page: { flex: 1 },
});
