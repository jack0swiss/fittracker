import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';

import { Modal } from '@/components/modal';
import type { Exercise, PlanDay, PlanExercise } from '@/db/schema';
import { useExercises } from '@/hooks/use-exercises';
import {
  useAddPlanDay,
  useAddPlanExercise,
  usePlan,
  usePlanDayExercises,
  usePlanDays,
} from '@/hooks/use-plans';

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const plan = usePlan(id);
  const days = usePlanDays(id);
  const addDay = useAddPlanDay();

  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [dayName, setDayName] = useState('');

  function handleAddDay(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !dayName.trim()) return;
    addDay.mutate(
      {
        planId: id,
        dayIndex: days.data?.length ?? 0,
        name: dayName.trim(),
      },
      {
        onSuccess: () => {
          setDayName('');
          setDayDialogOpen(false);
        },
      },
    );
  }

  if (plan.isLoading) {
    return <p className="text-sm text-muted-foreground">Wird geladen …</p>;
  }
  if (!plan.data) {
    return (
      <div className="space-y-4">
        <Link to="/plans" className="text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="inline h-4 w-4" /> Pläne
        </Link>
        <p className="text-sm">Plan nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Pläne
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{plan.data.name}</h1>
        {plan.data.description && (
          <p className="mt-1 text-sm text-muted-foreground">{plan.data.description}</p>
        )}
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Tage</h2>
          <button
            type="button"
            onClick={() => setDayDialogOpen(true)}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-xs hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" />
            Tag
          </button>
        </div>

        {(days.data?.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Keine Tage. Lege einen Tag wie „Push" oder „Pull" an.
          </div>
        ) : (
          <ul className="space-y-3">
            {days.data!.map((day) => (
              <DayCard key={day.id} day={day} />
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={dayDialogOpen}
        onClose={() => setDayDialogOpen(false)}
        title="Neuer Tag"
      >
        <form onSubmit={handleAddDay} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Name
            </span>
            <input
              autoFocus
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder="z. B. Push A"
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDayDialogOpen(false)}
              className="h-11 rounded-md px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!dayName.trim() || addDay.isPending}
              className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Anlegen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DayCard({ day }: { day: PlanDay }) {
  const items = usePlanDayExercises(day.id);
  const exercises = useExercises();
  const addExercise = useAddPlanExercise();

  const [open, setOpen] = useState(false);

  const byId = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const e of exercises.data ?? []) map.set(e.id, e);
    return map;
  }, [exercises.data]);

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{day.name}</h3>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Übung
        </button>
      </div>

      {(items.data?.length ?? 0) === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Noch keine Übungen.</p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-sm">
          {items.data!.map((pe) => (
            <PlanExerciseRow key={pe.id} item={pe} exercise={byId.get(pe.exerciseId)} />
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Übung hinzufügen">
        <AddExerciseForm
          exercises={exercises.data ?? []}
          submitting={addExercise.isPending}
          onCancel={() => setOpen(false)}
          onSubmit={(payload) =>
            addExercise.mutate(
              {
                planDayId: day.id,
                orderIndex: items.data?.length ?? 0,
                ...payload,
              },
              { onSuccess: () => setOpen(false) },
            )
          }
        />
      </Modal>
    </li>
  );
}

function PlanExerciseRow({
  item,
  exercise,
}: {
  item: PlanExercise;
  exercise: Exercise | undefined;
}) {
  return (
    <li className="flex items-center justify-between">
      <span>{exercise?.name ?? '—'}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {item.targetSets}×{item.targetReps}
        {item.targetRpe != null && ` @${item.targetRpe}`}
      </span>
    </li>
  );
}

interface AddExerciseFormProps {
  exercises: Exercise[];
  onSubmit: (payload: {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    targetRpe: number | null;
  }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function AddExerciseForm({ exercises, onSubmit, onCancel, submitting }: AddExerciseFormProps) {
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8');
  const [rpe, setRpe] = useState('');

  const canSubmit =
    exerciseId !== '' && Number(sets) > 0 && Number(reps) > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          exerciseId,
          targetSets: Number(sets),
          targetReps: Number(reps),
          targetRpe: rpe.trim() === '' ? null : Number(rpe.replace(',', '.')),
        });
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Übung</span>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">– wählen –</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-2">
        <NumField label="Sätze" value={sets} onChange={setSets} />
        <NumField label="Wdh" value={reps} onChange={setReps} />
        <NumField label="RPE" value={rpe} onChange={setRpe} step="0.5" />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-md px-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Hinzufügen
        </button>
      </div>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? '1'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
