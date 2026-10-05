import React, { useState } from 'react';
import { View } from 'react-native';
import { pickSections } from '../content';
import {
  ATTRITION_ORDER, answerAttrition, attritionQuestionFor, checkAttrition, goBackAttrition, nextAttritionQuestion, type AttritionAnswers,
} from '../logic/attrition';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { AttritionCard } from '../ui/AttritionCard';
import { ChoiceForm } from '../ui/ChoiceForm';
import { PageLink } from '../ui/PageLink';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'attrition';

export function Attrition() {
  const { ctx } = useHelper();
  const [answers, setAnswers] = useState<AttritionAnswers>({});

  const question = nextAttritionQuestion(answers);
  const answered = ATTRITION_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = attritionQuestionFor(key);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  const result = question ? undefined : checkAttrition(answers);

  return (
    <PageShell title="Attrition Phase" subtitle="Rulebook 4.4 and 6.24">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="What happens to this unit?" defaultOpen>
        <ChoiceForm
          answered={answered}
          question={question}
          onAnswer={(key, value) => setAnswers((a) => answerAttrition(a, key, value))}
          onBack={() => setAnswers(goBackAttrition)}
          onRestart={() => setAnswers({})}
        />
        {result && <AttritionCard result={result} />}
      </Accordion>
      {pickSections(PAGE, ['rules']).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />)}
      <View style={{ marginTop: 16 }}>
        <PageLink id="supply" />
      </View>
    </PageShell>
  );
}
