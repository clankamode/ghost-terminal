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
  const { data, error } = await supabase
    .from('runs')
    .insert({
      seed: runData.seed,
      level: runData.level,
      score: runData.score,
      puzzles_solved: runData.puzzlesSolved,
      time_elapsed: runData.timeElapsed,
      systems_breached: runData.systemsBreached,
      death_reason: runData.deathReason,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save run: ${error.message}`);
  }

  return data.id;
}

export async function getRun(id: string): Promise<RunData | null> {
  const { data, error } = await supabase
    .from('runs')
    .select('seed, level, score, puzzles_solved, time_elapsed, systems_breached, death_reason')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load run: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    seed: data.seed,
    level: data.level,
    score: data.score,
    puzzlesSolved: data.puzzles_solved,
    timeElapsed: data.time_elapsed,
    systemsBreached: data.systems_breached,
    deathReason: data.death_reason,
  };
}
