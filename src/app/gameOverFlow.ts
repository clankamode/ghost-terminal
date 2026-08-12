export type GameOverSummary = {
  reason: string;
  score: number;
  seed: number;
};

export function formatGameOverLines(summary: GameOverSummary): string[] {
  return [
    `GAME OVER: ${summary.reason}`,
    `Final score: ${summary.score}`,
    `Run seed: ${summary.seed}`,
    'Type `restart` for a new seed, `replay <seed>` to replay, or `menu` for the boot screen.',
  ];
}

export function formatBootGameOverCopy(summary: GameOverSummary): string {
  return `Run terminated: ${summary.reason} | Score ${summary.score} | Seed ${summary.seed}`;
}
