import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { usePalette } from '../../theme';
import { pickSections } from '../content';
import {
  END_ORDER, answerEnd, checkEndOfTurn, endQuestionFor, goBackEnd, nextEndQuestion, type EndAnswers,
} from '../logic/endOfTurn';
import { useHelper } from '../nav';
import { remindersForPage } from '../reminders';
import { Accordion } from '../ui/Accordion';
import { ChoiceForm } from '../ui/ChoiceForm';
import { EndCard } from '../ui/EndCard';
import { PageShell } from '../ui/PageShell';
import { ReminderBanner } from '../ui/ReminderBanner';
import { RuleSection } from '../ui/RuleSection';

const PAGE = 'end-of-turn';

export function EndOfTurn() {
  const { ctx, dispatch } = useHelper();
  const pal = usePalette();
  const [answers, setAnswers] = useState<EndAnswers>({});
  const [advanced, setAdvanced] = useState(false);

  const question = nextEndQuestion(answers, ctx);
  const answered = END_ORDER.filter((k) => answers[k] !== undefined).map((key) => {
    const q = endQuestionFor(key, ctx);
    return { key, prompt: q.prompt, label: q.options.find((o) => o.value === answers[key])?.label ?? String(answers[key]) };
  });
  const result = question ? undefined : checkEndOfTurn(answers);

  function restart() {
    setAnswers({});
    setAdvanced(false);
  }

  return (
    <PageShell title="End of Turn Phase" subtitle="Rulebook 4.5 and 16.0">
      <ReminderBanner items={remindersForPage(PAGE, ctx)} />
      <Accordion title="End-of-turn walkthrough" defaultOpen>
        <ChoiceForm
          answered={answered}
          question={question}
          onAnswer={(key, value) => setAnswers((a) => answerEnd(a, key, value))}
          onBack={() => setAnswers(goBackEnd)}
          onRestart={restart}
        />
        {result && (
          <EndCard result={result}>
            {result.outcome === 'continue' && (
              <Pressable
                onPress={() => {
                  dispatch({ type: 'nextTurn' });
                  setAdvanced(true);
                }}
                disabled={advanced || ctx.turn === undefined}
                style={[styles.button, { borderColor: pal.accent, opacity: advanced || ctx.turn === undefined ? 0.5 : 1 }]}
                accessibilityRole="button"
              >
                <Text style={[styles.buttonText, { color: pal.accent }]}>
                  {advanced ? `Game status is now turn ${ctx.turn}` : ctx.turn === undefined ? 'Set the turn in the game status to advance it' : `Advance the game status to turn ${ctx.turn + 1}`}
                </Text>
              </Pressable>
            )}
          </EndCard>
        )}
      </Accordion>
      {pickSections(PAGE, ['checks', 'victory', 'markers']).map((s) => <RuleSection key={s.key} pageId={PAGE} section={s} />)}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  button: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
