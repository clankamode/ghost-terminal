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
- **Wrong input behavior:** anything other than `0` or `1` is treated as incorrect; the puzzle stays active.
- **Hint behavior:** reminds you to evaluate gates left-to-right and shows the current chain length.

### CipherPuzzle
- **Prompt:** encoded text plus the cipher type (`CAESAR`, `ROT13`, `ATBASH`)
- **Expected input:** the decoded plaintext, case-insensitive after trimming; spaces and punctuation must still match
- **Wrong input behavior:** treated as incorrect; the puzzle stays active.
- **Hint behavior:** reveals the plaintext progressively, one more alphabetic character per `hint` call (`Hint n/total`).

### PortScanPuzzle
- **Prompt:** a list of `port/service/version` rows plus a clue naming the outdated service
- **Expected input:** the vulnerable port number, digits only
- **Wrong input behavior:**
  - non-numeric input is rejected with feedback and does not consume an attempt
  - a wrong numeric port consumes one attempt
  - after 3 wrong numeric ports, the puzzle hard-fails and locks out
- **Hint behavior:** reveals the vulnerable service name and the last digit of the vulnerable port.

### MemoryMatrixPuzzle
- **Prompt:** a 4x4 symbol matrix shown briefly, then hidden
- **Expected input format:** comma-separated coordinate mappings such as `A1=@, B3=#`
  - rows are `A-D`, columns are `1-4`
  - `=` and `:` are both accepted separators
- **Wrong input behavior:**
  - before concealment, input is rejected with a wait-for-concealment message
  - malformed or duplicate entries are rejected
  - a valid but incorrect reconstruction consumes one attempt; after 3 incorrect reconstructions, the puzzle fails
- **Hint behavior:** unavailable until the matrix is hidden, then reveals one correct cell per `hint` call in sorted coordinate order.

### PasswordCrackPuzzle
- **Prompt:** crack a 4-digit PIN using symbol feedback
- **Expected input:** exactly 4 digits (`0000` through `9999`)
- **Wrong input behavior:**
  - invalid format is rejected and does not consume a guess
  - a wrong 4-digit guess consumes a guess and prints feedback:
    - `■` right digit, right place
    - `□` right digit, wrong place
    - `◻` digit not present in the PIN
  - after 8 wrong guesses, the puzzle fails
- **Hint behavior:** each `hint` reveals one previously unrevealed PIN position until all four positions are exposed.

## Hint mechanics
- `hint` only works while a puzzle is active.
- Hints are puzzle-specific and progressive; repeated `hint` calls reveal more information instead of repeating the same message.
- Hints do not directly deduct score or lives.
- Puzzle-specific failure conditions still apply while using hints.

## Development
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run test      # vitest
```

## Part of
[`clankamode`](https://github.com/clankamode) — autonomous tooling fleet
