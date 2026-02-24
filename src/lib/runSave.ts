import { supabase } from './supabase';

export type RunData = {
  seed: string;
  level: number;
  score: number;
  puzzlesSolved: number;
  timeElapsed: number;
  systemsBreached: number;
  deathReason: string;
};

export async function saveRun(runData: RunData): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Cannot save run.');
  }

  const { data, error } = await (supabase as any)
    .from('runs' as string)
    .insert({
      seed: runData.seed,
      level: runData.level,
      score: runData.score,
      puzzles_solved: runData.puzzlesSolved,
      time_elapsed: runData.timeElapsed,
      systems_breached: runData.systemsBreached,
      death_reason: runData.deathReason,
    } as any)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save run: ${error.message}`);
  }

  return (data as { id: string }).id;
}

export async function getRun(id: string): Promise<RunData | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from('runs' as string)
    .select('seed, level, score, puzzles_solved, time_elapsed, systems_breached, death_reason')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load run: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as {
    seed: string;
    level: number;
    score: number;
    puzzles_solved: number;
    time_elapsed: number;
    systems_breached: number;
    death_reason: string;
  };

  return {
    seed: row.seed,
    level: row.level,
    score: row.score,
    puzzlesSolved: row.puzzles_solved,
    timeElapsed: row.time_elapsed,
    systemsBreached: row.systems_breached,
    deathReason: row.death_reason,
  };
}
