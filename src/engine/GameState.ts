export type GamePhase = "menu" | "running" | "paused" | "gameover";

export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  lives: number;
  systemsBreached: number;
  timeRemaining: number;
  streak: number;
  runSeed: number;
}

const CHANGE_EVENT = "change";
const SAVE_KEY = "ghost-terminal:save";

const DEFAULT_STATE: GameState = {
  phase: "menu",
  currentLevel: 1,
  score: 0,
  lives: 3,
  systemsBreached: 0,
  timeRemaining: 300,
  streak: 0,
  runSeed: 0,
};

interface SavePayload {
  currentLevel: number;
  score: number;
  lives: number;
  streak: number;
  // These fields are optional in persisted payloads for backward compatibility with
  // older saves that only tracked level/score/lives/streak.
  systemsBreached?: number;
  timeRemaining?: number;
  runSeed?: number;
}

export class GameStore extends EventTarget {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    super();
    this.state = {
      ...DEFAULT_STATE,
      ...initialState,
    };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  setState(nextState: GameState): void {
    this.state = { ...nextState };
    this.persistState();
    this.emitChange();
  }

  patchState(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    this.persistState();
    this.emitChange();
  }

  reset(initialState?: Partial<GameState>): void {
    this.state = {
      ...DEFAULT_STATE,
      ...initialState,
    };
    this.persistState();
    this.emitChange();
  }

  hasSavedGame(): boolean {
    return this.loadSavedGame() !== null;
  }

  loadSavedGame(): Partial<GameState> | null {
    if (!this.canUseStorage()) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<SavePayload>;
      if (
        typeof parsed.currentLevel !== "number" ||
        typeof parsed.score !== "number" ||
        typeof parsed.lives !== "number"
      ) {
        return null;
      }

      return {
        currentLevel: Math.max(1, Math.floor(parsed.currentLevel)),
        score: Math.max(0, Math.floor(parsed.score)),
        lives: Math.max(1, Math.floor(parsed.lives)),
        streak:
          typeof parsed.streak === "number" ? Math.max(0, Math.floor(parsed.streak)) : 0,
        systemsBreached:
          typeof parsed.systemsBreached === "number"
            ? Math.max(0, Math.floor(parsed.systemsBreached))
            : DEFAULT_STATE.systemsBreached,
        timeRemaining:
          typeof parsed.timeRemaining === "number"
            ? Math.max(0, Math.floor(parsed.timeRemaining))
            : DEFAULT_STATE.timeRemaining,
        runSeed:
          typeof parsed.runSeed === 'number' && Number.isFinite(parsed.runSeed)
            ? parsed.runSeed >>> 0
            : DEFAULT_STATE.runSeed,
      };
    } catch {
      return null;
    }
  }

  clearSavedGame(): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(SAVE_KEY);
  }

  subscribe(listener: (state: Readonly<GameState>) => void): () => void {
    const handler = (event: Event): void => {
      const customEvent = event as CustomEvent<Readonly<GameState>>;
      listener(customEvent.detail);
    };

    this.addEventListener(CHANGE_EVENT, handler);
    return () => this.removeEventListener(CHANGE_EVENT, handler);
  }

  private emitChange(): void {
    this.dispatchEvent(
      new CustomEvent<Readonly<GameState>>(CHANGE_EVENT, {
        detail: this.getState(),
      }),
    );
  }

  private persistState(): void {
    if (!this.canUseStorage()) {
      return;
    }

    if (this.state.phase === "gameover") {
      this.clearSavedGame();
      return;
    }

    const payload: SavePayload = {
      currentLevel: this.state.currentLevel,
      score: this.state.score,
      lives: this.state.lives,
      streak: this.state.streak,
      systemsBreached: this.state.systemsBreached,
      timeRemaining: this.state.timeRemaining,
      runSeed: this.state.runSeed,
    };

    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota/unavailable failures.
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }
}
