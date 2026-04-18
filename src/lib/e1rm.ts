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

export interface SessionPoint {
  workoutId: string;
  date: number;
  bestE1rm: number;
  maxRpe: number | null;
  isPr: boolean;
}

/**
 * Group sets by workoutId, return one point per session ordered by date asc.
 * `bestE1rm` is the highest e1RM across non-warmup sets.
 * `isPr` is true when the e1RM exceeds all earlier sessions.
 */
export function sessionsForExercise(sets: WorkoutSet[]): SessionPoint[] {
  const byWorkout = new Map<string, WorkoutSet[]>();
  for (const s of sets) {
    if (s.isWarmup) continue;
    const arr = byWorkout.get(s.workoutId) ?? [];
    arr.push(s);
    byWorkout.set(s.workoutId, arr);
  }
  const rows: Omit<SessionPoint, 'isPr'>[] = [];
  for (const [workoutId, arr] of byWorkout) {
    let best = 0;
    let maxRpe: number | null = null;
    let date = 0;
    for (const s of arr) {
      const v = e1rm(s.weightKg, s.reps);
      if (v > best) best = v;
      if (s.rpe != null && (maxRpe == null || s.rpe > maxRpe)) maxRpe = s.rpe;
      if (s.completedAt > date) date = s.completedAt;
    }
    if (best > 0) rows.push({ workoutId, date, bestE1rm: best, maxRpe });
  }
  rows.sort((a, b) => a.date - b.date);
  let running = 0;
  return rows.map((r) => {
    const isPr = r.bestE1rm > running + 0.0001;
    if (isPr) running = r.bestE1rm;
    return { ...r, isPr };
  });
}

/**
 * Deload recommendation: last N sessions without e1RM progression AND top RPE ≥ threshold.
 */
export function shouldDeload(
  sessions: SessionPoint[],
  opts: { minSessions?: number; rpeThreshold?: number } = {},
): boolean {
  const minSessions = opts.minSessions ?? 3;
  const rpeThreshold = opts.rpeThreshold ?? 9;
  if (sessions.length < minSessions) return false;
  const tail = sessions.slice(-minSessions);
  const noProgression = tail.every((s) => !s.isPr);
  const hardRpe = tail.every((s) => s.maxRpe != null && s.maxRpe >= rpeThreshold);
  return noProgression && hardRpe;
}
