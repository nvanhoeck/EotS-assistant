import { answerQuestion, nextQuestion, type ReinforcementAnswers } from '../../src/helper/logic/reinforcement';
import type { GameContext } from '../../src/helper/types';

/** Every complete set of answers the form can produce, found by following every option of every question. */
export function allPaths(ctx: GameContext, from: ReinforcementAnswers = {}): ReinforcementAnswers[] {
  const q = nextQuestion(from, ctx);
  if (!q) return [from];
  return q.options.flatMap((o) => allPaths(ctx, answerQuestion(from, q.key, o.value)));
}
