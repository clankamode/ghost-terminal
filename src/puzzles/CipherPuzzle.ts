import { BasePuzzle } from './BasePuzzle';

type CipherVariant = 'CAESAR' | 'ROT13' | 'ATBASH';

const SIMPLE_WORDS = ['cat', 'dog', 'key', 'log', 'net', 'ram', 'cpu'];
const MEDIUM_WORDS = ['binary', 'cipher', 'socket', 'router', 'packet', 'kernel'];
const HARD_PHRASES = [
  'trust no process',
  'zero day alert',
  'deploy the patch',
  'access denied protocol',
  'encrypted signal breach',
];

export class CipherPuzzle extends BasePuzzle {
  private variant!: CipherVariant;
  private shift = 3;
  private plainText = '';
  private encodedText = '';
  private hintIndex = 0;

  constructor(difficulty: number, rng: () => number = Math.random) {
    super(45 + difficulty * 20, difficulty, rng);
  }

  start(): string {
    this.variant = this.pickVariant();
    this.plainText = this.pickPlainText();
    this.shift = this.variant === 'CAESAR' ? this.randomInt(1, 25) : 13;
    this.encodedText = this.encode(this.plainText);
    this.hintIndex = 0;

    return [
      'Decode the message and type the original text.',
      `Cipher: ${this.variant}${this.variant === 'CAESAR' ? ` (shift ${this.shift})` : ''}`,
      `Encoded: ${this.encodedText}`,
    ].join('\n');
  }

  solve(input: string): boolean {
    const normalized = this.normalizeInput(input).toLowerCase();
    const isCorrect = normalized === this.plainText.toLowerCase();

    if (isCorrect) {
      this.markSolved();
    }

    return isCorrect;
  }

  getHint(): string {
    const revealable = this.plainText.replace(/[^a-zA-Z]/g, '').length;
    if (revealable === 0) {
      return 'No characters available to reveal.';
    }

    const revealCount = Math.min(this.hintIndex + 1, revealable);
    let shown = 0;
    const partial = this.plainText
      .split('')
      .map((char) => {
        if (!/[a-zA-Z]/.test(char)) {
          return char;
        }

        shown += 1;
        return shown <= revealCount ? char : '_';
      })
      .join('');

    this.hintIndex = revealCount;
    return `Hint ${revealCount}/${revealable}: ${partial}`;
  }

  getEncodedText(): string {
    return this.encodedText;
  }

  private pickVariant(): CipherVariant {
    const variants: CipherVariant[] = ['CAESAR', 'ROT13', 'ATBASH'];
    return variants[this.randomInt(0, variants.length - 1)];
  }

  private pickPlainText(): string {
    if (this.difficulty <= 1) {
      return SIMPLE_WORDS[this.randomInt(0, SIMPLE_WORDS.length - 1)];
    }

    if (this.difficulty === 2) {
      return MEDIUM_WORDS[this.randomInt(0, MEDIUM_WORDS.length - 1)];
    }

    return HARD_PHRASES[this.randomInt(0, HARD_PHRASES.length - 1)];
  }

  private encode(text: string): string {
    switch (this.variant) {
      case 'CAESAR':
      case 'ROT13':
        return this.shiftText(text, this.shift);
      case 'ATBASH':
        return this.atbash(text);
      default:
        return text;
    }
  }

  private shiftText(text: string, shift: number): string {
    return text
      .split('')
      .map((char) => {
        if (!/[a-z]/i.test(char)) {
          return char;
        }

        const base = char >= 'a' && char <= 'z' ? 97 : 65;
        const code = char.charCodeAt(0) - base;
        return String.fromCharCode(((code + shift) % 26) + base);
      })
      .join('');
  }

  private atbash(text: string): string {
    return text
      .split('')
      .map((char) => {
        if (!/[a-z]/i.test(char)) {
          return char;
        }

        const base = char >= 'a' && char <= 'z' ? 97 : 65;
        const code = char.charCodeAt(0) - base;
        return String.fromCharCode((25 - code) + base);
      })
      .join('');
  }
}
