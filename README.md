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

- [ ] **Deployment** – Lovable, Vercel oder Netlify, damit die App von überall (und als installierbare PWA) erreichbar ist. HTTPS ist Pflicht für Service-Worker / Install-Prompt.
- [x] **Dashboard mit echten Daten** – liest Wochen-Stats (Workouts + Volumen), aktives Workout, letztes Workout und neueste Körperwerte aus Dexie.
- [ ] **Workout-Historie** – Liste vergangener Workouts (Datum, Plan-Tag, #Sätze, Dauer) mit Tap → Detail-Ansicht. Daten liegen schon in `workoutsRepo.list()`.
- [ ] **Plan-Übungen Drag-Reorder** – aus M4 verschoben. `react-dnd` oder `@dnd-kit/core`.
- [ ] **Exercise-Notes editierbar** – Feld existiert im Schema, UI fehlt.
- [ ] **Settings → Daten exportieren / löschen** – JSON-Dump aus Dexie + Reset-Button (für Phase-2-Migration relevant).

## Ausblick Phase 2 (Backend + Integrationen)

Siehe `docs/04-ROADMAP.md`. Kurz:

- Supabase-Projekt anlegen, Migration `supabase/migrations/0001_initial_schema.sql` anwenden.
- Magic-Link-Auth + Offline-Sync (Dexie ↔ Supabase).
- Withings + Google Health Connect als erste echte Provider.

## Deployment

### Option A: Lovable (via GitHub)

1. Code steht schon auf `github.com/jack0swiss/fittracker`, Branch `claude/complete-shared-task-8PZPr`.
2. Vor dem Deploy: Branch auf `main` mergen (oder direkt mit diesem Branch verknüpfen).
3. Auf [lovable.dev](https://lovable.dev) → **Import from GitHub** → `jack0swiss/fittracker` wählen.
4. Build-Settings (falls nicht auto-erkannt):
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   - Node Version: 20
5. **Keine Environment Variables nötig** – Phase 1 läuft komplett lokal im Browser (Dexie/IndexedDB).

### Option B: Vercel

```bash
pnpm dlx vercel
```

Vercel erkennt Vite automatisch, Build-Command und Output-Directory sind out-of-the-box korrekt.

### Option C: Netlify

```bash
pnpm build
pnpm dlx netlify-cli deploy --prod --dir=dist
```

### Nach dem Deployment (alle Varianten)

Auf dem Handy die HTTPS-URL öffnen → **Zum Home-Bildschirm hinzufügen** (iOS Safari: Share → Home-Bildschirm · Android Chrome: Menü → App installieren). App läuft dann offline und mit App-Icon.

### Secrets-Status

Das Repo enthält **keine** API-Keys, Tokens oder `.env`-Dateien. Alles ist clientseitig (Dexie). `.gitignore` deckt `.env`, `.env.local`, `.vscode`, `.idea`, `dist` ab. Ab Phase 2 (Supabase) kommen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` dazu – die werden dann in Lovable/Vercel/Netlify als Environment Variables gesetzt, nicht ins Repo committed.

## Dokumentation

**Bevor du Code schreibst**: Lies `CLAUDE.md` und `docs/00-LAYOUT.md`. Alle Entscheidungen stehen dort.
