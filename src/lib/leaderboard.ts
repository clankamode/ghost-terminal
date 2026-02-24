export type LeaderboardEntry = {
  score: number;
  level: number;
  date: string;
};

const LEADERBOARD_KEY = 'cyberlobster_leaderboard';
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const entries = parsed
      .map(toValidEntry)
      .filter((entry): entry is LeaderboardEntry => entry !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);

    return entries;
  } catch {
    return [];
  }
}

export function addScore(score: number, level: number): void {
  if (!canUseStorage()) {
    return;
  }

  const normalizedScore = Math.max(0, Math.floor(score));
  const normalizedLevel = Math.max(1, Math.floor(level));
  const nextEntry: LeaderboardEntry = {
    score: normalizedScore,
    level: normalizedLevel,
    date: new Date().toISOString(),
  };

  const next = [...getLeaderboard(), nextEntry].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  persistLeaderboard(next);
}

export function clearLeaderboard(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(LEADERBOARD_KEY);
}

function persistLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota/unavailable failures.
  }
}

function toValidEntry(value: unknown): LeaderboardEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<LeaderboardEntry>;
  if (
    typeof candidate.score !== 'number' ||
    !Number.isFinite(candidate.score) ||
    typeof candidate.level !== 'number' ||
    !Number.isFinite(candidate.level) ||
    typeof candidate.date !== 'string'
  ) {
    return null;
  }

  return {
    score: Math.max(0, Math.floor(candidate.score)),
    level: Math.max(1, Math.floor(candidate.level)),
    date: candidate.date,
  };
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
