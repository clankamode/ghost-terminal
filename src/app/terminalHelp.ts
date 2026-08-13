export type TerminalHelpContext = 'idle' | 'puzzle' | 'gameover';

/** Operator-facing help lines that match commands the app actually handles. */
export function formatTerminalHelp(context: TerminalHelpContext): string[] {
  switch (context) {
    case 'idle':
      return [
        'No active puzzle. Select an ACCESSIBLE node from SYSTEM-MAP.',
        'Commands: `help`, `seed`, `replay <seed>` (restarts the run with that seed).',
        'During a puzzle: type your answer, or `hint` for a clue.',
      ];
    case 'puzzle':
      return [
        'Puzzle active. Type your answer, or `hint` for a clue.',
        'Commands: `help`, `hint`. Other text is treated as an answer attempt.',
      ];
    case 'gameover':
      return [
        'Game over. Type `restart`, `replay <seed>`, or `menu`.',
      ];
    default: {
      const _exhaustive: never = context;
      return _exhaustive;
    }
  }
}
