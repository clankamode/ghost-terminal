import { describe, expect, it } from 'vitest';
import { optionsForNextLevel } from './levelProgression';

describe('optionsForNextLevel', () => {
  it('preserves remaining lives and streak instead of refilling', () => {
    expect(optionsForNextLevel({ lives: 1, streak: 4 })).toEqual({ lives: 1, streak: 4 });
  });

  it('clamps negative values and floors fractions', () => {
    expect(optionsForNextLevel({ lives: -2, streak: 2.9 })).toEqual({ lives: 0, streak: 2 });
  });
});
