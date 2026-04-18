import { useMemo, useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useExercises } from '@/hooks/use-exercises';
import { useLastSetsForExercise } from '@/hooks/use-workouts';
import type { Exercise, ExerciseCategory } from '@/db/schema';
import { sessionsForExercise, shouldDeload, type SessionPoint } from '@/lib/e1rm';
import { cn, formatDateCH } from '@/lib/utils';

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Brust',
  back: 'Rücken',
  legs: 'Beine',
  shoulders: 'Schulter',
  arms: 'Arme',
  core: 'Core',
  'full-body': 'Ganzkörper',
};

export function ProgressPage() {
  const exercises = useExercises();
  const [selectedId, setSelectedId] = useState('');

  const exercise = (exercises.data ?? []).find((e) => e.id === selectedId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Fortschritt</h1>

      <ExercisePicker
        exercises={exercises.data ?? []}
        value={selectedId}
        onChange={setSelectedId}
      />

      {exercise && <ExerciseProgress exercise={exercise} />}

      {!exercise && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-40" />
          Übung wählen, um den e1RM-Verlauf zu sehen.
        </div>
      )}
    </div>
  );
}

function ExercisePicker({
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

function ExerciseProgress({ exercise }: { exercise: Exercise }) {
  const allSets = useLastSetsForExercise(exercise.id, 2000);
  const sessions = useMemo(
    () => sessionsForExercise(allSets.data ?? []),
    [allSets.data],
  );
  const deload = useMemo(() => shouldDeload(sessions), [sessions]);

  if (allSets.isLoading) {
    return <p className="text-sm text-muted-foreground">Wird geladen …</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Sätze für diese Übung geloggt.
      </p>
    );
  }

  const currentBest = sessions[sessions.length - 1].bestE1rm;
  const allTimePr = Math.max(...sessions.map((s) => s.bestE1rm));

  return (
    <div className="space-y-4">
      {deload && <DeloadAlert />}

      <SummaryCards current={currentBest} pr={allTimePr} sessions={sessions.length} />

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          e1RM-Verlauf (kg)
        </h2>
        <E1rmChart sessions={sessions} />
      </div>

      <SessionHistory sessions={sessions.slice().reverse().slice(0, 10)} />
    </div>
  );
}

function DeloadAlert() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">Deload empfohlen</p>
        <p className="mt-0.5 text-xs opacity-80">
          Letzte 3 Sessions ohne Progression bei RPE ≥ 9. Erwäge eine Deload-Woche.
        </p>
      </div>
    </div>
  );
}

function SummaryCards({
  current,
  pr,
  sessions,
}: {
  current: number;
  pr: number;
  sessions: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Aktuell" value={`${current.toFixed(1)} kg`} />
      <StatCard label="PR" value={`${pr.toFixed(1)} kg`} highlight />
      <StatCard label="Sessions" value={String(sessions)} />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-mono text-base font-semibold tabular-nums',
          highlight && 'text-primary',
        )}
      >
        {value}
      </p>
    </div>
  );
}

interface ChartDatum {
  date: number;
  e1rm: number;
  isPr: boolean;
}

function E1rmChart({ sessions }: { sessions: SessionPoint[] }) {
  const data: ChartDatum[] = sessions.map((s) => ({
    date: s.date,
    e1rm: parseFloat(s.bestE1rm.toFixed(2)),
    isPr: s.isPr,
  }));

  const prPoints = data.filter((d) => d.isPr);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={(v: number) => formatDateCH(new Date(v)).slice(0, 5)}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v: number) => `${v}`}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: 'hsl(var(--border))' }}
        />
        <Line
          type="monotone"
          dataKey="e1rm"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        {prPoints.map((p) => (
          <ReferenceDot
            key={p.date}
            x={p.date}
            y={p.e1rm}
            r={5}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <p className="text-muted-foreground">{formatDateCH(new Date(d.date))}</p>
      <p className="font-mono font-medium">
        {d.e1rm} kg
        {d.isPr && <span className="ml-1.5 text-primary">PR</span>}
      </p>
    </div>
  );
}

function SessionHistory({ sessions }: { sessions: SessionPoint[] }) {
  if (sessions.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Letzte Sessions
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {sessions.map((s) => (
          <li
            key={s.workoutId}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="text-muted-foreground">{formatDateCH(new Date(s.date))}</span>
            <span className="flex items-center gap-2 font-mono tabular-nums">
              {s.bestE1rm.toFixed(1)} kg
              {s.maxRpe != null && (
                <span className="text-xs text-muted-foreground">RPE {s.maxRpe}</span>
              )}
              {s.isPr && (
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  PR
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
