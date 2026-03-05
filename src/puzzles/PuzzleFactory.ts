import type { HackTarget } from '../engine';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { MemoryMatrixPuzzle } from './MemoryMatrixPuzzle';
import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import type { BasePuzzle } from './BasePuzzle';

type RandomFn = () => number;

export class PuzzleFactory {
  static createForTarget(target: HackTarget, rng: RandomFn = Math.random): BasePuzzle {
    const difficulty = Math.max(1, target.difficulty);
    const selectedType = this.pickPuzzleType(target.puzzleTypes, rng);

    if (this.isPasswordPuzzle(selectedType)) {
      return new PasswordCrackPuzzle(difficulty, rng);
    }

    if (this.isPortPuzzle(selectedType)) {
      return new PortScanPuzzle(difficulty, rng);
    }

    if (this.isCipherPuzzle(selectedType)) {
      return new CipherPuzzle(difficulty, rng);
    }

    if (this.isMemoryPuzzle(selectedType)) {
      return new MemoryMatrixPuzzle(difficulty, rng);
    }

    const fallbacks = [LogicGatePuzzle, PasswordCrackPuzzle, CipherPuzzle, PortScanPuzzle, MemoryMatrixPuzzle];
    const index = Math.floor(rng() * fallbacks.length);
    const PuzzleType = fallbacks[index] ?? LogicGatePuzzle;
    return new PuzzleType(difficulty, rng);
  }

  private static pickPuzzleType(puzzleTypes: string[], rng: RandomFn): string {
    if (puzzleTypes.length === 0) {
      return 'logic-gate';
    }

    const index = Math.floor(rng() * puzzleTypes.length);
    return puzzleTypes[index] ?? 'logic-gate';
  }

  private static isPasswordPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('password') ||
      /(^|[^a-z])pin([^a-z]|$)/.test(normalized) ||
      normalized.includes('auth') ||
      normalized.includes('credential')
    );
  }

  private static isPortPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('port') ||
      normalized.includes('scan') ||
      normalized.includes('network') ||
      normalized.includes('packet') ||
      normalized.includes('routing') ||
      normalized.includes('trace') ||
      normalized.includes('distributed')
    );
  }

  private static isCipherPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('cipher') ||
      normalized.includes('hash') ||
      normalized.includes('quantum') ||
      normalized.includes('crack') ||
      normalized.includes('kernel') ||
      normalized.includes('zero-day')
    );
  }

  private static isMemoryPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('memory') ||
      normalized.includes('matrix') ||
      normalized.includes('mapping') ||
      normalized.includes('graph') ||
      normalized.includes('analysis') ||
      normalized.includes('forensics')
    );
  }
}
