# 04 – ROADMAP

Zeitschätzungen sind für fokussierte Solo-Arbeit mit Claude Code als Pair.

## Phase 1 – MVP (lokal, ~35 h)

Ziel: komplett offline nutzbare App für Workout-Logging + Progression.

| # | Milestone                                  | Stunden |
|---|---------------------------------------------|---------|
| 1 | Skeleton (Routing, Theme, Layout) steht      | 2       |
| 2 | Dexie-Schema + React-Query-Offline-Adapter   | 3       |
| 3 | Übungs-Bibliothek (CRUD, seed 30 Übungen)    | 4       |
| 4 | Pläne (CRUD, Drag-Reorder)                   | 4       |
| 5 | Workout-Logger (SetInput, RestTimer, PR-Det.)| 8       |
| 6 | Progress-Screen (e1RM-Chart, Deload-Alert)   | 5       |
| 7 | Body-Tracking (manuell, Liste)               | 3       |
| 8 | PWA-Manifest, Install-Prompt, Icons          | 2       |
| 9 | Polish, Bugs, Swiss-Locale-Check             | 4       |

Definition of Done Phase 1:
- App läuft installiert vom Homescreen ohne Netz
- Push-Workout mit 24 Sätzen loggen funktioniert einhändig
- e1RM-Chart zeigt sauber die Progression der letzten 90 Tage
- Dark Mode wechselt ohne Flash

## Phase 2 – Backend + Integrations (~18 h)

Parallel Withings + Google Health, plus Supabase-Anbindung.

| # | Milestone                                  | Stunden |
|---|---------------------------------------------|---------|
| 1 | Supabase-Projekt, Migration anwenden         | 1       |
| 2 | Supabase Auth (magic link) + Offline-Sync    | 4       |
| 3 | Registry-Foundation (Connection-UI, Tokens)  | 3       |
| 4 | Withings-Provider (OAuth + Sync Edge-Func)   | 4       |
| 5 | Google-Health-Provider (Companion-Stub + UI) | 3       |
| 6 | Vitals-Strip im Dashboard live               | 3       |

## Phase 3 – Qualität (~10 h)

- Vitest für `lib/` + Progression-Logik
- Storybook für Komponenten (optional)
- Playwright: Workout-Happy-Path

## Phase 4 – Mobile-Companion (~15 h)

Android-App als Thin-Client auf Health Connect:
- Kotlin / Jetpack Compose minimal
- Supabase-Kotlin-Client
- WorkManager Job liest Health Connect → schreibt Supabase

## Phase 4.5 – Weitere Integrationen (à la carte)

Pro Provider nach Registry-Schema. Reihenfolge nach User-Priorität.

| Provider      | Aufwand | Bemerkung                                   |
|---------------|---------|---------------------------------------------|
| Strava        | 4 h     | OAuth + Activities-Mapping                  |
| Fitbit        | 4 h     | OAuth, aber Rate-Limits beachten            |
| Garmin        | 5 h     | OAuth + HRV-Mapping (komplexer)             |
| Apple Health  | 8 h     | Companion-App iOS separat nötig             |
| Whoop         | 4 h     | OAuth, aber teure Subscription-Hürde        |
| Oura          | 4 h     | OAuth v2                                    |
| Nutritionix   | 3 h     | API-Key, Natural-Language-Parsing           |

Summe à la carte: ~32 h, aber jede einzeln abschließbar.
