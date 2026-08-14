import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SoundManager } from './sound';

const SOUND_KEY = 'ghost_terminal_sound';

describe('SoundManager', () => {
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

  it('defaults to muted and persists toggle', () => {
    const manager = new SoundManager();
    expect(manager.enabled).toBe(false);

    manager.toggle();
    expect(manager.enabled).toBe(true);
    expect(storage.get(SOUND_KEY)).toBe('1');

    manager.toggle();
    expect(manager.enabled).toBe(false);
    expect(storage.get(SOUND_KEY)).toBe('0');
  });

  it('gates playTypingBlip on the same enabled flag as game SFX', () => {
    const manager = new SoundManager();
    expect(manager.enabled).toBe(false);
    // Muted: must no-op without requiring AudioContext.
    manager.playTypingBlip();

    manager.enabled = true;
    // Without AudioContext on the stub window, ensureContext returns null — still no throw.
    manager.playTypingBlip();
  });
});
