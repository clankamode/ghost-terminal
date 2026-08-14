/** Honest copy for Continue: progress stats restore; mid-level map does not. */
export function formatContinueRunNotice(level: number): string[] {
  return [
    `CONTINUING RUN at level ${level} — score, lives, streak, and seed restored.`,
    'Current level map regenerates from the run seed; mid-level node progress is not resumed.',
  ];
}

/** When Continue was offered but the save disappeared before click. */
export const MISSING_CONTINUE_SAVE_NOTICE =
  'No saved run found — started a new run instead of continuing.';

export const CONTINUE_BUTTON_LABEL = 'Continue Run';
export const CONTINUE_BUTTON_TITLE =
  'Restores level, score, lives, streak, and seed. Regenerates the current level map (does not resume mid-level breaches).';
