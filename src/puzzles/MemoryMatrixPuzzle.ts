import { BasePuzzle } from './BasePuzzle';

interface MemoryCell {
  row: number;
  col: number;
  symbol: string;
}

const GRID_SIZE = 4;
const MAX_ATTEMPTS = 3;
const ROW_LABELS = ['A', 'B', 'C', 'D'];
const SYMBOL_POOL = ['@', '#', '$', '%', '&', '*', '+', '?', '!'];

export class MemoryMatrixPuzzle extends BasePuzzle {
  private cells: MemoryCell[] = [];
  private attemptsUsed = 0;
  private displayMs = 2000;
  private hidden = false;
  private hintedCells = 0;
  private hideTimer?: number;

  constructor(difficulty: number) {
    super(30 + difficulty * 15, difficulty);
  }

  start(): string {
    if (this.hideTimer !== undefined) {
      window.clearTimeout(this.hideTimer);
    }

    this.displayMs = Math.max(800, 2000 - (this.difficulty - 1) * 180);
    this.attemptsUsed = 0;
    this.hidden = false;
    this.hintedCells = 0;
    this.cells = this.buildCells();

    this.hideTimer = window.setTimeout(() => {
      this.hidden = true;
      this.dispatchEvent(new CustomEvent('terminal-clear'));
      this.dispatchEvent(
        new CustomEvent<string>('terminal-feedback', {
          detail: `Input format: A1=@, B3=#. Attempts: ${MAX_ATTEMPTS}.`,
        }),
      );
    }, this.displayMs);

    return [
      'Memory Matrix engaged.',
      `Memorize the 4x4 grid for ${(this.displayMs / 1000).toFixed(1)}s.`,
      this.renderMatrix(),
      'After it hides, reproduce all marked cells: A1=@, B3=#',
    ].join('\n');
  }

  solve(input: string): boolean {
    if (!this.hidden) {
      this.dispatchEvent(
        new CustomEvent<string>('terminal-feedback', {
          detail: 'Matrix still visible. Wait for concealment.',
        }),
      );
      return false;
    }

    const guess = this.parseGuess(this.normalizeInput(input));
    if (!guess) {
      return false;
    }

    const expected = this.buildExpectedMap();
    const isCorrect =
      guess.size === expected.size &&
      Array.from(expected.entries()).every(([coord, symbol]) => guess.get(coord) === symbol);

    if (isCorrect) {
      this.markSolved();
      return true;
    }

    this.attemptsUsed += 1;
    const attemptsLeft = MAX_ATTEMPTS - this.attemptsUsed;
    if (attemptsLeft <= 0) {
      this.markFailed(`No attempts left. Expected: ${this.renderSolution()}`);
      return false;
    }

    this.dispatchEvent(
      new CustomEvent<string>('terminal-feedback', {
        detail: `Incorrect reconstruction. Attempts left: ${attemptsLeft}.`,
      }),
    );
    return false;
  }

  getHint(): string {
    if (!this.hidden) {
      return 'Hint unavailable until the matrix is hidden.';
    }

    if (this.hintedCells >= this.cells.length) {
      return 'All memory cells already revealed.';
    }

    const cell = this.cells[this.hintedCells];
    this.hintedCells += 1;
    return `Hint: ${ROW_LABELS[cell.row]}${cell.col + 1}=${cell.symbol}`;
  }

  private buildCells(): MemoryCell[] {
    const positions = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index);
    const count = Math.min(10, Math.max(4, 3 + this.difficulty));
    const cells: MemoryCell[] = [];

    for (let i = 0; i < count; i += 1) {
      const pick = this.randomInt(0, positions.length - 1);
      const [position] = positions.splice(pick, 1);
      const row = Math.floor(position / GRID_SIZE);
      const col = position % GRID_SIZE;
      const symbol = SYMBOL_POOL[this.randomInt(0, SYMBOL_POOL.length - 1)];
      cells.push({ row, col, symbol });
    }

    return cells.sort((left, right) => left.row - right.row || left.col - right.col);
  }

  private renderMatrix(): string {
    const matrix = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => '.'));
    for (const cell of this.cells) {
      matrix[cell.row][cell.col] = cell.symbol;
    }

    const lines = ['    1  2  3  4'];
    for (let row = 0; row < GRID_SIZE; row += 1) {
      lines.push(`${ROW_LABELS[row]} | ${matrix[row].join('  ')}`);
    }

    return lines.join('\n');
  }

  private parseGuess(input: string): Map<string, string> | null {
    if (input.length === 0) {
      return null;
    }

    const entries = input
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (entries.length === 0) {
      return null;
    }

    const result = new Map<string, string>();

    for (const entry of entries) {
      const match = /^([A-Da-d])([1-4])\s*[:=]\s*(.)$/.exec(entry);
      if (!match) {
        return null;
      }

      const coord = `${match[1].toUpperCase()}${match[2]}`;
      if (result.has(coord)) {
        return null;
      }
      result.set(coord, match[3]);
    }

    return result;
  }

  private buildExpectedMap(): Map<string, string> {
    const expected = new Map<string, string>();
    for (const cell of this.cells) {
      expected.set(`${ROW_LABELS[cell.row]}${cell.col + 1}`, cell.symbol);
    }
    return expected;
  }

  private renderSolution(): string {
    return this.cells.map((cell) => `${ROW_LABELS[cell.row]}${cell.col + 1}=${cell.symbol}`).join(', ');
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
