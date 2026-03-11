const UINT32_MAX = 0xffffffff;

export function createRunSeed(now: () => number = Date.now): number {
  const value = Math.floor(now());
  return normalizeSeed(value);
}

export function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) {
    return 0;
  }
  return seed >>> 0;
}

export function parseSeedInput(input: string): number | null {
  const raw = input.trim();
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > UINT32_MAX) {
    return null;
  }

  return normalizeSeed(parsed);
}

export function parseReplayCommand(command: string): number | null {
  const match = command.trim().match(/^replay\s+(.+)$/i);
  if (!match) {
    return null;
  }
  return parseSeedInput(match[1] ?? '');
}
