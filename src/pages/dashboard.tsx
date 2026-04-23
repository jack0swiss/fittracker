import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Play } from 'lucide-react';

import {
  useCurrentWorkout,
  useLastCompletedWorkout,
  useWeekStats,
  useWorkoutSets,
} from '@/hooks/use-workouts';
import { usePlanDay } from '@/hooks/use-plans';
import { useLatestMeasurement } from '@/hooks/use-body';
import { formatDateCH, formatKg } from '@/lib/utils';

const WEEK_TARGET = 4;

export function DashboardPage() {
  const now = new Date();
  const { start, end } = currentWeekRange(now);
  const week = useWeekStats(start, end);
  const current = useCurrentWorkout();
  const last = useLastCompletedWorkout();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Hoi Jack</h1>
        <p className="text-sm text-muted-foreground">{formatDateCH(now)}</p>
      </header>

      <TodaySection />

      <section aria-labelledby="week-heading" className="space-y-3">
        <h2 id="week-heading" className="text-sm font-medium text-muted-foreground">
          Diese Woche
        </h2>
        <WeekCard
          workouts={week.data?.workouts ?? 0}
          volumeKg={week.data?.volumeKg ?? 0}
          hasActive={!!current.data}
        />
      </section>

      <section aria-labelledby="vitals-heading" className="space-y-3">
        <h2 id="vitals-heading" className="text-sm font-medium text-muted-foreground">
          Neueste Werte
        </h2>
        <VitalsGrid />
      </section>

      <section aria-labelledby="last-heading" className="space-y-3">
        <h2 id="last-heading" className="text-sm font-medium text-muted-foreground">
          Letztes Workout
        </h2>
        {last.data ? (
          <LastWorkoutCard workoutId={last.data.id} startedAt={last.data.startedAt} />
        ) : (
          <EmptyCard text="Noch kein Workout abgeschlossen." />
        )}
      </section>
    </div>
  );
}

function TodaySection() {
  const current = useCurrentWorkout();

  if (current.data) {
    return (
      <section aria-labelledby="today-heading" className="space-y-3">
        <h2 id="today-heading" className="text-sm font-medium text-muted-foreground">
          Aktives Workout
        </h2>
        <Link
          to="/workout"
          className="block rounded-lg border border-primary/40 bg-primary/5 p-5 transition hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              {current.data.planDayId ? (
                <ActivePlanLabel planDayId={current.data.planDayId} />
              ) : (
                <div className="text-lg font-semibold">Freies Workout</div>
              )}
              <div className="text-sm text-muted-foreground">
                Gestartet {formatDateCH(new Date(current.data.startedAt))}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="today-heading" className="space-y-3">
      <h2 id="today-heading" className="text-sm font-medium text-muted-foreground">
        Heute trainieren
      </h2>
      <Link
        to="/plans"
        className="block rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:border-primary"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Workout starten</div>
            <div className="text-sm text-muted-foreground">
              Plan-Tag wählen oder freies Workout loggen
            </div>
          </div>
          <Play className="h-5 w-5 text-primary" />
        </div>
      </Link>
    </section>
  );
}

function ActivePlanLabel({ planDayId }: { planDayId: string }) {
  const day = usePlanDay(planDayId);
  return <div className="text-lg font-semibold">{day.data?.name ?? 'Plan-Workout'}</div>;
}

function WeekCard({
  workouts,
  volumeKg,
  hasActive,
}: {
  workouts: number;
  volumeKg: number;
  hasActive: boolean;
}) {
  const target = WEEK_TARGET;
  const pct = Math.min(100, Math.round((workouts / target) * 100));
  const displayCount = hasActive ? workouts + 1 : workouts;
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm">Workouts</span>
        <span className="text-sm font-medium">
          {displayCount} / {target}
          {hasActive && (
            <span className="ml-1 text-xs text-muted-foreground">(inkl. aktiv)</span>
          )}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm">Gesamtvolumen</span>
        <span className="text-sm font-medium">
          {volumeKg > 0 ? formatKg(volumeKg, 0) : '—'}
        </span>
      </div>
    </div>
  );
}

function VitalsGrid() {
  const weight = useLatestMeasurement('weight_kg');
  const hrv = useLatestMeasurement('hrv_ms');
  const steps = useLatestMeasurement('steps');

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <VitalTile label="Gewicht" row={weight.data} unit="kg" />
        <VitalTile label="HRV" row={hrv.data} unit="ms" />
        <VitalTile label="Schritte" row={steps.data} unit="" />
      </div>
      <p className="text-xs text-muted-foreground">
        Manuell erfasst unter Körperwerte. Automatischer Sync ab Phase 2.
      </p>
    </>
  );
}

interface VitalRow {
  value: number;
  measuredAt: number;
}

function VitalTile({
  label,
  row,
  unit,
}: {
  label: string;
  row: VitalRow | undefined;
  unit: string;
}) {
  const formatted = row
    ? row.value.toLocaleString('de-CH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })
    : '—';
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-semibold tabular-nums">{formatted}</span>
        {unit && row && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {row ? formatDateCH(new Date(row.measuredAt)) : 'Keine Daten'}
      </div>
    </div>
  );
}

function LastWorkoutCard({
  workoutId,
  startedAt,
}: {
  workoutId: string;
  startedAt: number;
}) {
  const sets = useWorkoutSets(workoutId);
  const count = (sets.data ?? []).filter((s) => !s.isWarmup).length;
  return (
    <Link
      to="/progress"
      className="block rounded-lg border border-border bg-card p-5 transition hover:border-primary"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{formatDateCH(new Date(startedAt))}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5" />
            {count} {count === 1 ? 'Satz' : 'Sätze'}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" />
      </div>
    </Link>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

/** Monday 00:00 → next Monday 00:00, local time. */
function currentWeekRange(now: Date): { start: number; end: number } {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const dayIdx = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dayIdx);
  const start = d.getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return { start, end };
}
