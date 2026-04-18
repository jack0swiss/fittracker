import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

import { Modal } from '@/components/modal';
import type { PlanInput } from '@/db/repos/plans';
import { useCreatePlan, useDeletePlan, usePlans } from '@/hooks/use-plans';
import { formatDateCH } from '@/lib/utils';

export function PlansPage() {
  const { data, isLoading } = usePlans();
  const create = useCreatePlan();
  const remove = useDeletePlan();

  const [open, setOpen] = useState(false);

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Plan „${name}" und alle Tage löschen?`)) return;
    remove.mutate(id);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pläne</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Wird geladen …</p>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Noch kein Plan.{' '}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-primary underline-offset-2 hover:underline"
          >
            Einen anlegen
          </button>
          .
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {data!.map((plan) => (
            <li key={plan.id} className="flex items-center">
              <Link
                to={`/plans/${plan.id}`}
                className="flex-1 px-4 py-3 text-sm hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    {plan.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {plan.description}
                      </div>
                    )}
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Erstellt {formatDateCH(new Date(plan.createdAt))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
              <button
                type="button"
                aria-label="Löschen"
                onClick={() => handleDelete(plan.id, plan.name)}
                className="mr-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Neuer Plan">
        <PlanForm
          submitting={create.isPending}
          onCancel={() => setOpen(false)}
          onSubmit={(input) =>
            create.mutate(input, { onSuccess: () => setOpen(false) })
          }
        />
      </Modal>
    </div>
  );
}

interface PlanFormProps {
  onSubmit: (input: PlanInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}

function PlanForm({ onSubmit, onCancel, submitting }: PlanFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name, description: description.trim() || null });
      }}
      className="space-y-3"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. PPL 5-Tage"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Beschreibung (optional)
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>
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
          disabled={!name.trim() || submitting}
          className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Anlegen
        </button>
      </div>
    </form>
  );
}
