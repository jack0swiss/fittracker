import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';

import { ExerciseForm } from '@/components/exercise-form';
import { Modal } from '@/components/modal';
import type { ExerciseInput } from '@/db/repos/exercises';
import type { Exercise, ExerciseCategory } from '@/db/schema';
import {
  useCreateExercise,
  useDeleteExercise,
  useExercises,
  useUpdateExercise,
} from '@/hooks/use-exercises';

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

type EditorState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; ex: Exercise };

export function ExercisesPage() {
  const { data, isLoading, error } = useExercises();
  const create = useCreateExercise();
  const update = useUpdateExercise();
  const remove = useDeleteExercise();

  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });

  const grouped = useMemo(() => {
    const rows = filterExercises(data ?? [], query);
    const map = new Map<ExerciseCategory, Exercise[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const row of rows) map.get(row.category)?.push(row);
    return map;
  }, [data, query]);

  const totalVisible = useMemo(
    () => Array.from(grouped.values()).reduce((n, arr) => n + arr.length, 0),
    [grouped],
  );

  function handleSubmit(input: ExerciseInput) {
    if (editor.mode === 'create') {
      create.mutate(input, { onSuccess: () => setEditor({ mode: 'closed' }) });
    } else if (editor.mode === 'edit') {
      update.mutate(
        { id: editor.ex.id, patch: input },
        { onSuccess: () => setEditor({ mode: 'closed' }) },
      );
    }
  }

  function handleDelete(ex: Exercise) {
    const ok = window.confirm(`„${ex.name}" löschen?`);
    if (!ok) return;
    remove.mutate(ex.id);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Übungen</h1>
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>
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
        <EmptyState query={query} onCreate={() => setEditor({ mode: 'create' })} />
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">
            {totalVisible} {totalVisible === 1 ? 'Übung' : 'Übungen'}
          </p>
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
                    <li
                      key={ex.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{ex.name}</span>
                        {ex.isCompound && (
                          <Star
                            className="h-3.5 w-3.5 fill-primary text-primary"
                            aria-label="Grundübung"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="mr-2 text-xs text-muted-foreground">
                          {ex.equipment ?? '—'}
                        </span>
                        <IconButton
                          label="Bearbeiten"
                          onClick={() => setEditor({ mode: 'edit', ex })}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        {ex.userId !== null && (
                          <IconButton
                            label="Löschen"
                            onClick={() => handleDelete(ex)}
                            danger
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={editor.mode !== 'closed'}
        onClose={() => setEditor({ mode: 'closed' })}
        title={editor.mode === 'edit' ? 'Übung bearbeiten' : 'Neue Übung'}
      >
        {editor.mode !== 'closed' && (
          <ExerciseForm
            initial={editor.mode === 'edit' ? editor.ex : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setEditor({ mode: 'closed' })}
            submitting={create.isPending || update.isPending}
          />
        )}
      </Modal>
    </div>
  );
}

function filterExercises(all: Exercise[], query: string): Exercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((e) => e.name.toLowerCase().includes(q));
}

function EmptyState({
  query,
  onCreate,
}: {
  query: string;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {query ? (
        <>Keine Übung mit „{query}" gefunden.</>
      ) : (
        <>
          Noch keine Übungen.{' '}
          <button
            type="button"
            onClick={onCreate}
            className="text-primary underline-offset-2 hover:underline"
          >
            Eine anlegen
          </button>
          .
        </>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent ${
        danger ? 'hover:text-destructive' : 'hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
