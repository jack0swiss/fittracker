import Dexie, { type Table } from 'dexie';
import type {
  BodyMeasurement,
  Exercise,
  Plan,
  PlanDay,
  PlanExercise,
  Workout,
  WorkoutSet,
} from './schema';

export class FitTrackerDB extends Dexie {
  exercises!: Table<Exercise, string>;
  plans!: Table<Plan, string>;
  planDays!: Table<PlanDay, string>;
  planExercises!: Table<PlanExercise, string>;
  workouts!: Table<Workout, string>;
  workoutSets!: Table<WorkoutSet, string>;
  bodyMeasurements!: Table<BodyMeasurement, string>;

  constructor() {
    super('fittracker');
    this.version(1).stores({
      exercises: 'id, userId, category, name',
      plans: 'id, userId, createdAt',
      planDays: 'id, planId, dayIndex',
      planExercises: 'id, planDayId, exerciseId, orderIndex',
      workouts: 'id, userId, startedAt, planDayId',
      workoutSets: 'id, workoutId, exerciseId, completedAt, [exerciseId+completedAt]',
      bodyMeasurements: 'id, userId, [metric+measuredAt], [source+externalId]',
    });
  }
}

export const db = new FitTrackerDB();

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes (tests, etc.)
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
