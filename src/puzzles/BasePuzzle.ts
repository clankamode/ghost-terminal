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

  private isCompleted = false;
  private isFailed = false;

  protected constructor(timeLimit: number, difficulty: number) {
    super();
    this.timeLimit = timeLimit;
    this.difficulty = difficulty;
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
}
