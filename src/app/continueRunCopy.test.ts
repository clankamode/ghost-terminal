import { describe, expect, it } from 'vitest';
import { CONTINUE_BUTTON_LABEL, formatContinueRunNotice } from './continueRunCopy';

describe('continueRunCopy', () => {
  it('states that mid-level progress is not resumed', () => {
    const lines = formatContinueRunNotice(3);
    expect(lines[0]).toContain('level 3');
    expect(lines.join('\n')).toMatch(/not resumed/i);
    expect(CONTINUE_BUTTON_LABEL).toBe('Continue Run');
  });
});
