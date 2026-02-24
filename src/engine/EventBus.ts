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

type EventHandler<K extends GameEventType> = (payload: EventPayloadMap[K]) => void;

export class EventBus {
  private handlers: {
    [K in GameEventType]?: Set<EventHandler<K>>;
  } = {};

  on<K extends GameEventType>(event: K, handler: EventHandler<K>): () => void {
    if (!this.handlers[event]) {
      this.handlers[event] = new Set<EventHandler<K>>();
    }
    this.handlers[event]?.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends GameEventType>(event: K, handler: EventHandler<K>): void {
    this.handlers[event]?.delete(handler);
  }

  emit<K extends GameEventType>(event: K, payload: EventPayloadMap[K]): void {
    this.handlers[event]?.forEach((handler) => {
      handler(payload);
    });
  }
}
