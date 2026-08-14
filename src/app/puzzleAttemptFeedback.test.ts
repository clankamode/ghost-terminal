import { describe, expect, it } from 'vitest';

import { shouldPrintAccessDenied } from './puzzleAttemptFeedback';

describe('shouldPrintAccessDenied', () => {
  it('prints for silent wrong answers while the puzzle stays active', () => {
    expect(
      shouldPrintAccessDenied({
        solved: false,
        puzzleStillActive: true,
        puzzleProvidedFeedback: false,
      }),
    ).toBe(true);
  });

  it('skips when the puzzle already emitted terminal feedback', () => {
    expect(
      shouldPrintAccessDenied({
        solved: false,
        puzzleStillActive: true,
        puzzleProvidedFeedback: true,
      }),
    ).toBe(false);
  });

  it('skips after hard-fail teardown', () => {
    expect(
      shouldPrintAccessDenied({
        solved: false,
        puzzleStillActive: false,
        puzzleProvidedFeedback: false,
      }),
    ).toBe(false);
  });

  it('skips when the solve succeeded', () => {
    expect(
      shouldPrintAccessDenied({
        solved: true,
        puzzleStillActive: true,
        puzzleProvidedFeedback: false,
      }),
    ).toBe(false);
  });
});
