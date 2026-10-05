import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePalette } from '../../theme';
import { pickSections } from '../content';
import { aspCost, movementAllowance, type AspSize, type MoveKind } from '../logic/movement';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { CheckRow } from '../ui/CheckRow';
import { PageShell } from '../ui/PageShell';
import { Pill } from '../ui/Pill';
import { ReminderBanner } from '../ui/ReminderBanner';
import { ResultBox } from '../ui/ResultBox';
import { RuleSection } from '../ui/RuleSection';
import { Stepper } from '../ui/Stepper';
import { StepList } from '../ui/VerdictCard';

const PAGE = 'movement';

const KINDS: { kind: MoveKind; label: string; strategic?: string }[] = [
  { kind: 'ground', label: 'Ground' },
  { kind: 'naval', label: 'Naval', strategic: 'Strategic naval movement (port to port)' },
  { kind: 'air', label: 'Air', strategic: 'Strategic air transport (airfield to airfield)' },
  { kind: 'groundTransport', label: 'Strategic transport', strategic: 'The unit starts in a friendly port' },
  { kind: 'amphibious', label: 'Amphibious assault' },
];

function Allowance() {
  const pal = usePalette();
  const [kind, setKind] = useState<MoveKind>('ground');
  const [oc, setOc] = useState(2);
  const [range, setRange] = useState(4);
  const [strategic, setStrategic] = useState(false);
  const def = KINDS.find((k) => k.kind === kind)!;
  const result = movementAllowance({ kind, ocValue: oc, airRange: range, strategic: def.strategic ? strategic : false });
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.pills}>
        {KINDS.map((k) => <Pill key={k.kind} label={k.label} on={kind === k.kind} onPress={() => { setKind(k.kind); setStrategic(false); }} />)}
      </View>
      <Stepper label="OC value of the card (or the event’s value)" value={oc} min={1} max={3} start={2} onChange={(v) => setOc(v ?? 2)} />
      {kind === 'air' && <Stepper label="Air unit range (normal or extended)" value={range} min={1} max={8} start={4} onChange={(v) => setRange(v ?? 4)} />}
      {def.strategic && <CheckRow label={def.strategic} on={strategic} onPress={() => setStrategic((v) => !v)} />}
      <ResultBox
        label="MOVEMENT"
        headline={
          kind === 'ground'
            ? `${result.points} movement point${result.points === 1 ? '' : 's'}`
            : kind === 'air'
              ? `${result.legs} leg${result.legs === 1 ? '' : 's'} of up to ${result.legLength} (${result.points} hexes)`
              : `${result.points} hexes`
        }
      >
        <StepList title="How" steps={result.steps} />
      </ResultBox>
      <Text style={[styles.hint, { color: pal.muted }]}>An event can replace the OC value with its own movement rule.</Text>
    </View>
  );
}

const SIZES: { size: AspSize; label: string }[] = [
  { size: 'division', label: 'Division or smaller' },
  { size: 'corps', label: 'Corps or Army' },
  { size: 'koreanArmy', label: 'Japanese Korean Army' },
];

function Asp() {
  const [size, setSize] = useState<AspSize>('division');
  const [full, setFull] = useState(true);
  const cost = aspCost({ size, full });
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.pills}>
        {SIZES.map((s) => <Pill key={s.size} label={s.label} on={size === s.size} onPress={() => setSize(s.size)} />)}
      </View>
      {size !== 'division' && <CheckRow label="At full strength (otherwise reduced)" on={full} onPress={() => setFull((v) => !v)} />}
      <ResultBox label="AMPHIBIOUS SHIPPING POINTS" headline={`${cost} ASP${cost === 1 ? '' : 's'}`} />
    </View>
  );
}

export function Movement() {
  const { ctx } = useHelper();
  return (
    <PageShell title="Movement and stacking" subtitle="Rulebook 8.0, with 7.22">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Movement allowance" defaultOpen>
        <Allowance />
      </Accordion>
      <Accordion title="Amphibious assault: ASP cost">
        <Asp />
      </Accordion>
      {pickSections(PAGE, ['basics', 'naval', 'air', 'zoi', 'ground', 'strategic', 'amphibious', 'stacking', 'armor']).map((s) => (
        <RuleSection key={s.key} pageId={PAGE} section={s} />
      ))}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontSize: 13 },
});
