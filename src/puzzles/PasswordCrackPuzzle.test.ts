import { describe, expect, it } from 'vitest';

import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';

describe('PasswordCrackPuzzle', () => {
  it('supports deterministic PIN generation via injected rng', () => {
    const puzzle = new PasswordCrackPuzzle(2, () => 0);

    puzzle.start();

    expect(puzzle.solve('0000')).toBe(true);
  });

  it('emits deterministic hint digits when rng is injected', () => {
    const puzzle = new PasswordCrackPuzzle(2, () => 0);

    puzzle.start();
    const hint = puzzle.getHint();

    expect(hint).toMatch(/is 0\.$/);
  });
});
