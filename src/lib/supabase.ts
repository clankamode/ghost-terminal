import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string;
          name: string;
          score: number;
          level: number;
          systems_breached: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          score: number;
          level: number;
          systems_breached: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          score?: number;
          level?: number;
          systems_breached?: number;
          created_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          seed: string;
          level: number;
          score: number;
          puzzles_solved: number;
          time_elapsed: number;
          systems_breached: number;
          death_reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          seed: string;
          level: number;
          score: number;
          puzzles_solved: number;
          time_elapsed: number;
          systems_breached: number;
          death_reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          seed?: string;
          level?: number;
          score?: number;
          puzzles_solved?: number;
          time_elapsed?: number;
          systems_breached?: number;
          death_reason?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable online features.'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);

export type { Json };
