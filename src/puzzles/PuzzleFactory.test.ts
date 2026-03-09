import { describe, expect, it } from 'vitest';

import { mulberry32, type HackTarget } from '../engine';
import { PuzzleFactory } from './PuzzleFactory';

function createSequenceRng(values: number[]): () => number {
  let index = 0;
  return (): number => {
    const next = values[index];
    if (next === undefined) {
      throw new Error(`RNG exhausted at call ${index + 1}`);
    }

    index += 1;
    return next;
  };
}

const baseTarget: HackTarget = {
  id: 'target-1',
  name: 'Test Node',
  difficulty: 3,
  puzzleTypes: [],
  defenses: [],
  reward: 100,
};

const LEVEL_GENERATOR_ROUTING_CASES: Array<[string, string]> = [
  ['password-crack', 'PasswordCrackPuzzle'],
  ['port-scan', 'PortScanPuzzle'],
  ['log-forensics', 'MemoryMatrixPuzzle'],
  ['packet-routing', 'PortScanPuzzle'],
  ['hash-reversal', 'CipherPuzzle'],
  ['node-mapping', 'MemoryMatrixPuzzle'],
  ['timing-analysis', 'CipherPuzzle'],
  ['trace-scrubbing', 'MemoryMatrixPuzzle'],
  ['access-graph', 'MemoryMatrixPuzzle'],
  ['cipher-break', 'CipherPuzzle'],
  ['exploit-chain', 'LogicGatePuzzle'],
  ['kernel-injection', 'LogicGatePuzzle'],
  ['quantum-auth', 'CipherPuzzle'],
  ['zero-day-synthesis', 'LogicGatePuzzle'],
  ['distributed-overload', 'PortScanPuzzle'],
];

function withPuzzleType(puzzleType: string): HackTarget {
  return {
    ...baseTarget,
    puzzleTypes: [puzzleType],
  };
}

describe('PuzzleFactory', () => {
  it('routes LevelGenerator puzzle types to intentional puzzle implementations', () => {
    for (const [puzzleType, expectedPuzzleClass] of LEVEL_GENERATOR_ROUTING_CASES) {
      const puzzle = PuzzleFactory.createForTarget(withPuzzleType(puzzleType), () => 0);

      expect(puzzle.constructor.name, puzzleType).toBe(expectedPuzzleClass);
    }
  });

  it('selects PasswordCrackPuzzle intentionally for password-crack type', () => {
    const puzzle = PuzzleFactory.createForTarget(withPuzzleType('password-crack'), () => 0);

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });

  it('uses fallback selection only for unknown puzzle types', () => {
    const puzzle = PuzzleFactory.createForTarget(
      withPuzzleType('unknown-puzzle-type'),
      createSequenceRng([0, 0.8]),
    );

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });

  it('creates identical puzzle state for the same injected RNG seed', () => {
    const firstPuzzle = PuzzleFactory.createForTarget(withPuzzleType('port-scan'), mulberry32(123456));
    const secondPuzzle = PuzzleFactory.createForTarget(withPuzzleType('port-scan'), mulberry32(123456));

    expect(firstPuzzle.start()).toBe(secondPuzzle.start());
    expect(firstPuzzle.getHint()).toBe(secondPuzzle.getHint());
  });
});
