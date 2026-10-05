import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serif, usePalette } from '../../theme';
import { pickSections } from '../content';
import {
  ACTIVATION_ORDER, activatableUnits, activationQuestionFor, answerActivation, checkActivation, goBackActivation, nextActivationQuestion,
  type ActivationAnswers,
} from '../logic/activation';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { ActivationCard } from '../ui/ActivationCard';
import { ChoiceForm } from '../ui/ChoiceForm';
import { PageLink } from '../ui/PageLink';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { ResultBox } from '../ui/ResultBox';
import { RuleSection } from '../ui/RuleSection';
import { Stepper } from '../ui/Stepper';

const PAGE = 'offensives';

function WhoCanActivate() {
  const [answers, setAnswers] = useState<ActivationAnswers>({});
  const question = nextActivationQuestion(answers);
  const answered = ACTIVATION_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = activationQuestionFor(key);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  return (
    <>
      <ChoiceForm
        answered={answered}
        question={question}
        onAnswer={(key, value) => setAnswers((a) => answerActivation(a, key, value))}
        onBack={() => setAnswers(goBackActivation)}
        onRestart={() => setAnswers({})}
      />
      {!question && <ActivationCard result={checkActivation(answers)} />}
    </>
  );
}

function HowMany() {
  const pal = usePalette();
  const [value, setValue] = useState<number | undefined>();
  const [efficiency, setEfficiency] = useState<number | undefined>();
  const ready = value !== undefined && efficiency !== undefined;
  return (
    <View style={{ gap: 6 }}>
      <Stepper label="Card OC value, or the event’s Logistics value" value={value} min={0} max={9} start={2} onChange={setValue} />
      <Stepper label="Efficiency rating of the HQ" value={efficiency} min={0} max={9} start={1} onChange={setEfficiency} />
      {ready ? (
        <ResultBox label="UNITS YOU MAY ACTIVATE" headline={`${activatableUnits(value, efficiency)} units`}>
          <Text style={[styles.text, { color: pal.ink, fontFamily: serif }]}>
            The Reaction player uses the same sum with the Offensives card’s OC value and the Efficiency of the HQ they react with (or their counteroffensive card’s Logistics value).
          </Text>
        </ResultBox>
      ) : (
        <Text style={[styles.text, { color: pal.muted }]}>Enter both numbers.</Text>
      )}
    </View>
  );
}

export function Offensives() {
  const { ctx } = useHelper();
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);
  return (
    <PageShell title="Offensives Segment" subtitle="Rulebook 6.0 and 4.22">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="Who can activate this unit?" defaultOpen>
        <WhoCanActivate />
      </Accordion>
      <Accordion title="How many units can I activate?">
        <HowMany />
      </Accordion>
      <GroupHeading>The offensive step by step</GroupHeading>
      {section(['overview', 'activation', 'movement', 'declare', 'intelligence', 'reaction', 'resolve'])}
      <View style={{ marginTop: 16, gap: 8 }}>
        <PageLink id="movement" />
        <PageLink id="battle" />
        <PageLink id="strategy-cards" />
        <PageLink id="supply" />
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({ text: { fontSize: 15, lineHeight: 22 } });
