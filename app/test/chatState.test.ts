import { describe, it, expect } from 'vitest';
import { initialState, reduce } from '../src/chatState';
import type { AnswerResult, ClarifyResult } from '../src/types';

const clarify: ClarifyResult = {
  type: 'clarify',
  pendingId: 'p1',
  questions: [
    { text: 'Port?', options: ['Yes', 'No', 'Not sure'], sourceSectionId: '8.31' },
    { text: 'Night?', options: ['Yes', 'No', 'Not sure'], sourceSectionId: '8.31' },
  ],
};
const answer: AnswerResult = { type: 'answer', answer: 'ok', steps: [], assumptions: [], citations: [], unverified: 0 };

describe('chat reducer', () => {
  it('adds the user message and goes busy', () => {
    const s = reduce(initialState, { type: 'asked', text: 'hi' });
    expect(s.busy).toBe(true);
    expect(s.messages).toEqual([{ kind: 'user', text: 'hi' }]);
  });
  it('a clarify result creates a pending card with empty selections', () => {
    const s = reduce(reduce(initialState, { type: 'asked', text: 'hi' }), { type: 'result', result: clarify });
    expect(s.busy).toBe(false);
    expect(s.pending).toEqual({ pendingId: 'p1', questions: clarify.questions, selected: [undefined, undefined] });
  });
  it('select stores an option; ready only when all are chosen', () => {
    let s = reduce(initialState, { type: 'result', result: clarify });
    s = reduce(s, { type: 'select', index: 0, option: 'Yes' });
    expect(s.pending!.selected).toEqual(['Yes', undefined]);
    s = reduce(s, { type: 'select', index: 1, option: 'No' });
    expect(s.pending!.selected).toEqual(['Yes', 'No']);
  });
  it('submitting clears pending and goes busy', () => {
    let s = reduce(initialState, { type: 'result', result: clarify });
    s = reduce(s, { type: 'submitted' });
    expect(s.pending).toBeUndefined();
    expect(s.busy).toBe(true);
  });
  it('an answer result is appended as an assistant message', () => {
    const s = reduce(initialState, { type: 'result', result: answer });
    expect(s.messages.at(-1)).toEqual({ kind: 'assistant', result: answer });
  });
  it('failures add an error message and stop busy', () => {
    const s = reduce({ ...initialState, busy: true }, { type: 'failed', message: 'boom' });
    expect(s.busy).toBe(false);
    expect(s.messages.at(-1)).toEqual({ kind: 'error', text: 'boom' });
  });
  it('reset returns to the initial state', () => {
    const s = reduce(reduce(initialState, { type: 'asked', text: 'x' }), { type: 'reset' });
    expect(s).toEqual(initialState);
  });
});
