import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';

import { useExercises } from '@/hooks/use-exercises';
import type { Exercise, ExerciseCategory } from '@/db/schema';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Brust',
  back: 'Rücken',
  legs: 'Beine',
  shoulders: 'Schulter',
  arms: 'Arme',
  core: 'Core',
  'full-body': 'Ganzkörper',
};

const CATEGORY_ORDER: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'full-body',
];

export function ExercisesPage() {
  const { data, isLoading, error } = useExercises();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const rows = filter(data ?? [], query);
    const map = new Map<ExerciseCategory, Exercise[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const row of rows) map.get(row.category)?.push(row);
    return map;
  }, [data, query]);

  const totalVisible = useMemo(
    () => Array.from(grouped.values()).reduce((n, arr) => n + arr.length, 0),
    [grouped],
  );

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Übungen</h1>
        <span className="text-xs text-muted-foreground">{totalVisible}</span>
      </header>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen …"
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && (
        <p className="text-sm text-destructive">
          Fehler beim Laden: {(error as Error).message}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Wird geladen …</p>
      ) : totalVisible === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="space-y-5">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={cat} className="space-y-2">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                  {items.map((ex) => (
                    <li key={ex.id}>
                      <ExerciseRow exercise={ex} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function filter(all: Exercise[], query: string): Exercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((e) => e.name.toLowerCase().includes(q));
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between px-4 py-3 text-left text-sm',
        'hover:bg-accent',
      )}
    >
      <span className="flex items-center gap-2">
        {exercise.name}
        {exercise.isCompound && (
          <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-label="Grundübung" />
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {exercise.equipment ?? '—'}
      </span>
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {query ? (
        <>Keine Übung mit „{query}" gefunden.</>
      ) : (
        <>Noch keine Übungen. Beim ersten Start werden Standard-Übungen geseedet.</>
      )}
    </div>
  );
}
