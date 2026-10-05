/**
 * Shared by the helper forms. A form is an ordered list of questions; an answer to one question
 * invalidates every later answer, because those may no longer apply.
 */

/** Sets one answer and forgets every answer after it. */
export function answerIn<A extends object>(order: (keyof A)[], answers: A, key: keyof A, value: string): A {
  const out: Partial<Record<keyof A, string>> = {};
  for (const k of order) {
    if (k === key) {
      out[k] = value;
      break;
    }
    if (answers[k] !== undefined) out[k] = answers[k] as unknown as string;
  }
  return out as A;
}

/** Removes the last answer given. */
export function goBackIn<A extends object>(order: (keyof A)[], answers: A): A {
  const out: Partial<A> = { ...answers };
  for (const k of [...order].reverse()) {
    if (out[k] !== undefined) {
      delete out[k];
      break;
    }
  }
  return out as A;
}
