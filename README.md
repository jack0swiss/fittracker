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

## Dokumentation

**Bevor du Code schreibst**: Lies `CLAUDE.md` und `docs/00-LAYOUT.md`. Alle Entscheidungen stehen dort.
