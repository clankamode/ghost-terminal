import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus } from './EventBus';
import { GameLoop } from './GameLoop';
import { GameStore } from './GameState';
import { LevelGenerator } from './LevelGenerator';
import { createRunSeed, parseReplayCommand, parseSeedInput } from './runSeed';

describe('EventBus', () => {
  it('registers handlers, emits payloads, and unsubscribes cleanly', () => {
    const bus = new EventBus();
    const solvedHandler = vi.fn();

    const unsubscribe = bus.on('PUZZLE_SOLVED', solvedHandler);

    bus.emit('PUZZLE_SOLVED', {
      systemId: 'L1-S1',
      puzzleType: 'logic-gate',
      points: 150,
    });

    expect(solvedHandler).toHaveBeenCalledTimes(1);
    expect(solvedHandler).toHaveBeenCalledWith({
      systemId: 'L1-S1',
      puzzleType: 'logic-gate',
      points: 150,
    });

    unsubscribe();
    bus.emit('PUZZLE_SOLVED', {
      systemId: 'L1-S2',
      puzzleType: 'cipher',
      points: 200,
    });

    expect(solvedHandler).toHaveBeenCalledTimes(1);
  });

  it('captures debug event logs when enabled and trims to max entries', () => {
    const logger = vi.fn();
    const bus = new EventBus({
      debugEventLog: true,
      maxLogEntries: 2,
      now: vi
        .fn<() => number>()
        .mockReturnValueOnce(101)
        .mockReturnValueOnce(102)
        .mockReturnValueOnce(103),
      logger,
    });

    bus.emit('SCORE_UPDATE', { score: 10, delta: 10 });
    bus.emit('SCORE_UPDATE', { score: 20, delta: 10 });
    bus.emit('SCORE_UPDATE', { score: 30, delta: 10 });

    expect(bus.getEventLog()).toEqual([
      {
        event: 'SCORE_UPDATE',
        payload: { score: 20, delta: 10 },
        timestamp: 102,
        listeners: 0,
      },
      {
        event: 'SCORE_UPDATE',
        payload: { score: 30, delta: 10 },
        timestamp: 103,
        listeners: 0,
      },
    ]);
    expect(logger).toHaveBeenCalledTimes(3);

    bus.clearEventLog();
    expect(bus.getEventLog()).toEqual([]);
  });

  it('supports toggling debug event logs on and off at runtime', () => {
    const bus = new EventBus();

    bus.emit('GAME_START', { level: 1 });
    expect(bus.getEventLog()).toEqual([]);

    bus.setDebugEventLogEnabled(true);
    bus.emit('GAME_START', { level: 2 });

    expect(bus.isDebugEventLogEnabled()).toBe(true);
    expect(bus.getEventLog()).toHaveLength(1);

    bus.setDebugEventLogEnabled(false);
    bus.emit('GAME_START', { level: 3 });

    expect(bus.getEventLog()).toHaveLength(1);
  });
});

describe('GameStore', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key);
        }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies score/life transitions and emits change snapshots', () => {
    const store = new GameStore({ phase: 'running', score: 100, lives: 3, streak: 1 });
    const snapshots: number[] = [];

    const unsubscribe = store.subscribe((state) => {
      snapshots.push(state.score);
    });

    // solved path: gain score and streak
    store.patchState({ score: 250, streak: 2 });

    // failed path: lose life and reset streak
    store.patchState({ lives: 2, streak: 0 });

    unsubscribe();

    expect(store.getState()).toMatchObject({
      phase: 'running',
      score: 250,
      lives: 2,
      streak: 0,
    });
    expect(snapshots).toEqual([250, 250]);
  });

  it('persists save data and clears it on gameover transition', () => {
    const store = new GameStore({
      phase: 'running',
      currentLevel: 3,
      score: 420,
      lives: 2,
      streak: 4,
      systemsBreached: 2,
      timeRemaining: 187,
      runSeed: 12345,
    });

    store.patchState({ score: 421 });

    const raw = storage.get('ghost-terminal:save');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({
      currentLevel: 3,
      score: 421,
      lives: 2,
      streak: 4,
      systemsBreached: 2,
      timeRemaining: 187,
      runSeed: 12345,
    });

    store.patchState({ phase: 'gameover' });

    expect(storage.has('ghost-terminal:save')).toBe(false);
    expect(store.hasSavedGame()).toBe(false);
  });

  it('sanitizes loaded save payload bounds', () => {
    storage.set(
      'ghost-terminal:save',
      JSON.stringify({
        currentLevel: -8,
        score: -100,
        lives: 0,
        streak: -5,
        systemsBreached: -3,
        timeRemaining: -20,
        runSeed: 9_999_999_999,
      }),
    );

    const store = new GameStore();

    expect(store.loadSavedGame()).toEqual({
      currentLevel: 1,
      score: 0,
      lives: 1,
      streak: 0,
      systemsBreached: 0,
      timeRemaining: 0,
      runSeed: 1410065407,
    });
  });

  it('loads legacy save payloads that omit systemsBreached/timeRemaining', () => {
    storage.set(
      'ghost-terminal:save',
      JSON.stringify({
        currentLevel: 2,
        score: 77,
        lives: 3,
        streak: 1,
      }),
    );

    const store = new GameStore();

    expect(store.loadSavedGame()).toEqual({
      currentLevel: 2,
      score: 77,
      lives: 3,
      streak: 1,
      systemsBreached: 0,
      timeRemaining: 300,
      runSeed: 0,
    });
  });
});

describe('runSeed helpers', () => {
  it('creates a normalized uint32 seed from a time source', () => {
    expect(createRunSeed(() => 4_294_967_297)).toBe(1);
  });

  it('parses replay seed commands and rejects invalid input', () => {
    expect(parseSeedInput('1337')).toBe(1337);
    expect(parseSeedInput('4294967296')).toBeNull();
    expect(parseReplayCommand('replay 9876')).toBe(9876);
    expect(parseReplayCommand('replay nope')).toBeNull();
    expect(parseReplayCommand('help')).toBeNull();
  });
});

describe('LevelGenerator', () => {
  it('is deterministic for a seed and respects tier constraints', () => {
    const seed = 1337;
    const first = new LevelGenerator(seed).generateLevel(2, 4);
    const second = new LevelGenerator(seed).generateLevel(2, 4);

    expect(second).toEqual(first);

    for (const target of first) {
      expect(target.difficulty).toBeGreaterThanOrEqual(2);
      expect(target.difficulty).toBeLessThanOrEqual(4);
      expect(target.puzzleTypes.length).toBeGreaterThanOrEqual(2);
      expect(target.puzzleTypes.length).toBeLessThanOrEqual(4);
      expect(target.defenses.length).toBeGreaterThanOrEqual(1);
      expect(target.defenses.length).toBeLessThanOrEqual(2);
      expect(target.reward).toBeGreaterThan(0);
    }
  });
});

describe('GameLoop', () => {
  let now = 0;
  let nextRafId = 0;
  let scheduledFrames = new Map<number, FrameRequestCallback>();

  const runFrame = (id: number, timestamp: number): void => {
    const callback = scheduledFrames.get(id);
    expect(callback).toBeTypeOf('function');
    scheduledFrames.delete(id);
    callback?.(timestamp);
  };

  beforeEach(() => {
    now = 1000;
    nextRafId = 0;
    scheduledFrames = new Map<number, FrameRequestCallback>();

    vi.stubGlobal('performance', {
      now: vi.fn(() => now),
    });
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const id = ++nextRafId;
        scheduledFrames.set(id, callback);
        return id;
      }),
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        scheduledFrames.delete(id);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves normal frame deltas', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    runFrame(1, 1016);
    runFrame(2, 1034);

    expect(update).toHaveBeenNthCalledWith(1, 0.016);
    expect(update).toHaveBeenNthCalledWith(2, 0.018);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('normalizes suspension-size frame gaps to a single nominal frame', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    runFrame(1, 1016);
    runFrame(2, 7016);

    expect(update).toHaveBeenNthCalledWith(1, 0.016);
    expect(update).toHaveBeenNthCalledWith(2, 1 / 60);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('keeps the core frame scheduling behavior intact', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();

    expect(loop.isRunning()).toBe(true);
    expect(loop.isPaused()).toBe(false);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    runFrame(1, 1016);

    expect(update).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(scheduledFrames.has(2)).toBe(true);

    loop.stop();

    expect(loop.isRunning()).toBe(false);
    expect(loop.isPaused()).toBe(false);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
    expect(scheduledFrames.size).toBe(0);
  });
});
