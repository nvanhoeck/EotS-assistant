import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { splitReferences } from '../linkify';
import type { Paragraph } from '../paragraphs';
import { serif, usePalette } from '../theme';
import type { SectionRef } from '../types';

interface Props {
  paragraphs: Paragraph[];
  refs: SectionRef[];
  size: number;
  onOpen(ref: SectionRef): void;
}

/** Body text set like a page: spaced paragraphs, bold run-in rule numbers, underlined cross-references. */
export function ReaderText({ paragraphs, refs, size, onOpen }: Props) {
  const pal = usePalette();
  const byId = useMemo(() => new Map(refs.map((r) => [r.sectionId, r])), [refs]);
  const ids = useMemo(() => refs.map((r) => r.sectionId), [refs]);

  return (
    <View>
      {paragraphs.map((p, i) => (
        <Text
          key={i}
          selectable
          style={{
            fontFamily: serif,
            fontSize: size,
            lineHeight: Math.round(size * 1.55),
            color: pal.ink,
            textAlign: 'left',
            marginBottom: Math.round(size * 0.9),
          }}
        >
          {p.lead !== null && <Text style={{ fontWeight: '700' }}>{p.lead}{'  '}</Text>}
          {splitReferences(p.text, ids).map((s, j) =>
            s.ref ? (
              <Text
                key={j}
                style={{ color: pal.accent, textDecorationLine: 'underline' }}
                onPress={() => onOpen(byId.get(s.ref!)!)}
              >
                {s.text}
              </Text>
            ) : (
              s.text
            ),
          )}
        </Text>
      ))}
    </View>
  );
}
