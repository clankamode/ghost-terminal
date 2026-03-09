import { describe, expect, it, vi } from 'vitest';

import { BasePuzzle } from './BasePuzzle';
import { MemoryMatrixPuzzle } from './MemoryMatrixPuzzle';

class AsyncSolvedPuzzle extends BasePuzzle {
  start(): string {
    window.setTimeout(() => {
      this.markSolved();
    }, 10);
    return 'started';
  }

  solve(_input: string): boolean {
    return false;
  }

  getHint(): string {
    return 'hint';
  }
}

describe('Puzzle cleanup lifecycle', () => {
  it('prevents late solved emissions after disposal', () => {
    const previousWindow = (globalThis as { window?: typeof globalThis }).window;
    (globalThis as { window: typeof globalThis }).window = globalThis;
    vi.useFakeTimers();

    const puzzle = new AsyncSolvedPuzzle(30, 1);
    const solvedEvents: Array<{ puzzle: string; difficulty: number }> = [];

    puzzle.addEventListener('puzzle-solved', (event) => {
      solvedEvents.push((event as CustomEvent<{ puzzle: string; difficulty: number }>).detail);
    });

    puzzle.start();
    puzzle.dispose();

    vi.advanceTimersByTime(20);

    expect(solvedEvents).toEqual([]);

    vi.useRealTimers();
    (globalThis as { window?: typeof globalThis }).window = previousWindow;
  });

  it('clears MemoryMatrix timers on dispose so no terminal events fire post-exit', () => {
    const previousWindow = (globalThis as { window?: typeof globalThis }).window;
    (globalThis as { window: typeof globalThis }).window = globalThis;
    vi.useFakeTimers();

    const puzzle = new MemoryMatrixPuzzle(3, () => 0.5);
    const clearEvents: Event[] = [];
    const feedbackEvents: string[] = [];

    puzzle.addEventListener('terminal-clear', (event) => {
      clearEvents.push(event);
    });
    puzzle.addEventListener('terminal-feedback', (event) => {
      feedbackEvents.push((event as CustomEvent<string>).detail);
    });

    puzzle.start();
    puzzle.dispose();

    vi.runAllTimers();

    expect(clearEvents).toHaveLength(0);
    expect(feedbackEvents).toHaveLength(0);

    vi.useRealTimers();
    (globalThis as { window?: typeof globalThis }).window = previousWindow;
  });
});
