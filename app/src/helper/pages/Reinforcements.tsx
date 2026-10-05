import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '../../theme';
import { pickSections } from '../content';
import {
  QUESTION_ORDER, answerQuestion, checkReinforcement, goBack, nextQuestion, questionFor, type ReinforcementAnswers,
} from '../logic/reinforcement';
import { useHelper } from '../nav';
import { remindersFor, remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { ChoiceForm } from '../ui/ChoiceForm';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { ReminderCard } from '../ui/ReminderCard';
import { RuleSection } from '../ui/RuleSection';
import { VerdictCard } from '../ui/VerdictCard';

const PAGE = 'reinforcements';

export function Reinforcements() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const [answers, setAnswers] = useState<ReinforcementAnswers>({});

  const question = nextQuestion(answers, ctx);
  const answered = QUESTION_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = questionFor(key, answers, ctx);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  const result = question ? undefined : checkReinforcement(answers, ctx);
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);
  const endReminders = remindersFor(`${PAGE}#end`, ctx);

  return (
    <PageShell title="Reinforcement Segment" subtitle="Rulebook 9.0 and 4.11">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />

      <Accordion title="Reinforcement helper" defaultOpen>
        <ChoiceForm
          answered={answered}
          question={question}
          onAnswer={(key, value) => setAnswers((a) => answerQuestion(a, key, value))}
          onBack={() => setAnswers(goBack)}
          onRestart={() => setAnswers({})}
        />
        {result && <VerdictCard result={result} />}
      </Accordion>

      <GroupHeading>Who can be placed where</GroupHeading>
      {section(['ground', 'naval', 'air', 'hq'])}

      <GroupHeading>Restrictions</GroupHeading>
      {section(['general', 'zoi'])}

      <GroupHeading>National restrictions</GroupHeading>
      {section(['chinese', 'delayed', 'sent-to-europe'])}

      {endReminders.length > 0 && (
        <View style={{ gap: 8 }}>
          <GroupHeading>At the end of this segment</GroupHeading>
          {endReminders.map((i) => <ReminderCard key={`${i.reminder.id}-${i.status}`} item={i} />)}
        </View>
      )}
      <Text style={{ color: pal.muted, fontSize: 12, marginTop: 24 }}>
        The helper cannot see the board: check the listed map conditions yourself.
      </Text>
    </PageShell>
  );
}
