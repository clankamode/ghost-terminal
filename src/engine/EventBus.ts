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
  private readonly handlers = new Map<string, Set<Function>>();

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
    if (!eventHandlers) {
      return;
    }

    eventHandlers.forEach((handler) => {
      (handler as EventHandler<K>)(payload);
    });
  }
}
