export function BodyPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Körperwerte</h1>
      <p className="text-sm text-muted-foreground">
        Gewicht, Körperfett, Umfänge, HRV und Schlaf – manuelle Eingabe in Phase 1,
        automatisches Syncen via Integrationen in Phase 2.
      </p>
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Datenmodell: <code>body_measurements</code> (siehe <code>docs/02-DATA-MODEL.md</code>).
      </div>
    </div>
  );
}
