export type GameEventType =
  | "GAME_START"
  | "GAME_OVER"
  | "LEVEL_COMPLETE"
  | "PUZZLE_SOLVED"
  | "PUZZLE_FAILED"
  | "SCORE_UPDATE";

export interface EventPayloadMap {
  GAME_START: { level: number };
  GAME_OVER: { finalScore: number; levelReached: number };
  LEVEL_COMPLETE: { level: number; systemsBreached: number };
  PUZZLE_SOLVED: { systemId: string; puzzleType: string; points: number };
  PUZZLE_FAILED: { systemId: string; puzzleType: string; penalty: number };
  SCORE_UPDATE: { score: number; delta: number };
}

export interface EventLogEntry<K extends GameEventType = GameEventType> {
  event: K;
  payload: EventPayloadMap[K];
  timestamp: number;
  listeners: number;
}

export interface EventBusOptions {
  debugEventLog?: boolean;
  maxLogEntries?: number;
  logger?: (entry: EventLogEntry) => void;
  now?: () => number;
}

type EventHandler<K extends GameEventType> = (payload: EventPayloadMap[K]) => void;

const DEFAULT_MAX_LOG_ENTRIES = 250;

export class EventBus {
  private readonly handlers = new Map<string, Set<Function>>();
  private readonly maxLogEntries: number;
  private readonly logger?: (entry: EventLogEntry) => void;
  private readonly now: () => number;
  private readonly eventLog: EventLogEntry[] = [];
  private debugEventLogEnabled: boolean;

  constructor(options: EventBusOptions = {}) {
    this.debugEventLogEnabled = options.debugEventLog ?? false;
    this.maxLogEntries = Math.max(1, options.maxLogEntries ?? DEFAULT_MAX_LOG_ENTRIES);
    this.logger = options.logger;
    this.now = options.now ?? (() => Date.now());
  }

  on<K extends GameEventType>(event: K, handler: EventHandler<K>): () => void {
    const eventKey = event as string;
    let eventHandlers = this.handlers.get(eventKey);

    if (!eventHandlers) {
      eventHandlers = new Set<Function>();
      this.handlers.set(eventKey, eventHandlers);
    }

    eventHandlers.add(handler as Function);
    return () => this.off(event, handler);
  }

  off<K extends GameEventType>(event: K, handler: EventHandler<K>): void {
    const eventKey = event as string;
    const eventHandlers = this.handlers.get(eventKey);
    if (!eventHandlers) {
      return;
    }

    eventHandlers.delete(handler as Function);
    if (eventHandlers.size === 0) {
      this.handlers.delete(eventKey);
    }
  }

  emit<K extends GameEventType>(event: K, payload: EventPayloadMap[K]): void {
    const eventHandlers = this.handlers.get(event as string);
    const listenerCount = eventHandlers?.size ?? 0;

    this.maybeLogEvent(event, payload, listenerCount);

    if (!eventHandlers) {
      return;
    }

    eventHandlers.forEach((handler) => {
      (handler as EventHandler<K>)(payload);
    });
  }

  setDebugEventLogEnabled(enabled: boolean): void {
    this.debugEventLogEnabled = enabled;
  }

  isDebugEventLogEnabled(): boolean {
    return this.debugEventLogEnabled;
  }

  getEventLog(): EventLogEntry[] {
    return [...this.eventLog];
  }

  clearEventLog(): void {
    this.eventLog.length = 0;
  }

  private maybeLogEvent<K extends GameEventType>(event: K, payload: EventPayloadMap[K], listeners: number): void {
    if (!this.debugEventLogEnabled) {
      return;
    }

    const entry: EventLogEntry<K> = {
      event,
      payload,
      timestamp: this.now(),
      listeners,
    };

    this.eventLog.push(entry);
    if (this.eventLog.length > this.maxLogEntries) {
      this.eventLog.splice(0, this.eventLog.length - this.maxLogEntries);
    }

    this.logger?.(entry);
  }
}
