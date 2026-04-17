export function ExercisesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Übungen</h1>
      <p className="text-sm text-muted-foreground">
        Die Übungs-Bibliothek mit Seed-Daten (30 Standard-Übungen) und User-eigenen
        Übungen kommt in Phase 1, Milestone 3.
      </p>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Kategorien: Brust, Rücken, Beine, Schulter, Arme, Core.
      </div>
    </div>
  );
}
