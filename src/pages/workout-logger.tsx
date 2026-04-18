import { useMemo, useState } from 'react';
import { Dumbbell, History, Play, Square, Trash2 } from 'lucide-react';

import { ElapsedTimer } from '@/components/elapsed-timer';
import { SetInput, type SetInputValue } from '@/components/set-input';
import { useExercises } from '@/hooks/use-exercises';
import {
  useAddSet,
  useCurrentWorkout,
  useDeleteSet,
  useFinishWorkout,
  useLastSetsForExercise,
  useStartWorkout,
  useWorkoutSets,
} from '@/hooks/use-workouts';
import type { Exercise, ExerciseCategory, WorkoutSet } from '@/db/schema';
import { cn, formatDateCH, formatTimeCH } from '@/lib/utils';

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Brust',
  back: 'Rücken',
  legs: 'Beine',
  shoulders: 'Schulter',
  arms: 'Arme',
  core: 'Core',
  'full-body': 'Ganzkörper',
};

export function WorkoutLoggerPage() {
  const current = useCurrentWorkout();
  const startWorkout = useStartWorkout();

  if (current.isLoading) {
    return <p className="text-sm text-muted-foreground">Wird geladen …</p>;
  }

  if (!current.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Kein aktives Workout. Starte eine freie Session oder wähle später einen Plan.
          </p>
          <button
            type="button"
            onClick={() => startWorkout.mutate({})}
            disabled={startWorkout.isPending}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {startWorkout.isPending ? 'Starte …' : 'Freies Workout starten'}
          </button>
        </div>
      </div>
    );
  }

  return <ActiveWorkout workoutId={current.data.id} startedAt={current.data.startedAt} />;
}

interface ActiveWorkoutProps {
  workoutId: string;
  startedAt: number;
}

function ActiveWorkout({ workoutId, startedAt }: ActiveWorkoutProps) {
  const exercises = useExercises();
  const sets = useWorkoutSets(workoutId);
  const addSet = useAddSet();
  const deleteSet = useDeleteSet();
  const finish = useFinishWorkout();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const selectedExercise = useMemo(
    () => exercises.data?.find((e) => e.id === selectedExerciseId),
    [exercises.data, selectedExerciseId],
  );

  const setsForExercise = useMemo(
    () => (sets.data ?? []).filter((s) => s.exerciseId === selectedExerciseId),
    [sets.data, selectedExerciseId],
  );

  const nextSetIndex = setsForExercise.length + 1;

  const exercisesById = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const e of exercises.data ?? []) map.set(e.id, e);
    return map;
  }, [exercises.data]);

  const otherExercises = useMemo(() => {
    const uniq = new Map<string, WorkoutSet>();
    for (const s of sets.data ?? []) {
      if (s.exerciseId !== selectedExerciseId && !uniq.has(s.exerciseId)) {
        uniq.set(s.exerciseId, s);
      }
    }
    return Array.from(uniq.keys());
  }, [sets.data, selectedExerciseId]);

  function handleAddSet(v: SetInputValue) {
    if (!selectedExerciseId) return;
    addSet.mutate({
      workoutId,
      exerciseId: selectedExerciseId,
      setIndex: nextSetIndex,
      weightKg: v.weightKg,
      reps: v.reps,
      rpe: v.rpe,
      isWarmup: v.isWarmup,
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Aktives Workout</h1>
          <p className="text-xs text-muted-foreground">
            {formatDateCH(new Date(startedAt))} · Start {formatTimeCH(new Date(startedAt))}
          </p>
        </div>
        <ElapsedTimer
          startedAt={startedAt}
          className="font-mono text-lg tabular-nums text-primary"
        />
      </header>

      <ExerciseSelect
        exercises={exercises.data ?? []}
        value={selectedExerciseId}
        onChange={setSelectedExerciseId}
      />

      {selectedExercise && (
        <>
          <ExerciseHistory exerciseId={selectedExercise.id} />

          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sätze heute ({setsForExercise.length})
            </h2>
            {setsForExercise.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch kein Satz geloggt.</p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {setsForExercise.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span className="font-mono tabular-nums">
                      <span className="text-muted-foreground">#{s.setIndex}</span>
                      <span className="ml-3">{s.weightKg} kg</span>
                      <span className="ml-3">{s.reps} Wdh</span>
                      {s.rpe != null && (
                        <span className="ml-3 text-muted-foreground">RPE {s.rpe}</span>
                      )}
                      {s.isWarmup && (
                        <span className="ml-3 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                          warmup
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteSet.mutate({ id: s.id, workoutId })}
                      aria-label="Satz löschen"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <SetInput
              defaultValue={lastSetDefaults(setsForExercise)}
              onSubmit={handleAddSet}
              disabled={addSet.isPending}
            />
          </section>
        </>
      )}

      {otherExercises.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Auch heute trainiert
          </h2>
          <ul className="flex flex-wrap gap-2">
            {otherExercises.map((id) => {
              const ex = exercisesById.get(id);
              if (!ex) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setSelectedExerciseId(id)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:bg-accent"
                  >
                    {ex.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={() => finish.mutate(workoutId)}
        disabled={finish.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card py-3 text-sm font-medium hover:border-destructive hover:text-destructive disabled:opacity-50"
      >
        <Square className="h-4 w-4" />
        Workout beenden
      </button>
    </div>
  );
}

function lastSetDefaults(sets: WorkoutSet[]): Partial<SetInputValue> {
  const last = sets[sets.length - 1];
  if (!last) return {};
  return { weightKg: last.weightKg, reps: last.reps, rpe: last.rpe };
}

interface ExerciseSelectProps {
  exercises: Exercise[];
  value: string;
  onChange: (id: string) => void;
}

function ExerciseSelect({ exercises, value, onChange }: ExerciseSelectProps) {
  const byCategory = useMemo(() => {
    const map = new Map<ExerciseCategory, Exercise[]>();
    for (const e of exercises) {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return map;
  }, [exercises]);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">Übung</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-12 w-full rounded-md border border-border bg-card px-3 text-base',
          'outline-none focus:border-primary',
        )}
      >
        <option value="">– wählen –</option>
        {Array.from(byCategory.entries()).map(([cat, items]) => (
          <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
            {items.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function ExerciseHistory({ exerciseId }: { exerciseId: string }) {
  const last = useLastSetsForExercise(exerciseId, 5);
  if (!last.data || last.data.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        Letzte Sätze (alle Workouts)
      </h2>
      <ul className="flex flex-wrap gap-2">
        {last.data.map((s) => (
          <li
            key={s.id}
            className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] tabular-nums"
          >
            {s.weightKg}×{s.reps}
            {s.rpe != null && <span className="ml-1 text-muted-foreground">@{s.rpe}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
