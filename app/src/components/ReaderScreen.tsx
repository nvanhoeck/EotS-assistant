import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { createApi } from '../api';
import { toParagraphs } from '../paragraphs';
import { TEXT_SIZES } from '../textSize';
import { serif, usePalette } from '../theme';
import type { SectionRef, SectionView } from '../types';
import { ReaderText } from './ReaderText';

type Api = ReturnType<typeof createApi>;

interface Props {
  api: Api;
  entry: SectionRef;
  backText: string;
  sizeIndex: number;
  onBack(): void;
  onOpen(ref: SectionRef): void;
  onStep(ref: SectionRef): void;
  onSize(delta: -1 | 1): void;
}

function pages(v: SectionView): string {
  return v.pageStart === v.pageEnd ? `p. ${v.pageStart}` : `pp. ${v.pageStart}–${v.pageEnd}`;
}

export function ReaderScreen({ api, entry, backText, sizeIndex, onBack, onOpen, onStep, onSize }: Props) {
  const pal = usePalette();
  const [view, setView] = useState<SectionView>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [showKids, setShowKids] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let live = true;
    setView(undefined);
    setError(undefined);
    api.section(entry.sectionId).then(
      (v) => {
        if (!live) return;
        setView(v);
        setShowKids(v.text.trim() === ''); // a bare heading would otherwise be an empty page
        scroll.current?.scrollTo({ y: 0, animated: false });
        fade.setValue(0);
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      },
      (e: Error) => {
        if (live) setError(e.message);
      },
    );
    return () => {
      live = false;
    };
  }, [api, entry.sectionId, attempt, fade]);

  const paragraphs = useMemo(() => toParagraphs(view?.text ?? ''), [view]);
  const size = TEXT_SIZES[sizeIndex];

  return (
    <View style={[styles.fill, { backgroundColor: pal.page }]}>
      <View style={[styles.topBar, { backgroundColor: pal.bar, borderColor: pal.rule }]}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backWrap}>
          <Text style={[styles.back, { color: pal.accent }]} numberOfLines={1}>
            ‹ {backText}
          </Text>
        </Pressable>
        {view && <Text style={[styles.page, { color: pal.muted }]}>{pages(view)}</Text>}
        <Pressable onPress={() => onSize(-1)} hitSlop={8}>
          <Text style={[styles.size, { color: pal.ink, opacity: sizeIndex === 0 ? 0.3 : 1 }]}>A−</Text>
        </Pressable>
        <Pressable onPress={() => onSize(1)} hitSlop={8}>
          <Text style={[styles.size, styles.sizeBig, { color: pal.ink, opacity: sizeIndex === TEXT_SIZES.length - 1 ? 0.3 : 1 }]}>A+</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: pal.ink, fontFamily: serif }]}>{error}</Text>
          <Pressable onPress={() => setAttempt((n) => n + 1)} style={[styles.retry, { borderColor: pal.accent }]}>
            <Text style={{ color: pal.accent, fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      ) : !view ? (
        <ActivityIndicator style={styles.spin} color={pal.accent} />
      ) : (
        <>
          <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
            <Animated.View style={[styles.column, { opacity: fade }]}>
              <Text style={[styles.eyebrow, { color: pal.accent, fontFamily: serif }]}>{view.sectionId}</Text>
              {view.title !== null && (
                <Text selectable style={[styles.title, { color: pal.ink, fontFamily: serif }]}>
                  {view.title}
                </Text>
              )}
              {view.headingPath.length > 0 && (
                <Text style={[styles.crumbs, { color: pal.muted }]}>{view.headingPath.join('  ›  ')}</Text>
              )}
              <View style={[styles.hair, { backgroundColor: pal.rule }]} />

              <ReaderText paragraphs={paragraphs} refs={view.crossRefs} size={size} onOpen={onOpen} />

              {view.children.length > 0 && (
                <View style={styles.kids}>
                  <Pressable onPress={() => setShowKids((v) => !v)} style={styles.kidsHead}>
                    <Text style={[styles.kidsTitle, { color: pal.ink, fontFamily: serif }]}>
                      Subsections ({view.children.length}) {showKids ? '▾' : '▸'}
                    </Text>
                  </Pressable>
                  {showKids &&
                    view.children.map((k) => (
                      <Pressable
                        key={k.sectionId}
                        onPress={() => onOpen({ sectionId: k.sectionId, label: k.label })}
                        style={[styles.kid, { borderColor: pal.rule }]}
                      >
                        <View style={styles.fill}>
                          <Text numberOfLines={1} style={{ color: pal.ink, fontFamily: serif, fontSize: 16, fontWeight: '600' }}>
                            {k.label}
                          </Text>
                          {k.summary !== '' && (
                            <Text numberOfLines={2} style={{ color: pal.muted, fontSize: 13, marginTop: 2 }}>
                              {k.summary}
                            </Text>
                          )}
                        </View>
                        <Text style={{ color: pal.muted, fontSize: 22, marginLeft: 8 }}>›</Text>
                      </Pressable>
                    ))}
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.nav, { backgroundColor: pal.bar, borderColor: pal.rule }]}>
            <Pressable
              disabled={!view.prev}
              onPress={() => view.prev && onStep(view.prev)}
              style={[styles.navBtn, !view.prev && styles.dim]}
            >
              <Text numberOfLines={1} style={{ color: pal.accent, fontFamily: serif }}>
                ‹ {view.prev?.label ?? ''}
              </Text>
            </Pressable>
            <Pressable
              disabled={!view.next}
              onPress={() => view.next && onStep(view.next)}
              style={[styles.navBtn, styles.navNext, !view.next && styles.dim]}
            >
              <Text numberOfLines={1} style={{ color: pal.accent, fontFamily: serif, textAlign: 'right' }}>
                {view.next?.label ?? ''} ›
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  backWrap: { flex: 1 },
  back: { fontSize: 15, fontWeight: '600' },
  page: { fontSize: 13 },
  size: { fontSize: 15, fontWeight: '600' },
  sizeBig: { fontSize: 19 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, textAlign: 'center' },
  retry: { marginTop: 16, borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  spin: { marginTop: 40 },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 640 },
  eyebrow: { fontSize: 13, letterSpacing: 2, fontVariant: ['small-caps'] },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700', marginTop: 6 },
  crumbs: { fontSize: 12, marginTop: 8 },
  hair: { height: 1, width: 48, marginVertical: 20 },
  kids: { marginTop: 12 },
  kidsHead: { paddingVertical: 10 },
  kidsTitle: { fontSize: 17, fontWeight: '700' },
  kid: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1 },
  nav: { flexDirection: 'row', borderTopWidth: 1 },
  navBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 16 },
  navNext: { alignItems: 'flex-end' },
  dim: { opacity: 0.3 },
});
