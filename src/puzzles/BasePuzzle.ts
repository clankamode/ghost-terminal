import { defaultPuzzleRng, type PuzzleRng } from './rng';

export interface PuzzleSolvedDetail {
  puzzle: string;
  difficulty: number;
}

export interface PuzzleFailedDetail {
  puzzle: string;
  difficulty: number;
  reason?: string;
}

export abstract class BasePuzzle extends EventTarget {
  public readonly timeLimit: number;
  public readonly difficulty: number;
  protected readonly rng: PuzzleRng;

  private isCompleted = false;
  private isFailed = false;

  protected constructor(timeLimit: number, difficulty: number, rng: PuzzleRng = defaultPuzzleRng) {
    super();
    this.timeLimit = timeLimit;
    this.difficulty = difficulty;
    this.rng = rng;
  }

  abstract start(): string;
  abstract solve(input: string): boolean;
  abstract getHint(): string;

  protected markSolved(): void {
    if (this.isCompleted || this.isFailed) {
      return;
    }

    this.isCompleted = true;
    this.dispatchEvent(
      new CustomEvent<PuzzleSolvedDetail>('puzzle-solved', {
        detail: {
          puzzle: this.constructor.name,
          difficulty: this.difficulty,
        },
      }),
    );
  }

  protected markFailed(reason?: string): void {
    if (this.isCompleted || this.isFailed) {
      return;
    }

    this.isFailed = true;
    this.dispatchEvent(
      new CustomEvent<PuzzleFailedDetail>('puzzle-failed', {
        detail: {
          puzzle: this.constructor.name,
          difficulty: this.difficulty,
          reason,
        },
      }),
    );
  }

  protected normalizeInput(input: string): string {
    return input.trim();
  }

  protected randomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  protected shuffle<T>(values: T[]): T[] {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.rng() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    return values;
  }
}
