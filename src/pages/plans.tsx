export function PlansPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Pläne</h1>
      <p className="text-sm text-muted-foreground">
        Trainingspläne (Push/Pull/Legs, Upper/Lower, etc.) kommen in Phase 1,
        Milestone 4.
      </p>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Siehe <code>docs/02-DATA-MODEL.md</code> für die Plan-Tabellen.
      </div>
    </div>
  );
}
