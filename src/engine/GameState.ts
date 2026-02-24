export type GamePhase = "menu" | "running" | "paused" | "gameover";

export interface GameState {
  phase: GamePhase;
  currentLevel: number;
  score: number;
  lives: number;
  systemsBreached: number;
  timeRemaining: number;
}

const CHANGE_EVENT = "change";

export class GameStore extends EventTarget {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    super();
    this.state = {
      phase: "menu",
      currentLevel: 1,
      score: 0,
      lives: 3,
      systemsBreached: 0,
      timeRemaining: 300,
      ...initialState,
    };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  setState(nextState: GameState): void {
    this.state = { ...nextState };
    this.emitChange();
  }

  patchState(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    this.emitChange();
  }

  reset(initialState?: Partial<GameState>): void {
    this.state = {
      phase: "menu",
      currentLevel: 1,
      score: 0,
      lives: 3,
      systemsBreached: 0,
      timeRemaining: 300,
      ...initialState,
    };
    this.emitChange();
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
}
