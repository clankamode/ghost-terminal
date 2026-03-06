import { afterEach, describe, expect, it, vi } from 'vitest';

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

  it('fails PortScanPuzzle after max wrong numeric guesses and emits penalty feedback', () => {
    const puzzle = new PortScanPuzzle(2);
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const wrongPort = String((vulnerable!.port + 1) % 65535 || 1);
    const feedback: string[] = [];
    const failedEvents: Array<{ reason?: string }> = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<{ reason?: string }>).detail);
    });

    expect(puzzle.solve('not-a-port')).toBe(false);
    expect(puzzle.solve(wrongPort)).toBe(false);
    expect(puzzle.solve(wrongPort)).toBe(false);
    expect(puzzle.solve(wrongPort)).toBe(false);

    expect(feedback).toEqual([
      'Input must be a port number.',
      'Incorrect port. Attempts left: 2.',
      'Incorrect port. Attempts left: 1.',
    ]);
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0]?.reason).toContain(`Vulnerable port was ${vulnerable!.port}.`);
  });

  it('still allows PortScanPuzzle success before lockout threshold', () => {
    const puzzle = new PortScanPuzzle(2);
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const wrongPort = String((vulnerable!.port + 1) % 65535 || 1);
    const failedEvents: Array<{ reason?: string }> = [];

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<{ reason?: string }>).detail);
    });

    expect(puzzle.solve(wrongPort)).toBe(false);
    expect(puzzle.solve(String(vulnerable!.port))).toBe(true);
    expect(failedEvents).toHaveLength(0);
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
});
