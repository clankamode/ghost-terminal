import { describe, expect, it } from 'vitest';
import {
  CONTINUE_BUTTON_LABEL,
  MISSING_CONTINUE_SAVE_NOTICE,
  formatContinueRunNotice,
} from './continueRunCopy';

describe('continueRunCopy', () => {
  it('states that mid-level progress is not resumed', () => {
    const lines = formatContinueRunNotice(3);
    expect(lines[0]).toContain('level 3');
    expect(lines.join('\n')).toMatch(/not resumed/i);
    expect(CONTINUE_BUTTON_LABEL).toBe('Continue Run');
  });

  it('names a missing-save continue as a new run', () => {
    expect(MISSING_CONTINUE_SAVE_NOTICE).toMatch(/no saved run/i);
    expect(MISSING_CONTINUE_SAVE_NOTICE).toMatch(/new run/i);
  });
});
