# Ghost Terminal ⚡

A browser-based terminal hacking roguelike. Procedurally generated networks, puzzle-based infiltration, played entirely through a terminal interface.

## Stack
- Lit web components
- TypeScript
- Vite
- Supabase (leaderboards)
- Cloudflare Pages

## Engine + puzzle architecture

### Runtime flow
- `src/app/cyber-app.ts` is the orchestration layer: boot flow, HUD, node selection, puzzle lifecycle, and terminal I/O.
- `GameStore` (`src/engine/GameState.ts`) is the canonical run state (level, score, lives, streak, timer, breach count) and local save persistence.
- `LevelGenerator` (`src/engine/LevelGenerator.ts`) emits deterministic level targets when seeded, which keeps balancing and replay work testable.
- `EventBus` (`src/engine/EventBus.ts`) is the internal gameplay event channel (`PUZZLE_SOLVED`, `PUZZLE_FAILED`, `SCORE_UPDATE`, etc.).
  - Debug playtest mode is opt-in via `new EventBus({ debugEventLog: true })`.
  - Use `getEventLog()` to inspect recent emitted events (with timestamps/listener count), `clearEventLog()` to reset, and `setDebugEventLogEnabled()` to toggle mid-run.

### Puzzle model
- Every puzzle extends `BasePuzzle` (`src/puzzles/BasePuzzle.ts`) and emits DOM events for solved/failed/terminal feedback.
- `PuzzleFactory` routes generated target metadata into concrete puzzle classes.
- Randomized puzzles consume injectable RNG (`src/puzzles/rng.ts`) so tests can run deterministically.
- Puzzles should self-manage cleanup/disposal (especially timers) to avoid post-exit emissions.

## Deployment expectations (Vite + Pages + Supabase)

### 1) Build and static output
- Vite build output is `dist/`.
- Cloudflare Pages serves `dist/` as static assets.
- Required commands:

```bash
npm install
npm run build
```

### 2) Cloudflare Pages deployment
- Project uses Wrangler Pages deploy:

```bash
npm run pages:deploy
# equivalent to: wrangler pages deploy dist
```

- `wrangler.toml` should point at the Pages project used for this repo.
- Treat Pages deployment as immutable static publish from the current build output.

### 3) Supabase integration expectations
- Leaderboard writes/reads depend on Supabase browser env vars configured at build/runtime:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Keep `.env.example` aligned with required variables.
- Without valid Supabase env vars, local gameplay should still run, but leaderboard operations will fail gracefully.

### 4) PR/release hygiene
- Before pushing deployment-related changes, run:

```bash
npm run test
npm run build
```

- If puzzle or engine behavior changes, add/update Vitest coverage in `src/engine/*.test.ts` and `src/puzzles/*.test.ts`.

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
