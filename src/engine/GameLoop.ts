type UpdateCallback = (dt: number) => void;
type RenderCallback = () => void;

export class GameLoop {
  private rafId: number | null = null;
  private lastTime = 0;
  private running = false;
  private paused = false;

  constructor(
    private readonly update: UpdateCallback,
    private readonly render: RenderCallback,
  ) {}

  start(): void {
    if (this.running) {
      this.paused = false;
      return;
    }

    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
    this.running = false;
    this.paused = false;
    this.lastTime = 0;
  }

  pause(): void {
    if (!this.running) {
      return;
    }
    this.paused = true;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private tick = (now: number): void => {
    if (!this.running) {
      return;
    }

    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (!this.paused) {
      this.update(dt);
      this.render();
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}
