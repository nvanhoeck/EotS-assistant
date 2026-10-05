import { answerQuestion, nextQuestion, type ReinforcementAnswers } from '../../src/helper/logic/reinforcement';
import type { GameContext } from '../../src/helper/types';

/** Every complete set of answers the form can produce, found by following every option of every question. */
export function allPaths(ctx: GameContext, from: ReinforcementAnswers = {}): ReinforcementAnswers[] {
  const q = nextQuestion(from, ctx);
  if (!q) return [from];
  return q.options.flatMap((o) => allPaths(ctx, answerQuestion(from, q.key, o.value)));
}

import {
  answerReplacement, nextReplacementQuestion, type ReplacementAnswers,
} from '../../src/helper/logic/replacement';

/** Every complete set of answers the Replacement form can produce. */
export function allReplacementPaths(ctx: GameContext, from: ReplacementAnswers = {}): ReplacementAnswers[] {
  const q = nextReplacementQuestion(from, ctx);
  if (!q) return [from];
  return q.options.flatMap((o) => allReplacementPaths(ctx, answerReplacement(from, q.key, o.value)));
}

import { answerCard, nextCardQuestion, type CardAnswers } from '../../src/helper/logic/strategyCards';

/** Every complete set of answers the card-play form can produce. */
export function allCardPaths(from: CardAnswers = {}): CardAnswers[] {
  const q = nextCardQuestion(from);
  if (!q) return [from];
  return q.options.flatMap((o) => allCardPaths(answerCard(from, q.key, o.value)));
}

import { answerAttrition, nextAttritionQuestion, type AttritionAnswers } from '../../src/helper/logic/attrition';

/** Every complete set of answers the attrition form can produce. */
export function allAttritionPaths(from: AttritionAnswers = {}): AttritionAnswers[] {
  const q = nextAttritionQuestion(from);
  if (!q) return [from];
  return q.options.flatMap((o) => allAttritionPaths(answerAttrition(from, q.key, o.value)));
}

import { answerEnd, nextEndQuestion, type EndAnswers } from '../../src/helper/logic/endOfTurn';

/** Every complete set of answers the End of Turn form can produce. */
export function allEndPaths(ctx: GameContext, from: EndAnswers = {}): EndAnswers[] {
  const q = nextEndQuestion(from, ctx);
  if (!q) return [from];
  return q.options.flatMap((o) => allEndPaths(ctx, answerEnd(from, q.key, o.value)));
}

import { answerActivation, nextActivationQuestion, type ActivationAnswers } from '../../src/helper/logic/activation';

/** Every complete set of answers the activation form can produce. */
export function allActivationPaths(from: ActivationAnswers = {}): ActivationAnswers[] {
  const q = nextActivationQuestion(from);
  if (!q) return [from];
  return q.options.flatMap((o) => allActivationPaths(answerActivation(from, q.key, o.value)));
}
