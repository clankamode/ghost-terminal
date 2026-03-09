import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { EventBus, GameStore, LevelGenerator, type GameState, type HackTarget } from '../engine';
import { PuzzleFactory } from '../puzzles/PuzzleFactory';
import type { BasePuzzle, PuzzleFailedDetail, PuzzleSolvedDetail } from '../puzzles/BasePuzzle';
import { addScore } from '../lib/leaderboard';
import { soundManager } from '../lib/sound';
import type { HackingTerminal } from '../components/hacking-terminal';
import type { SystemNode } from '../components/system-map';

type AppPhase = 'boot' | 'game';

@customElement('cyber-app')
export class CyberApp extends LitElement {
  @state()
  private phase: AppPhase = 'boot';

  @state()
  private gameState: Readonly<GameState>;

  @state()
  private mapNodes: SystemNode[] = [];

  @state()
  private selectedNodeId = '';

  @state()
  private tracePercent = 0;

  @state()
  private elapsedSeconds = 0;

  @state()
  private hasSavedRun = false;

  @state()
  private soundEnabled = soundManager.enabled;

  private readonly store = new GameStore();
  private readonly eventBus = new EventBus();
  private readonly levelGenerator = new LevelGenerator();

  private readonly targets = new Map<string, HackTarget>();
  private unsubscribers: Array<() => void> = [];
  private puzzleUnsubscribers: Array<() => void> = [];

  private activePuzzle: BasePuzzle | null = null;
  private activeTarget: HackTarget | null = null;
  private timerId?: number;

  constructor() {
    super();
    this.gameState = this.store.getState();
    this.hasSavedRun = this.store.hasSavedGame();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.bindStoreAndEvents();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.teardownPuzzle();
    this.stopClock();
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      color: #d7fbd8;
      background: radial-gradient(circle at 20% 10%, rgba(26, 61, 23, 0.35), transparent 45%),
        radial-gradient(circle at 90% 85%, rgba(0, 84, 20, 0.22), transparent 40%),
        #010401;
      padding: 1rem;
      box-sizing: border-box;
      touch-action: manipulation;
    }

    .shell {
      display: grid;
      gap: 0.85rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(260px, 1fr) minmax(0, 2fr);
      gap: 0.85rem;
      align-items: start;
    }

    .boot-wrap {
      max-width: 1100px;
      margin: 0 auto;
    }

    .boot-layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
      gap: 0.85rem;
      align-items: start;
    }

    .hud {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.5rem;
    }

    .sound-toggle {
      border: 1px solid #2f8a3f;
      background: #031006;
      color: #d7fbd8;
      font-family: 'Courier New', Courier, monospace;
      font-size: 1rem;
      line-height: 1;
      padding: 0.45rem 0.6rem;
      cursor: pointer;
    }

    .sound-toggle:hover,
    .sound-toggle:focus-visible {
      background: #0a2310;
      outline: none;
    }

    .boot-title {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      letter-spacing: 0.08em;
    }

    .boot-copy {
      margin: 0 0 1rem;
      opacity: 0.85;
    }

    @media (max-width: 860px) {
      .boot-layout {
        grid-template-columns: 1fr;
      }

      .layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      :host {
        padding: 0.5rem;
      }

      .layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .shell,
      .layout,
      .boot-layout {
        gap: 0.5rem;
      }

      .sound-toggle {
        padding: 0.35rem 0.55rem;
      }
    }
  `;

  render() {
    if (this.phase === 'boot') {
      const isGameOver = this.gameState.phase === 'gameover';
      return html`
        <div class="boot-wrap">
          <h1 class="boot-title">Ghost Terminal</h1>
          <p class="boot-copy">${isGameOver ? 'Run terminated. Ready for redeploy.' : 'Initializing intrusion suite...'}</p>
          <section class="boot-layout">
            <boot-screen
              .hasContinue=${this.hasSavedRun}
              @start-new-game=${this.onStartNewGame}
              @continue-game=${this.onContinueGame}
            ></boot-screen>
            <leaderboard-panel></leaderboard-panel>
          </section>
        </div>
      `;
    }

    const gameOver = this.gameState.phase === 'gameover';

    return html`
      <main class="shell" role="main" aria-label="Ghost Terminal game screen">
        <section class="hud">
          <status-bar
            .level=${this.gameState.currentLevel}
            .score=${this.gameState.score}
            .lives=${this.gameState.lives}
            .time=${this.elapsedSeconds}
            .streak=${this.gameState.streak}
            .tracePercent=${this.tracePercent}
          ></status-bar>
          <button
            class="sound-toggle"
            type="button"
            @click=${this.onToggleSound}
            aria-label=${this.soundEnabled ? 'Disable sound' : 'Enable sound'}
            title=${this.soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            ${this.soundEnabled ? '🔊' : '🔇'}
          </button>
        </section>

        <section class="layout">
          <system-map
            .nodes=${this.mapNodes}
            .selectedNodeId=${this.selectedNodeId}
            @node-selected=${this.onNodeSelected}
          ></system-map>

          <hacking-terminal
            .disabled=${gameOver}
            @terminal-command=${this.onTerminalCommand}
          ></hacking-terminal>
        </section>
      </main>
    `;
  }

  private bindStoreAndEvents(): void {
    this.unsubscribers.push(
      this.store.subscribe((nextState) => {
        this.gameState = nextState;
        this.hasSavedRun = this.store.hasSavedGame();
      }),
    );

    this.unsubscribers.push(
      this.eventBus.on('SCORE_UPDATE', ({ score }) => {
        this.store.patchState({ score });
      }),
    );

    this.unsubscribers.push(
      this.eventBus.on('PUZZLE_SOLVED', () => {
        soundManager.play('solve');
        this.store.patchState({
          systemsBreached: this.mapNodes.filter((node) => node.state === 'breached').length,
        });
      }),
    );

    this.unsubscribers.push(
      this.eventBus.on('PUZZLE_FAILED', ({ penalty }) => {
        const nextLives = Math.max(0, this.gameState.lives - 1);
        const nextTrace = Math.min(100, this.tracePercent + Math.max(10, Math.floor(Math.abs(penalty) / 5)));
        if (nextTrace > this.tracePercent) {
          soundManager.play('trace');
        }
        this.tracePercent = nextTrace;
        soundManager.play('fail');
        this.store.patchState({ lives: nextLives });
        if (nextTrace >= 100) {
          this.store.patchState({ streak: 0 });
        }
        if (nextLives === 0) {
          this.endGame('All agent lives depleted.');
        }
      }),
    );
  }

  private onStartNewGame = (): void => {
    soundManager.play('start');
    this.store.reset({
      phase: 'running',
      currentLevel: 1,
      score: 0,
      lives: 3,
      streak: 0,
    });
    this.phase = 'game';
    this.startLevel({ lives: 3, streak: 0 });
  };

  private onContinueGame = (): void => {
    soundManager.play('start');
    const saved = this.store.loadSavedGame();
    if (!saved) {
      this.onStartNewGame();
      return;
    }

    this.store.reset({
      phase: 'running',
      currentLevel: saved.currentLevel,
      score: saved.score,
      lives: saved.lives,
      streak: saved.streak,
      systemsBreached: 0,
      timeRemaining: 300,
    });
    this.phase = 'game';
    this.startLevel({ lives: saved.lives, streak: saved.streak });
  };

  private startLevel(options?: { lives?: number; streak?: number }): void {
    this.stopClock();
    this.teardownPuzzle();

    const currentLevel = this.gameState.currentLevel;
    const levelTargets = this.levelGenerator.generateLevel(currentLevel);
    this.targets.clear();

    this.mapNodes = levelTargets.map((target, index) => {
      this.targets.set(target.id, target);
      return {
        id: target.id,
        label: target.name.toUpperCase(),
        state: index === 0 ? 'accessible' : 'locked',
      };
    });

    this.selectedNodeId = '';
    this.tracePercent = 0;
    this.elapsedSeconds = 0;

    this.store.patchState({
      phase: 'running',
      timeRemaining: 300,
      systemsBreached: 0,
      lives: options?.lives ?? 3,
      streak: options?.streak ?? this.gameState.streak,
    });

    void this.updateComplete.then(() => {
      const terminal = this.getTerminal();
      if (!terminal) {
        return;
      }
      terminal.clear();
      terminal.printLine(`LEVEL ${currentLevel} READY`, '#8cff9e');
      terminal.printLine('Select an ACCESSIBLE node from SYSTEM-MAP.');
      terminal.printLine('Commands during puzzle: `hint` or answer directly.');
    });

    this.timerId = window.setInterval(() => {
      if (this.gameState.phase !== 'running') {
        return;
      }

      const nextRemaining = Math.max(0, this.gameState.timeRemaining - 1);
      this.elapsedSeconds += 1;
      this.store.patchState({ timeRemaining: nextRemaining });

      if (nextRemaining === 0) {
        this.endGame('Trace timer reached zero.');
      }
    }, 1000);
  }

  private onNodeSelected = (event: Event): void => {
    const customEvent = event as CustomEvent<{ node: SystemNode }>;
    const node = customEvent.detail.node;
    const terminal = this.getTerminal();

    if (!terminal || this.gameState.phase !== 'running') {
      return;
    }

    if (node.state === 'locked') {
      terminal.printLine(`SYSTEM ${node.label} is LOCKED.`, '#ffb366');
      return;
    }

    if (node.state === 'breached') {
      terminal.printLine(`SYSTEM ${node.label} already breached.`, '#7cc9ff');
      return;
    }

    const target = this.targets.get(node.id);
    if (!target) {
      terminal.printLine('Target data missing for selected node.', '#ff6b6b');
      return;
    }

    this.teardownPuzzle();
    this.selectedNodeId = node.id;
    this.activeTarget = target;

    const puzzle = PuzzleFactory.createForTarget(target);
    this.activePuzzle = puzzle;

    const solvedHandler = (puzzleEvent: Event): void => {
      const detail = (puzzleEvent as CustomEvent<PuzzleSolvedDetail>).detail;
      this.handlePuzzleSolved(target, detail);
    };

    const failedHandler = (puzzleEvent: Event): void => {
      const detail = (puzzleEvent as CustomEvent<PuzzleFailedDetail>).detail;
      this.handlePuzzleFailed(target, detail);
    };

    const feedbackHandler = (puzzleEvent: Event): void => {
      const detail = (puzzleEvent as CustomEvent<string>).detail;
      if (detail) {
        terminal.printLine(detail, '#f0d37a');
      }
    };

    const clearHandler = (): void => {
      terminal.clear();
      terminal.printLine('Memory matrix hidden. Reconstruct from recall.', '#7cc9ff');
    };

    puzzle.addEventListener('puzzle-solved', solvedHandler);
    puzzle.addEventListener('puzzle-failed', failedHandler);
    puzzle.addEventListener('terminal-feedback', feedbackHandler);
    puzzle.addEventListener('terminal-clear', clearHandler);
    this.puzzleUnsubscribers.push(() => puzzle.removeEventListener('puzzle-solved', solvedHandler));
    this.puzzleUnsubscribers.push(() => puzzle.removeEventListener('puzzle-failed', failedHandler));
    this.puzzleUnsubscribers.push(() => puzzle.removeEventListener('terminal-feedback', feedbackHandler));
    this.puzzleUnsubscribers.push(() => puzzle.removeEventListener('terminal-clear', clearHandler));

    terminal.clear();
    terminal.printLine(`Target locked: ${node.label}`, '#7cc9ff');
    terminal.printLine(`Difficulty: ${target.difficulty}`);
    terminal.printLine('');
    puzzle.start().split('\n').forEach((line) => terminal.printLine(line));
  };

  private onTerminalCommand = (event: Event): void => {
    const customEvent = event as CustomEvent<{ command: string }>;
    const command = customEvent.detail.command.trim();
    const terminal = this.getTerminal();

    if (!terminal) {
      return;
    }

    if (this.gameState.phase === 'gameover') {
      if (command.toLowerCase() === 'restart') {
        this.onStartNewGame();
        return;
      }
      terminal.printLine('Game over. Type `restart` to play again.', '#ff6b6b');
      return;
    }

    if (!this.activePuzzle) {
      if (command.toLowerCase() === 'help') {
        terminal.printLine('Select an ACCESSIBLE node to start a puzzle.');
      } else if (command.length > 0) {
        terminal.printLine('No active puzzle. Select a node from SYSTEM-MAP.', '#ffb366');
      }
      return;
    }

    if (command.toLowerCase() === 'hint') {
      terminal.printLine(this.activePuzzle.getHint(), '#f0d37a');
      return;
    }

    const solved = this.activePuzzle.solve(command);
    if (!solved) {
      terminal.printLine('Access denied. Try again or type `hint`.', '#ffb366');
    }
  };

  private handlePuzzleSolved(target: HackTarget, detail: PuzzleSolvedDetail): void {
    const terminal = this.getTerminal();
    const nextStreak = this.gameState.streak + 1;
    const multiplier = this.getStreakMultiplier(nextStreak);
    const points = Math.floor(target.reward * multiplier);
    const nextScore = this.gameState.score + points;

    this.store.patchState({ streak: nextStreak });

    this.eventBus.emit('PUZZLE_SOLVED', {
      systemId: target.id,
      puzzleType: detail.puzzle,
      points,
    });

    this.eventBus.emit('SCORE_UPDATE', {
      score: nextScore,
      delta: points,
    });

    this.updateNodeState(target.id, 'breached');
    this.unlockNextNode(target.id);

    terminal?.printLine(`SUCCESS: ${target.name} breached (+${points}, ${multiplier.toFixed(1)}x)`, '#62ff7d');

    if (this.mapNodes.every((node) => node.state === 'breached')) {
      this.advanceToNextLevel();
    } else {
      this.teardownPuzzle();
      this.selectedNodeId = '';
      terminal?.printLine('Select next ACCESSIBLE node.', '#7cc9ff');
    }
  }

  private handlePuzzleFailed(target: HackTarget, detail: PuzzleFailedDetail): void {
    const terminal = this.getTerminal();
    const penalty = Math.max(25, target.difficulty * 20);
    const nextScore = Math.max(0, this.gameState.score - penalty);
    const nextLives = Math.max(0, this.gameState.lives - 1);

    this.store.patchState({ streak: 0 });

    this.eventBus.emit('PUZZLE_FAILED', {
      systemId: target.id,
      puzzleType: detail.puzzle,
      penalty,
    });

    this.eventBus.emit('SCORE_UPDATE', {
      score: nextScore,
      delta: -penalty,
    });

    terminal?.printLine(
      detail.reason ? `FAILURE: ${detail.reason}` : `FAILURE: ${target.name} pushback detected.`,
      '#ff6b6b',
    );
    terminal?.printLine(`Penalty -${penalty}. Lives remaining: ${nextLives}.`);

    this.teardownPuzzle();
    this.selectedNodeId = '';
  }

  private advanceToNextLevel(): void {
    const terminal = this.getTerminal();
    const nextLevel = this.gameState.currentLevel + 1;

    terminal?.printLine(`LEVEL ${this.gameState.currentLevel} COMPLETE`, '#8cff9e');
    terminal?.printLine(`Advancing to LEVEL ${nextLevel}...`, '#8cff9e');

    this.store.patchState({ currentLevel: nextLevel });
    this.startLevel();
  }

  private endGame(reason: string): void {
    if (this.gameState.phase === 'gameover') {
      return;
    }

    addScore(this.gameState.score, this.gameState.currentLevel);
    this.store.patchState({ phase: 'gameover' });
    this.store.clearSavedGame();
    this.stopClock();
    this.teardownPuzzle();
    this.hasSavedRun = false;
    this.phase = 'boot';

    const terminal = this.getTerminal();
    terminal?.printLine('', '#ff6b6b');
    terminal?.printLine(`GAME OVER: ${reason}`, '#ff6b6b');
    terminal?.printLine(`Final score: ${this.gameState.score}`);
    terminal?.printLine('Type `restart` to start a new run.');
  }

  private onToggleSound = (): void => {
    soundManager.toggle();
    this.soundEnabled = soundManager.enabled;
  };

  private getTerminal(): HackingTerminal | null {
    return this.renderRoot.querySelector('hacking-terminal');
  }

  private updateNodeState(nodeId: string, state: SystemNode['state']): void {
    this.mapNodes = this.mapNodes.map((node) => (node.id === nodeId ? { ...node, state } : node));
  }

  private unlockNextNode(afterNodeId: string): void {
    const index = this.mapNodes.findIndex((node) => node.id === afterNodeId);
    if (index < 0) {
      return;
    }

    for (let i = index + 1; i < this.mapNodes.length; i += 1) {
      const node = this.mapNodes[i];
      if (node?.state === 'locked') {
        this.updateNodeState(node.id, 'accessible');
        return;
      }
    }
  }

  private stopClock(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private teardownPuzzle(): void {
    this.puzzleUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.puzzleUnsubscribers = [];

    this.activePuzzle?.dispose();
    this.activePuzzle = null;
    this.activeTarget = null;
  }

  private getStreakMultiplier(streak: number): number {
    if (streak >= 10) {
      return 3;
    }
    if (streak >= 5) {
      return 2;
    }
    if (streak >= 3) {
      return 1.5;
    }
    return 1;
  }
}
