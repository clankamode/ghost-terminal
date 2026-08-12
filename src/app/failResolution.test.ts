import { describe, expect, it } from 'vitest';
import { resolvePuzzleFail } from './failResolution';

describe('resolvePuzzleFail', () => {
  it('applies difficulty-scaled penalty and clamps score/lives at zero', () => {
    expect(
      resolvePuzzleFail({
        score: 40,
        lives: 1,
        difficulty: 3,
      }),
    ).toEqual({
      penalty: 60,
      nextScore: 0,
      nextLives: 0,
    });
  });

  it('uses the minimum penalty floor of 25', () => {
    expect(
      resolvePuzzleFail({
        score: 100,
        lives: 3,
        difficulty: 1,
      }),
    ).toEqual({
      penalty: 25,
      nextScore: 75,
      nextLives: 2,
    });
  });
});
