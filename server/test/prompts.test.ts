import { describe, it, expect } from 'vitest';
import { ANSWER_SYSTEM, answerUser } from '../src/orchestrate/prompts.js';

describe('answerUser outline', () => {
  it('puts the outline before the excerpts when given', () => {
    const u = answerUser('q', [], [], [], [], '4.0 Sequence of Play\n  4.1 The Strategic Phase');
    expect(u).toContain('RULE OUTLINE');
    expect(u.indexOf('RULE OUTLINE')).toBeLessThan(u.indexOf('RULES EXCERPTS'));
  });
  it('omits the section when there is no outline', () => {
    expect(answerUser('q', [], [], [], [])).not.toContain('RULE OUTLINE');
  });
  it('tells the model to cover every outline line', () => {
    expect(ANSWER_SYSTEM).toContain('RULE OUTLINE');
  });
});
