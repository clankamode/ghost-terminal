# TASKS.md — ghost-terminal
> Last updated: 2026-02-28 | Status: Active backlog (core gameplay iteration)

## 🔴 High Priority
- [x] Add automated tests for `src/engine/*` and `src/puzzles/*` (state transitions, scoring events, puzzle solve/fail paths); current logic has effectively no test coverage. (completed 2026-03-05: added `src/engine/engine.test.ts` and `src/puzzles/puzzle-flows.test.ts` covering EventBus/GameStore/LevelGenerator transitions and puzzle solve+fail event paths)
- [x] Make puzzle generation deterministic in tests by injecting RNG instead of relying on `Math.random()` throughout puzzle classes and `PuzzleFactory`. (completed 2026-03-09: added injectable puzzle RNG with `Math.random` defaults, threaded it through `PuzzleFactory` and randomizing puzzle classes, and added deterministic seeded tests)
- [x] Align `LevelGenerator` puzzle type strings with `PuzzleFactory` routing so generated puzzle types map to concrete puzzle implementations instead of frequent random fallback. (completed 2026-03-05: expanded routing predicates + regression tests in `src/puzzles/PuzzleFactory.test.ts`)
- [x] Wire `PasswordCrackPuzzle` into `PuzzleFactory` selection logic (it exists but is not intentionally selected today). (completed 2026-03-05: added explicit password route in `src/puzzles/PuzzleFactory.ts`)
- [x] Define consistent failure/attempt behavior for `PortScanPuzzle` wrong answers (numeric misses currently never hard-fail), and keep this consistent with other puzzle penalties. (completed 2026-03-08: added 3-attempt numeric lockout with failure event/feedback parity and tests for invalid input, miss countdown, and hard-fail lockout behavior)

## 🟡 Medium Priority
- [ ] Add lifecycle cleanup hooks for puzzle instances (for example `MemoryMatrixPuzzle` timers) to prevent dangling timers/event emissions after puzzle exit.
- [ ] Clamp/normalize `GameLoop` `dt` after tab suspension to avoid large simulation jumps on resume.
- [ ] Revisit save/load scope in `GameStore` (currently persists only level/score/lives/streak) and decide whether `systemsBreached`/`timeRemaining` should persist.
- [ ] Document puzzle input formats and hint mechanics in README or an in-game help command.

## 🟢 Low Priority / Nice to Have
- [ ] Show run seed in UI/log output and support replaying with a seed for debugging and speedrun consistency.
- [ ] Add a debug event-log mode for `EventBus` to aid balancing and telemetry during playtests.
- [ ] Expand README with engine/puzzle architecture notes and deployment expectations (Vite + Pages + Supabase).

## 🧠 Notes
- `src/main.ts` is currently just bootstrap wiring; most risk is concentrated in engine/puzzle logic.
- Procedural generation and puzzle behavior are feature-rich already, but balancing and correctness need guardrails.
- Deterministic generation + tests will unlock safer iteration on new puzzle types.
