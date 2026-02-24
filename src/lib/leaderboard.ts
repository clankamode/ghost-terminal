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
  const { error } = await supabase.from('leaderboard').insert({
    name,
    score,
    level,
    systems_breached: systemsBreached,
  });

  if (error) {
    throw new Error(`Failed to submit score: ${error.message}`);
  }
}

export async function getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('name, score, level, systems_breached, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  return (data ?? []).map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    score: entry.score,
    level: entry.level,
    systemsBreached: entry.systems_breached,
    createdAt: entry.created_at,
  }));
}
