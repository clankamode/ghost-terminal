export type PuzzleRng = () => number;

export const defaultPuzzleRng: PuzzleRng = () => Math.random();
