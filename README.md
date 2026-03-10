# Ghost Terminal ⚡

A browser-based terminal hacking roguelike. Procedurally generated networks, puzzle-based infiltration, played entirely through a terminal interface.

## Stack
- Lit web components
- TypeScript
- Vite
- Supabase (leaderboards)
- Cloudflare Pages

## Puzzle input quick reference
During an active puzzle, submit answers directly in the terminal. Type `hint` at any time to request the puzzle's next hint.

### LogicGatePuzzle
- **Prompt:** `A=<0|1> B=<0|1> -> [GATE] -> ... -> ?`
- **Expected input:** `0` or `1`
- **Wrong input behavior:** anything other than `0`/`1` is treated as incorrect; puzzle stays active.
- **Hint behavior:** reminds you to evaluate gates left-to-right and shows chain length.

### CipherPuzzle
- **Prompt:** encoded text with cipher type (`CAESAR`, `ROT13`, `ATBASH`)
- **Expected input:** the original decoded plaintext (case-insensitive; spaces/punctuation must still match)
- **Wrong input behavior:** treated as incorrect; puzzle stays active.
- **Hint behavior:** reveals plaintext progressively one alphabetic character at a time (`Hint n/total`).

### PortScanPuzzle
- **Prompt:** list of ports/services + clue for outdated service
- **Expected input:** vulnerable port number (digits only)
- **Wrong input behavior:**
  - non-numeric input: rejected with feedback, **does not consume** attempts
  - wrong numeric port: consumes one attempt
  - after 3 wrong numeric attempts: puzzle hard-fails and locks out
- **Hint behavior:** identifies vulnerable service and the last digit of its low-numbered port.

### MemoryMatrixPuzzle
- **Prompt:** 4x4 symbol matrix shown briefly, then hidden
- **Expected input format:** comma-separated coordinate mappings like `A1=@, B3=#`
  - coordinates: rows `A-D`, columns `1-4`
  - separators: `=` or `:` (both accepted)
- **Wrong input behavior:**
  - before concealment: rejected (`wait for concealment`)
  - malformed/duplicate entries: rejected
  - valid but incorrect reconstruction: consumes one attempt; fails after 3 incorrect attempts
- **Hint behavior:** unavailable until hidden; then reveals one correct cell per `hint` call in deterministic order.

### PasswordCrackPuzzle
- **Prompt:** crack a 4-digit PIN with symbol feedback
- **Expected input:** exactly 4 digits (`0000`-`9999`)
- **Wrong input behavior:**
  - invalid format (not 4 digits): rejected, no guess consumed
  - wrong 4-digit guess: consumes a guess and prints feedback:
    - `■` right digit/right place
    - `□` right digit/wrong place
    - `◻` digit not in PIN
  - after 8 wrong guesses: puzzle fails
- **Hint behavior:** each `hint` reveals one unrevealed PIN position (`Position X is N`) until all 4 are revealed.

## Hint mechanics (global)
- `hint` is only available while a puzzle is active.
- Hints are puzzle-specific and generally progressive (each call reveals additional information).
- Hints do **not** directly reduce score or lives.
- You can still lose runs through puzzle-specific fail conditions, time pressure, and failure penalties.

## Development
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run test      # vitest
```

## Part of
[`clankamode`](https://github.com/clankamode) — autonomous tooling fleet
