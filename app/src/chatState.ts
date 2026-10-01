import type { AnswerResult, AskResult, ClarifyQuestion, NotFoundResult } from './types';

export type Message =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; result: AnswerResult | NotFoundResult }
  | { kind: 'error'; text: string };

export interface PendingClarification {
  pendingId: string;
  questions: ClarifyQuestion[];
  selected: (string | undefined)[];
}

export interface ChatState {
  messages: Message[];
  pending?: PendingClarification;
  busy: boolean;
}

export type Action =
  | { type: 'asked'; text: string }
  | { type: 'result'; result: AskResult }
  | { type: 'select'; index: number; option: string }
  | { type: 'submitted' }
  | { type: 'failed'; message: string }
  | { type: 'reset' };

export const initialState: ChatState = { messages: [], busy: false };

export function reduce(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'asked':
      return { ...state, busy: true, messages: [...state.messages, { kind: 'user', text: action.text }] };
    case 'result': {
      const r = action.result;
      if (r.type === 'clarify') {
        return {
          ...state,
          busy: false,
          pending: { pendingId: r.pendingId, questions: r.questions, selected: r.questions.map(() => undefined) },
        };
      }
      return { ...state, busy: false, pending: undefined, messages: [...state.messages, { kind: 'assistant', result: r }] };
    }
    case 'select': {
      if (!state.pending) return state;
      const selected = [...state.pending.selected];
      selected[action.index] = action.option;
      return { ...state, pending: { ...state.pending, selected } };
    }
    case 'submitted':
      return { ...state, pending: undefined, busy: true };
    case 'failed':
      return { ...state, busy: false, messages: [...state.messages, { kind: 'error', text: action.message }] };
    case 'reset':
      return initialState;
  }
}
