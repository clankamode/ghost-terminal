import { BasePuzzle } from './BasePuzzle';
import { defaultPuzzleRng, type PuzzleRng } from './rng';

const MAX_GUESSES = 8;
const PIN_LENGTH = 4;

export class PasswordCrackPuzzle extends BasePuzzle {
  private pin = '';
  private guessesUsed = 0;
  private hintOrder: number[] = [];
  private hintedPositions = new Set<number>();

  constructor(difficulty: number, rng: PuzzleRng = defaultPuzzleRng) {
    super(35 + difficulty * 20, difficulty, rng);
  }

  start(): string {
    this.pin = this.generatePin();
    this.guessesUsed = 0;
    this.hintedPositions.clear();
    this.hintOrder = this.shuffle([0, 1, 2, 3]);

    return [
      'Crack the 4-digit PIN.',
      `You have ${MAX_GUESSES} guesses.`,
      'Feedback: ■ = right digit/right place, □ = right digit/wrong place, ◻ = not in PIN.',
    ].join('\n');
  }

  solve(input: string): boolean {
    const guess = this.normalizeInput(input);
    if (!/^\d{4}$/.test(guess)) {
      return false;
    }

    this.guessesUsed += 1;

    if (guess === this.pin) {
      this.markSolved();
      return true;
    }

    const feedback = this.buildFeedback(guess);
    this.dispatchEvent(
      new CustomEvent<string>('terminal-feedback', {
        detail: `${guess} → ${feedback}`,
      }),
    );

    if (this.guessesUsed >= MAX_GUESSES) {
      this.markFailed(`Out of guesses. PIN was ${this.pin}.`);
    }

    return false;
  }

  getHint(): string {
    const nextIndex = this.hintOrder.find((index) => !this.hintedPositions.has(index));
    if (nextIndex === undefined) {
      return 'All positions have already been revealed.';
    }

    this.hintedPositions.add(nextIndex);
    return `Hint: Position ${nextIndex + 1} is ${this.pin[nextIndex]}.`;
  }

  private buildFeedback(guess: string): string {
    const exact: number[] = [];
    const guessRemainder: string[] = [];
    const pinRemainder: string[] = [];

    for (let i = 0; i < PIN_LENGTH; i += 1) {
      if (guess[i] === this.pin[i]) {
        exact.push(i);
      } else {
        guessRemainder.push(guess[i]);
        pinRemainder.push(this.pin[i]);
      }
    }

    let misplacedCount = 0;
    const pinCounts = new Map<string, number>();
    for (const digit of pinRemainder) {
      pinCounts.set(digit, (pinCounts.get(digit) ?? 0) + 1);
    }

    for (const digit of guessRemainder) {
      const remaining = pinCounts.get(digit) ?? 0;
      if (remaining > 0) {
        misplacedCount += 1;
        pinCounts.set(digit, remaining - 1);
      }
    }

    const wrongCount = PIN_LENGTH - exact.length - misplacedCount;
    return `${'■'.repeat(exact.length)}${'□'.repeat(misplacedCount)}${'◻'.repeat(wrongCount)}`;
  }

  private generatePin(): string {
    let result = '';
    for (let i = 0; i < PIN_LENGTH; i += 1) {
      result += String(this.randomInt(0, 9));
    }

    return result;
  }
}
