import { describe, expect, it } from 'vitest';

import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import { PuzzleFactory } from './PuzzleFactory';
import type { HackTarget } from '../engine';

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('Puzzle deterministic generation', () => {
  it('creates identical LogicGatePuzzle prompts for the same RNG seed', () => {
    const first = new LogicGatePuzzle(3, createSeededRng(42));
    const second = new LogicGatePuzzle(3, createSeededRng(42));

    expect(first.start()).toBe(second.start());
  });

  it('creates identical CipherPuzzle prompts for the same RNG seed', () => {
    const first = new CipherPuzzle(2, createSeededRng(1337));
    const second = new CipherPuzzle(2, createSeededRng(1337));

    expect(first.start()).toBe(second.start());
  });

  it('creates identical PortScanPuzzle outputs for the same RNG seed', () => {
    const first = new PortScanPuzzle(3, createSeededRng(7));
    const second = new PortScanPuzzle(3, createSeededRng(7));

    expect(first.start()).toBe(second.start());
    expect(first.getPorts()).toEqual(second.getPorts());
  });

  it('passes rng through PuzzleFactory to puzzle generation', () => {
    const target: HackTarget = {
      id: 'target-1',
      name: 'Seeded Target',
      difficulty: 3,
      puzzleTypes: ['port-scan'],
      defenses: [],
      reward: 100,
    };

    const first = PuzzleFactory.createForTarget(target, createSeededRng(2026)) as PortScanPuzzle;
    const second = PuzzleFactory.createForTarget(target, createSeededRng(2026)) as PortScanPuzzle;

    expect(first.constructor.name).toBe('PortScanPuzzle');
    expect(second.constructor.name).toBe('PortScanPuzzle');
    expect(first.start()).toBe(second.start());
  });
});
