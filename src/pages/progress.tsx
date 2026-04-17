export function ProgressPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Fortschritt</h1>
      <p className="text-sm text-muted-foreground">
        e1RM-Chart pro Übung, PR-Marker und Deload-Alert kommen in Phase 1,
        Milestone 6.
      </p>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Heuristik Deload: ≥ 3 Sessions ohne e1RM-Progression und RPE ≥ 9.
      </div>
    </div>
  );
}
