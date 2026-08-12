import { describe, expect, it } from 'vitest';
import { isTraceTimerCritical } from './statusBarTime';

describe('isTraceTimerCritical', () => {
  it('is critical at 30 seconds and below', () => {
    expect(isTraceTimerCritical(30)).toBe(true);
    expect(isTraceTimerCritical(0)).toBe(true);
  });

  it('is not critical above 30 seconds', () => {
    expect(isTraceTimerCritical(31)).toBe(false);
    expect(isTraceTimerCritical(300)).toBe(false);
  });
});
