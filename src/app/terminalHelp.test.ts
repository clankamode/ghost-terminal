import { describe, expect, it } from 'vitest';
import { formatTerminalHelp } from './terminalHelp';

describe('formatTerminalHelp', () => {
  it('lists only idle commands that the app handles', () => {
    const lines = formatTerminalHelp('idle');
    expect(lines.join('\n')).toContain('`help`');
    expect(lines.join('\n')).toContain('`seed`');
    expect(lines.join('\n')).toContain('`replay <seed>`');
    expect(lines.join('\n')).toContain('`hint`');
    expect(lines.join('\n')).not.toContain('leaderboard');
    expect(lines.join('\n')).not.toContain('supabase');
  });

  it('does not invent game-over commands during a puzzle', () => {
    const lines = formatTerminalHelp('puzzle');
    expect(lines.join('\n')).toContain('`hint`');
    expect(lines.join('\n')).not.toContain('`restart`');
    expect(lines.join('\n')).not.toContain('`menu`');
  });

  it('lists game-over recovery commands only', () => {
    expect(formatTerminalHelp('gameover')).toEqual([
      'Game over. Type `restart`, `replay <seed>`, or `menu`.',
    ]);
  });
});
