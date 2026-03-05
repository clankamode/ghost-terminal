import { describe, expect, it } from 'vitest';

import type { HackTarget } from '../engine';
import { PuzzleFactory } from './PuzzleFactory';

const baseTarget: HackTarget = {
  id: 'target-1',
  name: 'Test Node',
  difficulty: 3,
  puzzleTypes: [],
  defenses: [],
  reward: 100,
};

describe('PuzzleFactory', () => {
  it('routes password-like puzzle types to PasswordCrackPuzzle', () => {
    const puzzle = PuzzleFactory.createForTarget(
      { ...baseTarget, puzzleTypes: ['password-crack'] },
      () => 0,
    );

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });

  it('maps LevelGenerator puzzle type families without falling back to logic-gate', () => {
    const cases: Array<[string, string]> = [
      ['port-scan', 'PortScanPuzzle'],
      ['log-forensics', 'MemoryMatrixPuzzle'],
      ['packet-routing', 'PortScanPuzzle'],
      ['hash-reversal', 'CipherPuzzle'],
      ['node-mapping', 'MemoryMatrixPuzzle'],
      ['timing-analysis', 'MemoryMatrixPuzzle'],
      ['trace-scrubbing', 'PortScanPuzzle'],
      ['access-graph', 'MemoryMatrixPuzzle'],
      ['cipher-break', 'CipherPuzzle'],
      ['exploit-chain', 'LogicGatePuzzle'],
      ['kernel-injection', 'CipherPuzzle'],
      ['quantum-auth', 'PasswordCrackPuzzle'],
      ['zero-day-synthesis', 'CipherPuzzle'],
      ['distributed-overload', 'PortScanPuzzle'],
    ];

    for (const [puzzleType, expected] of cases) {
      const puzzle = PuzzleFactory.createForTarget(
        { ...baseTarget, puzzleTypes: [puzzleType] },
        () => 0,
      );
      expect(puzzle.constructor.name, puzzleType).toBe(expected);
    }
  });

  it('uses deterministic rng for fallback selection', () => {
    const puzzle = PuzzleFactory.createForTarget(
      { ...baseTarget, puzzleTypes: ['unknown-puzzle-type'] },
      () => 0.21,
    );

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });
});
