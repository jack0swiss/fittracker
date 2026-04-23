# FitTracker

Personal Fitness Dashboard mit Workout-Logger (Sätze, Wdh, Gewicht, RPE, Progression, Deload-Detection) und Integrations-Registry für externe Tracker.

## Schnellstart

```bash
pnpm install
pnpm dev
```

Browser → http://localhost:5173

## Scripts

- `pnpm dev` – Dev-Server (Vite)
- `pnpm build` – Production-Build
- `pnpm preview` – Preview des Builds
- `pnpm typecheck` – TypeScript ohne Emit
- `pnpm lint` – ESLint

## Projekt-Struktur

```
fittracker/
├── CLAUDE.md              # Projekt-Kontext für Claude Code
├── FIRST-PROMPT.md        # Erster Prompt für Claude Code
├── docs/
│   ├── 00-LAYOUT.md       # Screen-Wireframes (verbindlich)
│   ├── 01-TECH-STACK.md
│   ├── 02-DATA-MODEL.md
│   ├── 03-INTEGRATIONS.md # Registry-Pattern für Provider
│   └── 04-ROADMAP.md
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/        # Layout, ThemeProvider
    ├── pages/             # Dashboard, Workout, Progress, ...
    ├── integrations/
    │   ├── types.ts
    │   ├── registry.ts
    │   └── providers/     # withings, google-health, +8 geplant
    └── lib/utils.ts
```

## Status

Phase 1 – MVP (lokal). Siehe `docs/04-ROADMAP.md`.

| Milestone | Status |
|-----------|--------|
| M1 – Skeleton (Routing, Theme, Layout)        | ✅ |
| M2 – Dexie + React Query                      | ✅ |
| M3 – Übungs-Bibliothek (CRUD, 30 Seeds)       | ✅ |
| M4 – Pläne (CRUD, Tage, Übungen)              | ✅ (Drag-Reorder offen) |
| M5 – Workout-Logger (Rest-Timer, PR-Det.)     | ✅ |
| M6 – Progress (e1RM-Chart, Deload-Alert)      | ✅ |
| M7 – Body-Tracking (manuelle Einträge)        | ✅ |
| M8 – PWA (Icons, Install-Prompt)              | ✅ |
| M9 – Polish (Swiss-Locale, a11y)              | ✅ |

## Offene Punkte vor Phase-1-Abschluss

Reine Produkt-Tasks, keine Architektur-Änderungen mehr nötig:

- [ ] **Deployment** – Vercel oder Netlify, damit die App von überall (und als installierbare PWA) erreichbar ist. HTTPS ist Pflicht für Service-Worker / Install-Prompt.
- [ ] **Dashboard mit echten Daten** – aktuell zeigt `src/pages/dashboard.tsx` Mock-Werte (Workouts diese Woche, Vitalwerte, letztes Workout). Soll an Dexie-Daten via React-Query verdrahtet werden.
- [ ] **Workout-Historie** – Liste vergangener Workouts (Datum, Plan-Tag, #Sätze, Dauer) mit Tap → Detail-Ansicht. Daten liegen schon in `workoutsRepo.list()`.
- [ ] **Plan-Übungen Drag-Reorder** – aus M4 verschoben. `react-dnd` oder `@dnd-kit/core`.
- [ ] **Exercise-Notes editierbar** – Feld existiert im Schema, UI fehlt.
- [ ] **Settings → Daten exportieren / löschen** – JSON-Dump aus Dexie + Reset-Button (für Phase-2-Migration relevant).

## Ausblick Phase 2 (Backend + Integrationen)

Siehe `docs/04-ROADMAP.md`. Kurz:

- Supabase-Projekt anlegen, Migration `supabase/migrations/0001_initial_schema.sql` anwenden.
- Magic-Link-Auth + Offline-Sync (Dexie ↔ Supabase).
- Withings + Google Health Connect als erste echte Provider.

## Deployment-Quickstart (Vercel)

```bash
pnpm dlx vercel
```

Nach dem Prompt liefert Vercel eine `https://...vercel.app`-URL. Auf dem Handy öffnen → „Zum Home-Bildschirm hinzufügen" → läuft offline.

## Dokumentation

**Bevor du Code schreibst**: Lies `CLAUDE.md` und `docs/00-LAYOUT.md`. Alle Entscheidungen stehen dort.
