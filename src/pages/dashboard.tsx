import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatDateCH, formatKg } from '@/lib/utils';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hoi Jack</h1>
          <p className="text-sm text-muted-foreground">{formatDateCH(new Date())}</p>
        </div>
      </header>

      <section aria-labelledby="today-heading" className="space-y-3">
        <h2 id="today-heading" className="text-sm font-medium text-muted-foreground">
          Heute trainieren
        </h2>
        <Link
          to="/workout"
          className="block rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Push – Tag A</div>
              <div className="text-sm text-muted-foreground">6 Übungen · ~52 min</div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </Link>
      </section>

      <section aria-labelledby="week-heading" className="space-y-3">
        <h2 id="week-heading" className="text-sm font-medium text-muted-foreground">
          Diese Woche
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm">Workouts</span>
            <span className="text-sm font-medium">3 / 4</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/4 bg-primary" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm">Gesamtvolumen</span>
            <span className="text-sm font-medium">
              {formatKg(12340, 0)}{' '}
              <span className="text-primary">+8 %</span>
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="vitals-heading" className="space-y-3">
        <h2 id="vitals-heading" className="text-sm font-medium text-muted-foreground">
          Vitalwerte (heute)
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <VitalTile label="Gewicht" value="74.2" unit="kg" delta={-0.3} />
          <VitalTile label="HRV" value="58" unit="ms" delta={0} />
          <VitalTile label="Schritte" value="8 421" unit="" delta={1} />
        </div>
        <p className="text-xs text-muted-foreground">
          Mock-Daten · echte Werte ab Phase 2 via Withings / Health Connect.
        </p>
      </section>

      <section aria-labelledby="last-heading" className="space-y-3">
        <h2 id="last-heading" className="text-sm font-medium text-muted-foreground">
          Letztes Workout
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="font-medium">Pull – Tag B</div>
          <div className="text-sm text-muted-foreground">Di, 15.04.2026</div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-primary">8 Sätze PR</span> ·
            <span className="ml-1">+5 kg Kreuzheben</span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface VitalTileProps {
  label: string;
  value: string;
  unit: string;
  delta: number;
}

function VitalTile({ label, value, unit, delta }: VitalTileProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-semibold">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        {delta < 0 && <TrendingDown className="h-3 w-3 text-primary" />}
        {delta > 0 && <TrendingUp className="h-3 w-3 text-primary" />}
        {delta === 0 && <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
