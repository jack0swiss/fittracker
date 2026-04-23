import { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SetInputValue {
  weightKg: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
}

interface SetInputProps {
  defaultValue?: Partial<SetInputValue>;
  onSubmit: (value: SetInputValue) => void;
  disabled?: boolean;
}

export function SetInput({ defaultValue, onSubmit, disabled }: SetInputProps) {
  const [weight, setWeight] = useState<string>(
    defaultValue?.weightKg != null ? String(defaultValue.weightKg) : '',
  );
  const [reps, setReps] = useState<string>(
    defaultValue?.reps != null ? String(defaultValue.reps) : '',
  );
  const [rpe, setRpe] = useState<string>(
    defaultValue?.rpe != null ? String(defaultValue.rpe) : '',
  );
  const [warmup, setWarmup] = useState<boolean>(defaultValue?.isWarmup ?? false);

  const canSubmit =
    weight.trim() !== '' &&
    reps.trim() !== '' &&
    Number(weight.replace(',', '.')) >= 0 &&
    Number(reps) > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      weightKg: Number(weight.replace(',', '.')),
      reps: Number(reps),
      rpe: rpe.trim() === '' ? null : Number(rpe.replace(',', '.')),
      isWarmup: warmup,
    });
    setWeight('');
    setReps('');
    setRpe('');
    setWarmup(false);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-3 gap-2">
        <NumericField
          label="kg"
          value={weight}
          onChange={setWeight}
          step="2.5"
          inputMode="decimal"
        />
        <NumericField label="Wdh" value={reps} onChange={setReps} inputMode="numeric" />
        <NumericField
          label="RPE"
          value={rpe}
          onChange={setRpe}
          min="1"
          max="10"
          step="0.5"
          inputMode="decimal"
          hint="1–10"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={warmup}
            onChange={(e) => setWarmup(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Aufwärmsatz
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium',
            'bg-primary text-primary-foreground shadow-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Check className="h-4 w-4" />
          Satz
        </button>
      </div>
    </div>
  );
}

interface NumericFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
  max?: string;
  inputMode?: 'numeric' | 'decimal';
  hint?: string;
}

function NumericField({
  label,
  value,
  onChange,
  step,
  min,
  max,
  inputMode,
  hint,
}: NumericFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-md border border-border bg-background px-3 text-base font-medium outline-none focus:border-primary"
      />
      {hint && <span className="mt-0.5 block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
