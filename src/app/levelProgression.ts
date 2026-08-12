export type LevelCarryOptions = {
  lives: number;
  streak: number;
};

/** Options to carry into the next level of an ongoing run (do not refill lives). */
export function optionsForNextLevel(state: { lives: number; streak: number }): LevelCarryOptions {
  return {
    lives: Math.max(0, Math.floor(state.lives)),
    streak: Math.max(0, Math.floor(state.streak)),
  };
}
