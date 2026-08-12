import { describe, expect, it } from 'vitest';
import { formatBootGameOverCopy, formatGameOverLines } from './gameOverFlow';

describe('gameOverFlow', () => {
  it('formats terminal game-over lines with restart guidance', () => {
    expect(
      formatGameOverLines({
        reason: 'All agent lives depleted.',
        score: 1200,
        seed: 42,
      }),
    ).toEqual([
      'GAME OVER: All agent lives depleted.',
      'Final score: 1200',
      'Run seed: 42',
      'Type `restart` for a new seed, `replay <seed>` to replay, or `menu` for the boot screen.',
    ]);
  });

  it('formats boot copy with score and seed after returning from game over', () => {
    expect(
      formatBootGameOverCopy({
        reason: 'Trace timer reached zero.',
        score: 80,
        seed: 7,
      }),
    ).toBe('Run terminated: Trace timer reached zero. | Score 80 | Seed 7');
  });
});
