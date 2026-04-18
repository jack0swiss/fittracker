import { useMemo, useState } from 'react';
import { Dumbbell, History, Play, Sparkles, Square, Trash2 } from 'lucide-react';

import { ElapsedTimer } from '@/components/elapsed-timer';
import { RestTimer } from '@/components/rest-timer';
import { SetInput, type SetInputValue } from '@/components/set-input';
import { useExercises } from '@/hooks/use-exercises';
import { usePlan, usePlanDay, usePlanDayExercises } from '@/hooks/use-plans';
import {
  useAddSet,
  useCurrentWorkout,
  useDeleteSet,
  useFinishWorkout,
  useLastSetsForExercise,
  useStartWorkout,
  useWorkoutSets,
} from '@/hooks/use-workouts';
import type {
  Exercise,
  ExerciseCategory,
  PlanExercise,
  Workout,
  WorkoutSet,
} from '@/db/schema';
import { bestE1rm, e1rm } from '@/lib/e1rm';
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
            Kein aktives Workout. Starte eine freie Session oder wähle einen Plan-Tag.
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

  return <ActiveWorkout workout={current.data} />;
}

function ActiveWorkout({ workout }: { workout: Workout }) {
  const exercises = useExercises();
  const sets = useWorkoutSets(workout.id);
  const addSet = useAddSet();
  const deleteSet = useDeleteSet();
  const finish = useFinishWorkout();

  const planDayExercises = usePlanDayExercises(workout.planDayId ?? undefined);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [restKey, setRestKey] = useState<number | undefined>(undefined);

  const exercisesById = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const e of exercises.data ?? []) map.set(e.id, e);
    return map;
  }, [exercises.data]);

  const selectedExercise = exercisesById.get(selectedExerciseId);

  const planTargetFor = useMemo(() => {
    const map = new Map<string, PlanExercise>();
    for (const pe of planDayExercises.data ?? []) map.set(pe.exerciseId, pe);
    return map;
  }, [planDayExercises.data]);

  const selectedTarget = selectedExerciseId ? planTargetFor.get(selectedExerciseId) : undefined;

  const setsForExercise = useMemo(
    () => (sets.data ?? []).filter((s) => s.exerciseId === selectedExerciseId),
    [sets.data, selectedExerciseId],
  );
  const nextSetIndex = setsForExercise.length + 1;

  const loggedExerciseIds = useMemo(() => {
    const s = new Set<string>();
    for (const x of sets.data ?? []) s.add(x.exerciseId);
    return s;
  }, [sets.data]);

  const restSec = selectedExercise?.defaultRestSec ?? 120;

  function handleAddSet(v: SetInputValue) {
    if (!selectedExerciseId) return;
    addSet.mutate(
      {
        workoutId: workout.id,
        exerciseId: selectedExerciseId,
        setIndex: nextSetIndex,
        weightKg: v.weightKg,
        reps: v.reps,
        rpe: v.rpe,
        isWarmup: v.isWarmup,
      },
      {
        onSuccess: () => {
          if (!v.isWarmup) setRestKey(Date.now());
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {workout.planDayId ? (
              <PlanHeader planDayId={workout.planDayId} />
            ) : (
              'Aktives Workout'
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            {formatDateCH(new Date(workout.startedAt))} · Start{' '}
            {formatTimeCH(new Date(workout.startedAt))}
          </p>
        </div>
        <ElapsedTimer
          startedAt={workout.startedAt}
          className="font-mono text-lg tabular-nums text-primary"
        />
      </header>

      {workout.planDayId && (
        <PlanTargets
          planExercises={planDayExercises.data ?? []}
          exercisesById={exercisesById}
          loggedExerciseIds={loggedExerciseIds}
          selectedId={selectedExerciseId}
          onSelect={setSelectedExerciseId}
        />
      )}

      <ExerciseSelect
        exercises={exercises.data ?? []}
        value={selectedExerciseId}
        onChange={setSelectedExerciseId}
      />

      {selectedExercise && (
        <>
          {selectedTarget && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
              Ziel: {selectedTarget.targetSets}×{selectedTarget.targetReps}
              {selectedTarget.targetRpe != null && ` @ RPE ${selectedTarget.targetRpe}`}
            </div>
          )}

          <ExerciseHistory exerciseId={selectedExercise.id} />

          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sätze heute ({setsForExercise.length})
            </h2>
            {setsForExercise.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch kein Satz geloggt.</p>
            ) : (
              <SetsList
                sets={setsForExercise}
                exerciseId={selectedExercise.id}
                onDelete={(id) => deleteSet.mutate({ id, workoutId: workout.id })}
              />
            )}

            <SetInput
              defaultValue={lastSetDefaults(setsForExercise)}
              onSubmit={handleAddSet}
              disabled={addSet.isPending}
            />

            <RestTimer seconds={restSec} autoStartKey={restKey} />
          </section>
        </>
      )}

      <button
        type="button"
        onClick={() => finish.mutate(workout.id)}
        disabled={finish.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card py-3 text-sm font-medium hover:border-destructive hover:text-destructive disabled:opacity-50"
      >
        <Square className="h-4 w-4" />
        Workout beenden
      </button>
    </div>
  );
}

function PlanHeader({ planDayId }: { planDayId: string }) {
  const day = usePlanDay(planDayId);
  const plan = usePlan(day.data?.planId);
  if (!day.data) return <>Plan-Workout</>;
  const prefix = plan.data?.name ? `${plan.data.name} · ` : '';
  return <>{`${prefix}${day.data.name}`}</>;
}

function PlanTargets({
  planExercises,
  exercisesById,
  loggedExerciseIds,
  selectedId,
  onSelect,
}: {
  planExercises: PlanExercise[];
  exercisesById: Map<string, Exercise>;
  loggedExerciseIds: Set<string>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (planExercises.length === 0) return null;
  const done = planExercises.filter((p) => loggedExerciseIds.has(p.exerciseId)).length;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Plan
        </h2>
        <span className="text-xs text-muted-foreground">
          {done} / {planExercises.length}
        </span>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {planExercises.map((pe) => {
          const ex = exercisesById.get(pe.exerciseId);
          const isDone = loggedExerciseIds.has(pe.exerciseId);
          const isSelected = selectedId === pe.exerciseId;
          return (
            <li key={pe.id}>
              <button
                type="button"
                onClick={() => onSelect(pe.exerciseId)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm',
                  isSelected ? 'bg-accent' : 'hover:bg-accent',
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      isDone ? 'bg-primary' : 'bg-muted-foreground/40',
                    )}
                  />
                  <span className={cn(!ex && 'text-muted-foreground')}>
                    {ex?.name ?? '—'}
                  </span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {pe.targetSets}×{pe.targetReps}
                  {pe.targetRpe != null && ` @${pe.targetRpe}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SetsList({
  sets,
  exerciseId,
  onDelete,
}: {
  sets: WorkoutSet[];
  exerciseId: string;
  onDelete: (id: string) => void;
}) {
  const history = useLastSetsForExercise(exerciseId, 500);
  const historicalBest = useMemo(
    () => bestE1rm((history.data ?? []).filter((h) => !sets.find((s) => s.id === h.id))),
    [history.data, sets],
  );

  let runningBest = historicalBest;

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {sets.map((s) => {
        const current = s.isWarmup ? 0 : e1rm(s.weightKg, s.reps);
        const isPr = !s.isWarmup && current > runningBest + 0.0001;
        if (isPr) runningBest = current;
        return (
          <li
            key={s.id}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-muted-foreground">#{s.setIndex}</span>
              <span>{s.weightKg} kg</span>
              <span>{s.reps} Wdh</span>
              {s.rpe != null && (
                <span className="text-muted-foreground">RPE {s.rpe}</span>
              )}
              {s.isWarmup && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  warmup
                </span>
              )}
              {isPr && (
                <span className="inline-flex items-center gap-0.5 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
                  <Sparkles className="h-3 w-3" />
                  PR
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onDelete(s.id)}
              aria-label="Satz löschen"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function lastSetDefaults(sets: WorkoutSet[]): Partial<SetInputValue> {
  const last = sets[sets.length - 1];
  if (!last) return {};
  return { weightKg: last.weightKg, reps: last.reps, rpe: last.rpe };
}

function ExerciseSelect({
  exercises,
  value,
  onChange,
}: {
  exercises: Exercise[];
  value: string;
  onChange: (id: string) => void;
}) {
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
