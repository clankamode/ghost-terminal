import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../engine';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';

describe('Puzzle determinism', () => {
  it('repeats PasswordCrackPuzzle state for the same seed', () => {
    const firstPuzzle = new PasswordCrackPuzzle(2, mulberry32(11));
    const secondPuzzle = new PasswordCrackPuzzle(2, mulberry32(11));

    expect(firstPuzzle.start()).toBe(secondPuzzle.start());
    expect(firstPuzzle.getHint()).toBe(secondPuzzle.getHint());
  });

  it('repeats PortScanPuzzle state for the same seed', () => {
    const firstPuzzle = new PortScanPuzzle(3, mulberry32(22));
    const secondPuzzle = new PortScanPuzzle(3, mulberry32(22));

    expect(firstPuzzle.start()).toBe(secondPuzzle.start());
    expect(firstPuzzle.getPorts()).toEqual(secondPuzzle.getPorts());
    expect(firstPuzzle.getHint()).toBe(secondPuzzle.getHint());
  });

  it('repeats CipherPuzzle state for the same seed', () => {
    const firstPuzzle = new CipherPuzzle(3, mulberry32(33));
    const secondPuzzle = new CipherPuzzle(3, mulberry32(33));

    expect(firstPuzzle.start()).toBe(secondPuzzle.start());
    expect(firstPuzzle.getEncodedText()).toBe(secondPuzzle.getEncodedText());
    expect(firstPuzzle.getHint()).toBe(secondPuzzle.getHint());
  });

  it('repeats LogicGatePuzzle state for the same seed', () => {
    const firstPuzzle = new LogicGatePuzzle(3, mulberry32(44));
    const secondPuzzle = new LogicGatePuzzle(3, mulberry32(44));

    expect(firstPuzzle.start()).toBe(secondPuzzle.start());
    expect(firstPuzzle.renderCircuit()).toBe(secondPuzzle.renderCircuit());
    expect(firstPuzzle.getHint()).toBe(secondPuzzle.getHint());
  });
});
