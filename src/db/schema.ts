export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'full-body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band';

export interface Exercise {
  id: string;
  userId: string | null;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | null;
  isCompound: boolean;
  defaultRestSec: number;
  notes: string | null;
  createdAt: number;
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: number;
}

export interface PlanDay {
  id: string;
  planId: string;
  dayIndex: number;
  name: string;
}

export interface PlanExercise {
  id: string;
  planDayId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetRpe: number | null;
}

export interface Workout {
  id: string;
  userId: string;
  planDayId: string | null;
  startedAt: number;
  endedAt: number | null;
  notes: string | null;
  createdAt: number;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  completedAt: number;
}

export type MeasurementMetric =
  | 'weight_kg'
  | 'body_fat_pct'
  | 'hrv_ms'
  | 'steps'
  | 'resting_hr'
  | 'sleep_min';

export type MeasurementSource =
  | 'manual'
  | 'withings'
  | 'google-health'
  | 'strava'
  | 'fitbit'
  | 'garmin'
  | 'apple-health'
  | 'whoop'
  | 'oura'
  | 'myfitnesspal'
  | 'nutritionix';

export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredAt: number;
  metric: MeasurementMetric;
  value: number;
  source: MeasurementSource;
  externalId: string | null;
  createdAt: number;
}

export const LOCAL_USER_ID = 'local';
