import { db, newId } from '../db';
import { LOCAL_USER_ID, type Plan, type PlanDay, type PlanExercise } from '../schema';

export interface PlanInput {
  name: string;
  description?: string | null;
}

export interface PlanDayInput {
  planId: string;
  dayIndex: number;
  name: string;
}

export interface PlanExerciseInput {
  planDayId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetRpe?: number | null;
}

export const plansRepo = {
  async list(): Promise<Plan[]> {
    return db.plans.orderBy('createdAt').reverse().toArray();
  },

  async get(id: string): Promise<Plan | undefined> {
    return db.plans.get(id);
  },

  async create(input: PlanInput): Promise<Plan> {
    const row: Plan = {
      id: newId(),
      userId: LOCAL_USER_ID,
      name: input.name.trim(),
      description: input.description ?? null,
      createdAt: Date.now(),
    };
    await db.plans.add(row);
    return row;
  },

  async update(id: string, patch: Partial<PlanInput>): Promise<void> {
    await db.plans.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    await db.transaction('rw', db.plans, db.planDays, db.planExercises, async () => {
      const days = await db.planDays.where('planId').equals(id).toArray();
      const dayIds = days.map((d) => d.id);
      await db.planExercises.where('planDayId').anyOf(dayIds).delete();
      await db.planDays.where('planId').equals(id).delete();
      await db.plans.delete(id);
    });
  },

  async daysOf(planId: string): Promise<PlanDay[]> {
    return db.planDays.where('planId').equals(planId).sortBy('dayIndex');
  },

  async getDay(planDayId: string): Promise<PlanDay | undefined> {
    return db.planDays.get(planDayId);
  },

  async addDay(input: PlanDayInput): Promise<PlanDay> {
    const row: PlanDay = {
      id: newId(),
      planId: input.planId,
      dayIndex: input.dayIndex,
      name: input.name.trim(),
    };
    await db.planDays.add(row);
    return row;
  },

  async exercisesOfDay(planDayId: string): Promise<PlanExercise[]> {
    return db.planExercises.where('planDayId').equals(planDayId).sortBy('orderIndex');
  },

  async addExercise(input: PlanExerciseInput): Promise<PlanExercise> {
    const row: PlanExercise = {
      id: newId(),
      planDayId: input.planDayId,
      exerciseId: input.exerciseId,
      orderIndex: input.orderIndex,
      targetSets: input.targetSets,
      targetReps: input.targetReps,
      targetRpe: input.targetRpe ?? null,
    };
    await db.planExercises.add(row);
    return row;
  },
};
