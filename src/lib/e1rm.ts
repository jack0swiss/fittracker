import type { WorkoutSet } from '@/db/schema';

/**
 * Epley formula: 1RM ≈ weight × (1 + reps / 30).
 * Accurate for reps 1–10; degrades above.
 */
export function e1rm(weightKg: number, reps: number): number {
  if (reps < 1) return 0;
  return weightKg * (1 + reps / 30);
}

export function bestE1rm(sets: WorkoutSet[]): number {
  let max = 0;
  for (const s of sets) {
    if (s.isWarmup || s.reps < 1) continue;
    const value = e1rm(s.weightKg, s.reps);
    if (value > max) max = value;
  }
  return max;
}

export function isPrSet(set: WorkoutSet, history: WorkoutSet[]): boolean {
  if (set.isWarmup) return false;
  const current = e1rm(set.weightKg, set.reps);
  if (current <= 0) return false;
  const historicalBest = bestE1rm(history.filter((s) => s.id !== set.id));
  return current > historicalBest + 0.0001;
}
