import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { useAddMeasurement, useBodyMeasurements, useDeleteMeasurement } from '@/hooks/use-body';
import type { BodyMeasurement, MeasurementMetric } from '@/db/schema';
import { cn, formatDateCH } from '@/lib/utils';

interface MetricConfig {
  label: string;
  unit: string;
  step: string;
  placeholder: string;
}

const METRICS: Record<MeasurementMetric, MetricConfig> = {
  weight_kg:    { label: 'Gewicht',     unit: 'kg',  step: '0.1', placeholder: '80,0' },
  body_fat_pct: { label: 'Körperfett',  unit: '%',   step: '0.1', placeholder: '15,0' },
  hrv_ms:       { label: 'HRV',         unit: 'ms',  step: '1',   placeholder: '55' },
  steps:        { label: 'Schritte',    unit: '',    step: '100', placeholder: '8000' },
  resting_hr:   { label: 'Ruhe-HF',     unit: 'bpm', step: '1',   placeholder: '55' },
  sleep_min:    { label: 'Schlaf',       unit: 'min', step: '5',   placeholder: '480' },
};

const VISIBLE_METRICS: MeasurementMetric[] = [
  'weight_kg',
  'body_fat_pct',
  'hrv_ms',
  'steps',
];

export function BodyPage() {
  const [activeMetric, setActiveMetric] = useState<MeasurementMetric>('weight_kg');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Körperwerte</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {VISIBLE_METRICS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMetric(m)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              activeMetric === m
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {METRICS[m].label}
          </button>
        ))}
      </div>

      <MetricSection metric={activeMetric} config={METRICS[activeMetric]} />
    </div>
  );
}

function MetricSection({
  metric,
  config,
}: {
  metric: MeasurementMetric;
  config: MetricConfig;
}) {
  const measurements = useBodyMeasurements(metric, 30);

  return (
    <div className="space-y-4">
      <AddMeasurementForm metric={metric} config={config} />

      {measurements.isLoading ? (
        <p className="text-sm text-muted-foreground">Wird geladen …</p>
      ) : (measurements.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">
          Noch keine Einträge für {config.label}.
        </p>
      ) : (
        <MeasurementList measurements={measurements.data!} unit={config.unit} />
      )}
    </div>
  );
}

function AddMeasurementForm({
  metric,
  config,
}: {
  metric: MeasurementMetric;
  config: MetricConfig;
}) {
  const add = useAddMeasurement();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;
    const measuredAt = date ? new Date(date).getTime() : Date.now();
    add.mutate(
      { metric, value: num, measuredAt },
      {
        onSuccess: () => {
          setValue('');
          setDate(todayISO());
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-lg border border-border bg-card p-3"
    >
      <label className="flex-1">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {config.label} {config.unit && `(${config.unit})`}
        </span>
        <input
          type="number"
          inputMode="decimal"
          step={config.step}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={config.placeholder}
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          required
        />
      </label>
      <label className="w-36">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Datum
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <button
        type="submit"
        disabled={!value || add.isPending}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        aria-label="Eintrag hinzufügen"
      >
        <Plus className="h-4 w-4" />
      </button>
    </form>
  );
}

function MeasurementList({
  measurements,
  unit,
}: {
  measurements: BodyMeasurement[];
  unit: string;
}) {
  const del = useDeleteMeasurement();
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {measurements.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between px-4 py-2.5 text-sm"
        >
          <span className="text-muted-foreground">
            {formatDateCH(new Date(m.measuredAt))}
          </span>
          <span className="flex items-center gap-3">
            <span className="font-mono tabular-nums">
              {formatValue(m.value, unit)}
            </span>
            {m.source !== 'manual' && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {m.source}
              </span>
            )}
            <button
              type="button"
              onClick={() => del.mutate(m.id)}
              aria-label="Löschen"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function formatValue(value: number, unit: string): string {
  const num = value.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return unit ? `${num} ${unit}` : num;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
