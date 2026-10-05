import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import { afterAirNaval, airNavalWinner, groundWinner, resolveCombat, type CombatKind } from '../logic/battle';
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

const PAGE = 'battle';

interface Mod {
  key: string;
  label: string;
  value: number;
}

const MODS: Record<CombatKind, Mod[]> = {
  airNaval: [
    { key: 'ambush', label: 'Ambush (Allies)', value: 4 },
    { key: 'surprise', label: 'Surprise Attack', value: 3 },
    { key: 'y43', label: '1943 turn: Allies, with a US air or carrier unit present', value: 1 },
    { key: 'y44', label: '1944 or 1945 turn: Allies, with a US air or carrier unit present', value: 3 },
  ],
  ground: [
    { key: 'shore', label: 'Shore bombardment (only the Offensives player has ships there)', value: 2 },
    { key: 'air', label: 'Air superiority (only the Offensives player has air or carriers)', value: 2 },
    { key: 'jungle', label: 'Jungle (Offensives player)', value: -1 },
    { key: 'mixed', label: 'Mixed terrain (Offensives player)', value: -2 },
    { key: 'mountains', label: 'Mountains (Offensives player)', value: -3 },
    { key: 'amphib', label: 'Reaction player had land or HQ units there before an amphibious assault', value: 3 },
    { key: 'armor', label: 'British 7th Armor Brigade in the battle (Allies)', value: 1 },
  ],
};

function CombatCalc() {
  const pal = usePalette();
  const [kind, setKind] = useState<CombatKind>('airNaval');
  const [strength, setStrength] = useState<number | undefined>();
  const [roll, setRoll] = useState<number | undefined>();
  const [event, setEvent] = useState(0);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const mods = MODS[kind];
  const modifier = mods.reduce((sum, m) => sum + (on[m.key] ? m.value : 0), 0) + event;
  const ready = strength !== undefined && roll !== undefined;
  const result = ready ? resolveCombat({ kind, strength, roll, modifier }) : undefined;
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.pills}>
        <Pill label="Air-naval" on={kind === 'airNaval'} onPress={() => { setKind('airNaval'); setOn({}); }} />
        <Pill label="Ground" on={kind === 'ground'} onPress={() => { setKind('ground'); setOn({}); }} />
      </View>
      <Stepper label="Total attack strength" value={strength} min={0} max={300} start={10} onChange={setStrength} />
      <Stepper label="Die roll (unmodified, 0–9)" value={roll} min={0} max={9} start={5} onChange={setRoll} />
      <Text style={[styles.heading, { color: pal.accent }]}>MODIFIERS FOR THIS ROLL</Text>
      {mods.map((m) => (
        <CheckRow key={m.key} label={`${m.label}: ${m.value > 0 ? '+' : '−'}${Math.abs(m.value)}`} on={!!on[m.key]} onPress={() => setOn((s) => ({ ...s, [m.key]: !s[m.key] }))} />
      ))}
      <Stepper label="Event card modifier" value={event} min={-9} max={9} start={0} onChange={(v) => setEvent(v ?? 0)} />
      {result ? (
        <ResultBox label={result.critical ? 'CRITICAL HIT' : 'HITS'} headline={`${result.hits} hit${result.hits === 1 ? '' : 's'}`}>
          <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>
            Modified roll {result.modifiedRoll} gives a Combat Effectiveness Rating of {result.rating}. {kind === 'airNaval' ? 'Air units using extended range count half their strength, rounded up.' : ''}
          </Text>
          {result.critical && (
            <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>
              An unmodified 9 is a critical hit: you may apply the hits in any manner, even eliminating units while others remain at full strength.
            </Text>
          )}
        </ResultBox>
      ) : (
        <Text style={[styles.hint, { color: pal.muted }]}>Enter the strength and the die roll.</Text>
      )}
    </View>
  );
}

function AirNavalWinner() {
  const pal = usePalette();
  const [off, setOff] = useState(0);
  const [rea, setRea] = useState(0);
  const [none, setNone] = useState(false);
  const [reaAir, setReaAir] = useState(false);
  const [offAir, setOffAir] = useState(true);
  const [landMoved, setLandMoved] = useState(false);
  const [groundRemains, setGroundRemains] = useState(true);
  const result = airNavalWinner({ anySurvivors: !none, offStrength: off, reaStrength: rea, reaHasAirOrCarrier: reaAir, offHasSurvivingAirOrCarrier: offAir });
  return (
    <View style={{ gap: 6 }}>
      <Stepper label="Offensives player: surviving air-naval strength" value={off} min={0} max={300} start={10} onChange={(v) => setOff(v ?? 0)} />
      <Stepper label="Reaction player: surviving air-naval strength" value={rea} min={0} max={300} start={10} onChange={(v) => setRea(v ?? 0)} />
      <CheckRow label="No air or naval unit survives on either side" on={none} onPress={() => setNone((v) => !v)} />
      <CheckRow label="The Reaction player has air or carrier units present" on={reaAir} onPress={() => setReaAir((v) => !v)} />
      <CheckRow label="The Offensives player has a surviving air or carrier unit" on={offAir} onPress={() => setOffAir((v) => !v)} />
      <CheckRow label="Offensive ground units arrived by land movement" on={landMoved} onPress={() => setLandMoved((v) => !v)} />
      <CheckRow label="Ground units of both sides are in the hex" on={groundRemains} onPress={() => setGroundRemains((v) => !v)} />
      <ResultBox label="AIR-NAVAL WINNER" headline={result.winner === 'offensives' ? 'Offensives player wins' : 'Reaction player wins'}>
        <StepList title="Why" steps={[result.reason]} />
        <StepList title="Then" steps={afterAirNaval(result.winner, { landMovedGround: landMoved, groundRemains })} />
      </ResultBox>
      <Text style={[styles.hint, { color: pal.muted }]}>Strengths count only the units that contributed in the battle hex, as described below.</Text>
    </View>
  );
}

function GroundWinner() {
  const [offSurvives, setOffSurvives] = useState(true);
  const [reaSurvives, setReaSurvives] = useState(true);
  const [offLost, setOffLost] = useState(0);
  const [reaLost, setReaLost] = useState(0);
  const result = groundWinner({ offSurvives, reaSurvives, offStepsLost: offLost, reaStepsLost: reaLost });
  return (
    <View style={{ gap: 6 }}>
      <CheckRow label="The Offensives player has ground units left" on={offSurvives} onPress={() => setOffSurvives((v) => !v)} />
      <CheckRow label="The Reaction player has ground units left" on={reaSurvives} onPress={() => setReaSurvives((v) => !v)} />
      <Stepper label="Offensives player: steps lost" value={offLost} min={0} max={30} start={1} onChange={(v) => setOffLost(v ?? 0)} />
      <Stepper label="Reaction player: steps lost" value={reaLost} min={0} max={30} start={1} onChange={(v) => setReaLost(v ?? 0)} />
      <ResultBox label="GROUND WINNER" headline={result.winner === 'offensives' ? 'Offensives player wins' : 'Reaction player wins'}>
        <StepList title="Why" steps={result.steps} />
      </ResultBox>
    </View>
  );
}

export function Battle() {
  const { ctx } = useHelper();
  return (
    <PageShell title="Battle resolution" subtitle="Rulebook 9.0">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Combat calculator" defaultOpen>
        <CombatCalc />
      </Accordion>
      <Accordion title="Who won the air-naval combat?">
        <AirNavalWinner />
      </Accordion>
      <Accordion title="Who won the ground combat?">
        <GroundWinner />
      </Accordion>
      {pickSections(PAGE, ['sequence', 'participation', 'air-naval', 'hits', 'winner', 'ground', 'retreat', 'post-battle']).map((s) => (
        <RuleSection key={s.key} pageId={PAGE} section={s} />
      ))}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heading: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 6 },
  text: { fontSize: 15, lineHeight: 22 },
  hint: { fontSize: 13 },
});
