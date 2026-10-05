import React, { useState } from 'react';
import { pickSections } from '../content';
import {
  CARD_ORDER, answerCard, cardQuestionFor, checkCardPlay, goBackCard, nextCardQuestion, type CardAnswers,
} from '../logic/strategyCards';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { CardPlayCard } from '../ui/CardPlayCard';
import { ChoiceForm } from '../ui/ChoiceForm';
import { GroupHeading, PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'strategy-cards';

export function StrategyCards() {
  const { ctx } = useHelper();
  const [answers, setAnswers] = useState<CardAnswers>({});

  const question = nextCardQuestion(answers);
  const answered = CARD_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = cardQuestionFor(key, answers);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  const result = question ? undefined : checkCardPlay(answers);
  const section = (keys: string[]) => pickSections(PAGE, keys).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />);

  return (
    <PageShell title="Strategy Cards" subtitle="Deal Strategy Cards segment (4.14) and the cards themselves (5.0)">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />

      <Accordion title="What can I do with this card?" defaultOpen>
        <ChoiceForm
          answered={answered}
          question={question}
          onAnswer={(key, value) => setAnswers((a) => answerCard(a, key, value))}
          onBack={() => setAnswers(goBackCard)}
          onRestart={() => setAnswers({})}
        />
        {result && <CardPlayCard result={result} />}
      </Accordion>

      <GroupHeading>The deal</GroupHeading>
      {section(['deal', 'public-info'])}

      <GroupHeading>Playing a card</GroupHeading>
      {section(['basics', 'ops-value', 'intelligence'])}

      <GroupHeading>Kinds of events</GroupHeading>
      {section(['military', 'reaction', 'resource', 'political'])}

      <GroupHeading>Drawing, removing, special</GroupHeading>
      {section(['drawing', 'removing', 'special'])}
    </PageShell>
  );
}
