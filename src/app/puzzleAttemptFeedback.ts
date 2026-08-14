/** Whether to print the generic "Access denied" line after a failed solve. */
export function shouldPrintAccessDenied(options: {
  solved: boolean;
  puzzleStillActive: boolean;
  puzzleProvidedFeedback: boolean;
}): boolean {
  // Format rejects and wrong-answer feedback already speak for themselves.
  // Hard-fail tears down the puzzle before we return here.
  return !options.solved && options.puzzleStillActive && !options.puzzleProvidedFeedback;
}
