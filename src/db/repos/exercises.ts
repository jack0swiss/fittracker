import { db, newId } from '../db';
import type { Exercise } from '../schema';

export interface ExerciseInput {
  name: string;
  category: Exercise['category'];
  equipment: Exercise['equipment'];
  isCompound: boolean;
  defaultRestSec: number;
  notes?: string | null;
  userId?: string | null;
}

export const exercisesRepo = {
  async list(): Promise<Exercise[]> {
    return db.exercises.orderBy('name').toArray();
  },

  async byCategory(category: Exercise['category']): Promise<Exercise[]> {
    return db.exercises.where('category').equals(category).sortBy('name');
  },

  async get(id: string): Promise<Exercise | undefined> {
    return db.exercises.get(id);
  },

  async create(input: ExerciseInput): Promise<Exercise> {
    const row: Exercise = {
      id: newId(),
      userId: input.userId ?? null,
      name: input.name.trim(),
      category: input.category,
      equipment: input.equipment,
      isCompound: input.isCompound,
      defaultRestSec: input.defaultRestSec,
      notes: input.notes ?? null,
      createdAt: Date.now(),
    };
    await db.exercises.add(row);
    return row;
  },

  async update(id: string, patch: Partial<ExerciseInput>): Promise<void> {
    await db.exercises.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    await db.exercises.delete(id);
  },
};
