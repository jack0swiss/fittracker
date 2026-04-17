export function WorkoutLoggerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Workout</h1>
      <p className="text-sm text-muted-foreground">
        Der Workout-Logger kommt in Phase 1, Milestone 5. Hier wirst du Sätze
        einhändig loggen – kg / Wdh / RPE mit Rest-Timer zwischen den Sätzen.
      </p>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Siehe <code>docs/00-LAYOUT.md</code> Abschnitt „Workout Logger".
      </div>
    </div>
  );
}
