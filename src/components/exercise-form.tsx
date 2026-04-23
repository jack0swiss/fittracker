import { useState } from 'react';

import type { Equipment, Exercise, ExerciseCategory } from '@/db/schema';
import type { ExerciseInput } from '@/db/repos/exercises';

const CATEGORIES: Array<{ value: ExerciseCategory; label: string }> = [
  { value: 'chest', label: 'Brust' },
  { value: 'back', label: 'Rücken' },
  { value: 'legs', label: 'Beine' },
  { value: 'shoulders', label: 'Schulter' },
  { value: 'arms', label: 'Arme' },
  { value: 'core', label: 'Core' },
  { value: 'full-body', label: 'Ganzkörper' },
];

const EQUIPMENT: Array<{ value: Equipment | ''; label: string }> = [
  { value: '', label: '—' },
  { value: 'barbell', label: 'Langhantel' },
  { value: 'dumbbell', label: 'Kurzhantel' },
  { value: 'cable', label: 'Kabel' },
  { value: 'machine', label: 'Maschine' },
  { value: 'bodyweight', label: 'Körpergewicht' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
];

interface ExerciseFormProps {
  initial?: Exercise;
  onSubmit: (input: ExerciseInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function ExerciseForm({ initial, onSubmit, onCancel, submitting }: ExerciseFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<ExerciseCategory>(initial?.category ?? 'chest');
  const [equipment, setEquipment] = useState<Equipment | ''>(initial?.equipment ?? '');
  const [isCompound, setIsCompound] = useState(initial?.isCompound ?? false);
  const [restSec, setRestSec] = useState(String(initial?.defaultRestSec ?? 120));

  const canSubmit = name.trim().length > 0 && Number(restSec) >= 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name,
          category,
          equipment: equipment === '' ? null : equipment,
          isCompound,
          defaultRestSec: Number(restSec),
          userId: initial?.userId ?? null,
        });
      }}
      className="space-y-3"
    >
      <Field label="Name">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Bulgarian Split Squat"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Kategorie">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Gerät">
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value as Equipment | '')}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {EQUIPMENT.map((eq) => (
              <option key={eq.value || 'none'} value={eq.value}>
                {eq.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pause (Sek)">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="15"
            value={restSec}
            onChange={(e) => setRestSec(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </Field>
        <label className="flex cursor-pointer select-none items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={isCompound}
            onChange={(e) => setIsCompound(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Grundübung
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
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
          {initial ? 'Speichern' : 'Anlegen'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
