export type FailResolution = {
  penalty: number;
  nextScore: number;
  nextLives: number;
};

/** Compute fail penalty/score/lives. Score must be applied before game-over leaderboard writes. */
export function resolvePuzzleFail(input: {
  score: number;
  lives: number;
  difficulty: number;
}): FailResolution {
  const penalty = Math.max(25, Math.floor(input.difficulty) * 20);
  return {
    penalty,
    nextScore: Math.max(0, Math.floor(input.score) - penalty),
    nextLives: Math.max(0, Math.floor(input.lives) - 1),
  };
}
