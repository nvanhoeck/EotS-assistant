import React, { useState } from 'react';
import { Text } from 'react-native';
import { usePalette } from '../../theme';
import { pickSections } from '../content';
import {
  REPLACEMENT_ORDER, answerReplacement, checkReplacement, goBackReplacement, nextReplacementQuestion, replacementQuestionFor,
  type ReplacementAnswers,
} from '../logic/replacement';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { ChoiceForm } from '../ui/ChoiceForm';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { ReplacementCard } from '../ui/ReplacementCard';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'replacements';

export function Replacements() {
  const { ctx } = useHelper();
  const pal = usePalette();
  const [answers, setAnswers] = useState<ReplacementAnswers>({});

  const question = nextReplacementQuestion(answers, ctx);
  const answered = REPLACEMENT_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = replacementQuestionFor(key, answers, ctx);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  const result = question ? undefined : checkReplacement(answers, ctx);
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);

  return (
    <PageShell title="Replacement Segment" subtitle="Rulebook 11.0 and 4.12">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />

      <Accordion title="Replacement helper" defaultOpen>
        <ChoiceForm
          answered={answered}
          question={question}
          onAnswer={(key, value) => setAnswers((a) => answerReplacement(a, key, value))}
          onBack={() => setAnswers(goBackReplacement)}
          onRestart={() => setAnswers({})}
        />
        {result && <ReplacementCard result={result} />}
      </Accordion>

      <GroupHeading>General</GroupHeading>
      {section(['general', 'dots'])}

      <GroupHeading>Japanese replacements</GroupHeading>
      {section(['japan-naval', 'japan-air', 'japan-ground'])}

      <GroupHeading>Allied replacements</GroupHeading>
      {section(['allied-ground', 'allied-air', 'allied-naval', 'chinese', 'dutch'])}

      <Text style={{ color: pal.muted, fontSize: 12, marginTop: 24 }}>
        The scheduled naval numbers are on the Replacements Chart, which the helper does not contain. The helper cannot see the board: check the listed conditions yourself.
      </Text>
    </PageShell>
  );
}
