type SoundName = 'solve' | 'fail' | 'trace' | 'start';

const SOUND_KEY = 'ghost_terminal_sound';

export class SoundManager {
  enabled = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.enabled = this.loadEnabled();
  }

  toggle(): void {
    this.enabled = !this.enabled;
    this.persistEnabled();
    if (this.enabled) {
      void this.ensureContext();
    }
  }

  play(name: SoundName): void {
    if (!this.enabled) {
      return;
    }

    void this.playInternal(name);
  }

  private async playInternal(name: SoundName): Promise<void> {
    const context = await this.ensureContext();
    if (!context) {
      return;
    }

    const now = context.currentTime;
    if (name === 'solve') {
      this.playTone(context, 523.25, now, 0.08, 'triangle', 0.07);
      this.playTone(context, 659.25, now + 0.09, 0.08, 'triangle', 0.07);
      this.playTone(context, 783.99, now + 0.18, 0.08, 'triangle', 0.07);
      return;
    }

    if (name === 'fail') {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.22);
      return;
    }

    if (name === 'trace') {
      this.playTone(context, 440, now, 0.03, 'square', 0.04);
      return;
    }

    this.playSweep(context, now, 0.2, 220, 760);
  }

  private playTone(
    context: AudioContext,
    frequency: number,
    start: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.01);
  }

  private playSweep(
    context: AudioContext,
    start: number,
    duration: number,
    fromHz: number,
    toHz: number,
  ): void {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(fromHz, start);
    osc.frequency.exponentialRampToValueAtTime(toHz, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.11, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextCtor();
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        return null;
      }
    }

    return this.audioContext;
  }

  private loadEnabled(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(SOUND_KEY) === '1';
  }

  private persistEnabled(): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    window.localStorage.setItem(SOUND_KEY, this.enabled ? '1' : '0');
  }
}

export const soundManager = new SoundManager();
