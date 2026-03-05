import { BasePuzzle } from './BasePuzzle';

type Gate = 'AND' | 'OR' | 'NOT' | 'XOR';

export class LogicGatePuzzle extends BasePuzzle {
  private a = 0;
  private b = 0;
  private gates: Gate[] = [];
  private expectedOutput = 0;

  constructor(difficulty: number, rng: () => number = Math.random) {
    super(30 + difficulty * 25, difficulty, rng);
  }

  start(): string {
    this.a = this.randomBit();
    this.b = this.randomBit();
    this.gates = this.buildGates();
    this.expectedOutput = this.evaluate();

    return `${this.renderCircuit()}\nDetermine the final output (0 or 1).`;
  }

  solve(input: string): boolean {
    const normalized = this.normalizeInput(input);
    if (normalized !== '0' && normalized !== '1') {
      return false;
    }

    const isCorrect = Number.parseInt(normalized, 10) === this.expectedOutput;
    if (isCorrect) {
      this.markSolved();
    }

    return isCorrect;
  }

  getHint(): string {
    return `Hint: Evaluate left to right. Current chain length: ${this.gates.length}.`;
  }

  renderCircuit(): string {
    const gatePath = this.gates.map((gate) => `[${gate}]`).join(' -> ');
    return `A=${this.a} B=${this.b} -> ${gatePath} -> ?`;
  }

  private buildGates(): Gate[] {
    if (this.difficulty <= 1) {
      const options: Gate[] = ['AND', 'OR', 'NOT'];
      return [options[this.randomInt(0, options.length - 1)]];
    }

    if (this.difficulty === 2) {
      return this.pickGates(3, ['AND', 'OR', 'NOT']);
    }

    return this.pickGates(5, ['AND', 'OR', 'NOT', 'XOR']);
  }

  private pickGates(length: number, pool: Gate[]): Gate[] {
    const result: Gate[] = [];
    for (let i = 0; i < length; i += 1) {
      result.push(pool[this.randomInt(0, pool.length - 1)]);
    }

    return result;
  }

  private evaluate(): number {
    let value = this.applyBinaryGate(this.gates[0], this.a, this.b);

    for (let i = 1; i < this.gates.length; i += 1) {
      const gate = this.gates[i];
      if (gate === 'NOT') {
        value = value === 1 ? 0 : 1;
      } else {
        value = this.applyBinaryGate(gate, value, this.b);
      }
    }

    return value;
  }

  private applyBinaryGate(gate: Gate, left: number, right: number): number {
    switch (gate) {
      case 'AND':
        return left & right;
      case 'OR':
        return left | right;
      case 'XOR':
        return left ^ right;
      case 'NOT':
        return left === 1 ? 0 : 1;
      default:
        return 0;
    }
  }

  private randomBit(): number {
    return this.randomBool() ? 1 : 0;
  }
}
