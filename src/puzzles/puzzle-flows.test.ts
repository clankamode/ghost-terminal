import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';

describe('Puzzle flows', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('solves PortScanPuzzle when vulnerable port is provided', () => {
    const puzzle = new PortScanPuzzle(2);
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const solvedEvents: Array<{ puzzle: string; difficulty: number }> = [];
    puzzle.addEventListener('puzzle-solved', (event) => {
      solvedEvents.push((event as CustomEvent<{ puzzle: string; difficulty: number }>).detail);
    });

    const solved = puzzle.solve(String(vulnerable!.port));

    expect(solved).toBe(true);
    expect(solvedEvents).toEqual([
      {
        puzzle: 'PortScanPuzzle',
        difficulty: 2,
      },
    ]);
  });

  it('fails PasswordCrackPuzzle after max wrong guesses and emits feedback', () => {
    // PIN generation (4 digits) + hint-order shuffle (3 random calls)
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValue(0);

    const puzzle = new PasswordCrackPuzzle(1);
    puzzle.start();

    const feedback: string[] = [];
    const failedEvents: Array<{ reason?: string }> = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<{ reason?: string }>).detail);
    });

    for (let i = 0; i < 8; i += 1) {
      expect(puzzle.solve('9999')).toBe(false);
    }

    expect(feedback.length).toBe(8);
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0]?.reason).toContain('Out of guesses. PIN was 1234.');
    expect(randomSpy).toHaveBeenCalled();
  });

  it('fails PortScanPuzzle after max numeric misses and does not consume attempts on invalid input', () => {
    const puzzle = new PortScanPuzzle(2);
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const wrongPort = puzzle.getPorts().find((entry) => entry.port !== vulnerable!.port)?.port;
    expect(wrongPort).toBeDefined();

    const feedback: string[] = [];
    const failedEvents: Array<{ reason?: string }> = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<{ reason?: string }>).detail);
    });

    expect(puzzle.solve('abc')).toBe(false);
    expect(feedback.at(-1)).toBe('Input must be a port number.');

    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);

    expect(feedback).toContain('Incorrect port. Attempts left: 2.');
    expect(feedback).toContain('Incorrect port. Attempts left: 1.');
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0]?.reason).toBe(`Port scan lockout. Vulnerable port was ${vulnerable!.port}.`);
  });
});
