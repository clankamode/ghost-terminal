import { supabase } from './supabase';

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  level: number;
  systemsBreached: number;
  createdAt: string;
};

export async function submitScore(
  name: string,
  score: number,
  level: number,
  systemsBreached: number
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot submit score.');
  }

  const { error } = await (supabase as any).from('leaderboard' as string).insert({
    name,
    score,
    level,
    systems_breached: systemsBreached,
  } as any);

  if (error) {
    throw new Error(`Failed to submit score: ${error.message}`);
  }
}

export async function getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from('leaderboard' as string)
    .select('name, score, level, systems_breached, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    name: string;
    score: number;
    level: number;
    systems_breached: number;
    created_at: string;
  }>;

  return rows.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    score: entry.score,
    level: entry.level,
    systemsBreached: entry.systems_breached,
    createdAt: entry.created_at,
  }));
}
