import { describe, it, expect } from 'vitest';
import { NOT_SURE } from '../src/types.js';

describe('scaffold', () => {
  it('loads shared types', () => {
    expect(NOT_SURE).toBe('Not sure');
  });
});
