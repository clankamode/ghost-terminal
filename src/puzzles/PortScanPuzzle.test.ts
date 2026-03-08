import { describe, expect, it } from 'vitest';

import { PortScanPuzzle } from './PortScanPuzzle';

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('PortScanPuzzle', () => {
  it('consumes attempts on wrong numeric answers and fails after max attempts', () => {
    const puzzle = new PortScanPuzzle(2, createSeededRng(42));
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);

    expect(vulnerable).toBeDefined();

    const existingPorts = new Set(puzzle.getPorts().map((entry) => entry.port));
    let wrongPort = vulnerable!.port + 1;
    while (existingPorts.has(wrongPort)) {
      wrongPort += 1;
    }

    const feedback: string[] = [];
    const failedEvents: Array<{ reason?: string }> = [];
    const solvedEvents: Array<{ puzzle: string; difficulty: number }> = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<{ reason?: string }>).detail);
    });

    puzzle.addEventListener('puzzle-solved', (event) => {
      solvedEvents.push((event as CustomEvent<{ puzzle: string; difficulty: number }>).detail);
    });

    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);

    expect(feedback).toContain('Incorrect port. Attempts left: 2.');
    expect(feedback).toContain('Incorrect port. Attempts left: 1.');
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0]?.reason).toBe(`Port scan lockout. Vulnerable port was ${vulnerable!.port}.`);

    expect(puzzle.solve(String(vulnerable!.port))).toBe(false);
    expect(feedback.at(-1)).toBe(`Port scan lockout active. Vulnerable port was ${vulnerable!.port}.`);
    expect(solvedEvents).toHaveLength(0);
  });

  it('does not consume attempts for invalid input', () => {
    const puzzle = new PortScanPuzzle(2, createSeededRng(7));
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const existingPorts = new Set(puzzle.getPorts().map((entry) => entry.port));
    let wrongPort = vulnerable!.port + 1;
    while (existingPorts.has(wrongPort)) {
      wrongPort += 1;
    }

    const feedback: string[] = [];
    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    expect(puzzle.solve('abc')).toBe(false);
    expect(feedback.at(-1)).toBe('Input must be a port number.');

    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(feedback.at(-1)).toBe('Incorrect port. Attempts left: 2.');
  });
});
