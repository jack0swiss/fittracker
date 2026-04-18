import { db, newId } from './db';
import type { Exercise } from './schema';

interface SeedExercise {
  name: string;
  category: Exercise['category'];
  equipment: Exercise['equipment'];
  isCompound: boolean;
  defaultRestSec: number;
}

const SEED_EXERCISES: SeedExercise[] = [
  // Chest
  { name: 'Bankdrücken (Langhantel)', category: 'chest', equipment: 'barbell', isCompound: true, defaultRestSec: 180 },
  { name: 'Schrägbankdrücken (Kurzhantel)', category: 'chest', equipment: 'dumbbell', isCompound: true, defaultRestSec: 150 },
  { name: 'Fliegende (Kurzhantel)', category: 'chest', equipment: 'dumbbell', isCompound: false, defaultRestSec: 90 },
  { name: 'Dips (Brustbetont)', category: 'chest', equipment: 'bodyweight', isCompound: true, defaultRestSec: 120 },
  { name: 'Kabel-Crossover', category: 'chest', equipment: 'cable', isCompound: false, defaultRestSec: 90 },

  // Back
  { name: 'Kreuzheben (konventionell)', category: 'back', equipment: 'barbell', isCompound: true, defaultRestSec: 210 },
  { name: 'Klimmzug (weit)', category: 'back', equipment: 'bodyweight', isCompound: true, defaultRestSec: 150 },
  { name: 'Latzug (breit)', category: 'back', equipment: 'cable', isCompound: true, defaultRestSec: 120 },
  { name: 'Rudern (Langhantel)', category: 'back', equipment: 'barbell', isCompound: true, defaultRestSec: 150 },
  { name: 'Kabelrudern (sitzend)', category: 'back', equipment: 'cable', isCompound: true, defaultRestSec: 120 },
  { name: 'T-Bar Rudern', category: 'back', equipment: 'machine', isCompound: true, defaultRestSec: 120 },

  // Legs
  { name: 'Kniebeuge (Langhantel)', category: 'legs', equipment: 'barbell', isCompound: true, defaultRestSec: 210 },
  { name: 'Frontkniebeuge', category: 'legs', equipment: 'barbell', isCompound: true, defaultRestSec: 180 },
  { name: 'Rumänisches Kreuzheben', category: 'legs', equipment: 'barbell', isCompound: true, defaultRestSec: 180 },
  { name: 'Beinpresse', category: 'legs', equipment: 'machine', isCompound: true, defaultRestSec: 150 },
  { name: 'Ausfallschritte (Kurzhantel)', category: 'legs', equipment: 'dumbbell', isCompound: true, defaultRestSec: 120 },
  { name: 'Beinbeuger (Maschine)', category: 'legs', equipment: 'machine', isCompound: false, defaultRestSec: 90 },
  { name: 'Wadenheben (stehend)', category: 'legs', equipment: 'machine', isCompound: false, defaultRestSec: 90 },

  // Shoulders
  { name: 'Schulterdrücken (Langhantel)', category: 'shoulders', equipment: 'barbell', isCompound: true, defaultRestSec: 150 },
  { name: 'Schulterdrücken (Kurzhantel)', category: 'shoulders', equipment: 'dumbbell', isCompound: true, defaultRestSec: 120 },
  { name: 'Seitheben (Kurzhantel)', category: 'shoulders', equipment: 'dumbbell', isCompound: false, defaultRestSec: 60 },
  { name: 'Reverse Flys', category: 'shoulders', equipment: 'dumbbell', isCompound: false, defaultRestSec: 60 },
  { name: 'Face Pulls', category: 'shoulders', equipment: 'cable', isCompound: false, defaultRestSec: 60 },

  // Arms
  { name: 'Bizepscurls (Langhantel)', category: 'arms', equipment: 'barbell', isCompound: false, defaultRestSec: 90 },
  { name: 'Hammer-Curls (Kurzhantel)', category: 'arms', equipment: 'dumbbell', isCompound: false, defaultRestSec: 90 },
  { name: 'Trizepsdrücken am Kabel', category: 'arms', equipment: 'cable', isCompound: false, defaultRestSec: 90 },
  { name: 'French Press (Langhantel)', category: 'arms', equipment: 'barbell', isCompound: false, defaultRestSec: 90 },

  // Core
  { name: 'Plank', category: 'core', equipment: 'bodyweight', isCompound: false, defaultRestSec: 60 },
  { name: 'Hängendes Beinheben', category: 'core', equipment: 'bodyweight', isCompound: false, defaultRestSec: 60 },
  { name: 'Ab-Wheel Rollout', category: 'core', equipment: 'bodyweight', isCompound: false, defaultRestSec: 60 },
];

const SEED_MARKER_KEY = 'fittracker-seeded-v1';

export async function seedIfEmpty(): Promise<number> {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(SEED_MARKER_KEY)) {
    return 0;
  }

  const existingGlobal = await db.exercises
    .where('userId')
    .equals('') // Dexie cannot index null directly; we probe below instead
    .count();

  if (existingGlobal > 0) {
    localStorage?.setItem(SEED_MARKER_KEY, '1');
    return 0;
  }

  const anyExisting = await db.exercises.count();
  if (anyExisting > 0) {
    localStorage?.setItem(SEED_MARKER_KEY, '1');
    return 0;
  }

  const now = Date.now();
  const rows: Exercise[] = SEED_EXERCISES.map((e) => ({
    id: newId(),
    userId: null,
    name: e.name,
    category: e.category,
    equipment: e.equipment,
    isCompound: e.isCompound,
    defaultRestSec: e.defaultRestSec,
    notes: null,
    createdAt: now,
  }));

  await db.exercises.bulkAdd(rows);
  localStorage?.setItem(SEED_MARKER_KEY, '1');
  return rows.length;
}
