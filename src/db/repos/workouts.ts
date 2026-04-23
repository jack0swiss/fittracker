import { db, newId } from '../db';
import { LOCAL_USER_ID, type Workout, type WorkoutSet } from '../schema';

export interface WorkoutStartInput {
  planDayId?: string | null;
  notes?: string | null;
}

export interface WorkoutSetInput {
  workoutId: string;
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  rpe?: number | null;
  isWarmup?: boolean;
}

export const workoutsRepo = {
  async list(limit = 50): Promise<Workout[]> {
    return db.workouts.orderBy('startedAt').reverse().limit(limit).toArray();
  },

  async get(id: string): Promise<Workout | undefined> {
    return db.workouts.get(id);
  },

  async current(): Promise<Workout | undefined> {
    return db.workouts
      .orderBy('startedAt')
      .reverse()
      .filter((w) => w.endedAt === null)
      .first();
  },

  async start(input: WorkoutStartInput = {}): Promise<Workout> {
    const now = Date.now();
    const row: Workout = {
      id: newId(),
      userId: LOCAL_USER_ID,
      planDayId: input.planDayId ?? null,
      startedAt: now,
      endedAt: null,
      notes: input.notes ?? null,
      createdAt: now,
    };
    await db.workouts.add(row);
    return row;
  },

  async finish(id: string): Promise<void> {
    await db.workouts.update(id, { endedAt: Date.now() });
  },

  async remove(id: string): Promise<void> {
    await db.transaction('rw', db.workouts, db.workoutSets, async () => {
      await db.workoutSets.where('workoutId').equals(id).delete();
      await db.workouts.delete(id);
    });
  },

  async setsOf(workoutId: string): Promise<WorkoutSet[]> {
    return db.workoutSets.where('workoutId').equals(workoutId).sortBy('setIndex');
  },

  async lastSetsForExercise(exerciseId: string, limit = 10): Promise<WorkoutSet[]> {
    return db.workoutSets
      .where('[exerciseId+completedAt]')
      .between([exerciseId, 0], [exerciseId, Number.MAX_SAFE_INTEGER])
      .reverse()
      .limit(limit)
      .toArray();
  },

  async addSet(input: WorkoutSetInput): Promise<WorkoutSet> {
    const row: WorkoutSet = {
      id: newId(),
      workoutId: input.workoutId,
      exerciseId: input.exerciseId,
      setIndex: input.setIndex,
      weightKg: input.weightKg,
      reps: input.reps,
      rpe: input.rpe ?? null,
      isWarmup: input.isWarmup ?? false,
      completedAt: Date.now(),
    };
    await db.workoutSets.add(row);
    return row;
  },

  async updateSet(id: string, patch: Partial<Omit<WorkoutSet, 'id'>>): Promise<void> {
    await db.workoutSets.update(id, patch);
  },

  async removeSet(id: string): Promise<void> {
    await db.workoutSets.delete(id);
  },

  async completedInRange(from: number, to: number): Promise<Workout[]> {
    return db.workouts
      .where('startedAt')
      .between(from, to)
      .filter((w) => w.endedAt !== null)
      .toArray();
  },

  async lastCompleted(): Promise<Workout | undefined> {
    return db.workouts
      .orderBy('startedAt')
      .reverse()
      .filter((w) => w.endedAt !== null)
      .first();
  },

  async volumeOfWorkouts(workoutIds: string[]): Promise<number> {
    if (workoutIds.length === 0) return 0;
    const sets = await db.workoutSets.where('workoutId').anyOf(workoutIds).toArray();
    let volume = 0;
    for (const s of sets) {
      if (s.isWarmup) continue;
      volume += s.weightKg * s.reps;
    }
    return volume;
  },
};
