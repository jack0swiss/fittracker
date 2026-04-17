# CLAUDE.md — Projekt-Kontext für Claude Code

Dieses Dokument liest Claude Code beim Start automatisch ein. Es enthält alles,
was für dieses Projekt verbindlich ist.

---

## Projekt

**FitTracker** – Personal-Fitness-Dashboard mit Workout-Logger (Sätze / Wiederholungen /
Gewicht / RPE, Progression, Deload-Detection) und Integrationen zu externen
Health-Trackern (Withings, Google Health Connect initial; Strava, Fitbit, Garmin,
Apple Health, Whoop, Oura, MyFitnessPal, Nutritionix geplant).

Zielgerät primär: Smartphone (einhändig bedienbar im Gym). Desktop/Tablet sekundär.

---

## Locked-in decisions

Diese Entscheidungen sind verbindlich und **nicht ohne Rückfrage** zu ändern:

1. **Dark Mode ab Tag 1** – 3-Weg-Toggle: System / Hell / Dunkel, persistiert in
   `localStorage`. Default = System.
2. **RPE-Tracking immer sichtbar** – RPE-Eingabe (1–10) ist fester Bestandteil
   jedes Set-Inputs, nicht opt-in.
3. **Registry-Pattern für Integrationen** – alle externen Provider leben als
   `IntegrationProvider`-Implementationen unter `src/integrations/providers/`
   und werden in `src/integrations/registry.ts` registriert. Status:
   `active | planned | deprecated`. Phase 1 zeigt die Settings-Seite beide
   Gruppen (Aktiv / Geplant, letztere greyed-out).
4. **Phase-1-Scope** – nur lokale Logik: Workouts loggen, Progression anzeigen,
   Übungs-Bibliothek. **Keine** Integration-Logik in Phase 1. Provider sind Stubs,
   die bewusst `NotImplementedError` werfen.
5. **Supabase als Backend (Phase 2)** – Postgres + RLS + Edge Functions. Die
   initiale Migration (`supabase/migrations/0001_initial_schema.sql`) ist bereits
   vorbereitet inklusive Source-Check-Constraints für alle 10 Provider.
6. **Swiss locale** – Datum `TT.MM.JJJJ`, Zeit `HH:mm`, Dezimaltrenner Komma,
   Gewicht in kg, Distanz in km.
7. **Offline-first** – Workout-Logger muss ohne Netz funktionieren (IndexedDB
   via Dexie/IDB, Sync sobald online). Wird Phase 2 ausgebaut; Phase-1-Code darf
   diese Zukunft nicht verbauen.

---

## Golden Rules (für Code)

- **UI-Texte auf Deutsch**, Code-Kommentare und Identifier auf Englisch.
- **Mobile-first** – erst die Smartphone-Ansicht, dann Breakpoints nach oben.
- **Einhändig bedienbar** – Tap-Targets ≥ 44×44 px, Primäraktionen im Daumen-Radius.
- **Shadcn/ui + Tailwind** als UI-System. Keine anderen Komponentenbibliotheken.
- **React Query** für jeden Server-State. Kein eigener Fetch-State.
- **Keine Default-Exports** für Komponenten (bessere Auto-Imports, Refactorings).
- **Typsicher** – `any` ist verboten außer für externe ungetypte Libraries, dann mit
  Kommentar begründen.
- **Path-Alias** `@/*` → `src/*` konsequent nutzen.

---

## Wichtige Verweise

- `docs/00-LAYOUT.md` – alle 7 Screens als ASCII-Wireframes + Komponenten-Liste.
  **Verbindlich** bevor UI-Code geschrieben wird.
- `docs/01-TECH-STACK.md` – Dependencies und Begründungen.
- `docs/02-DATA-MODEL.md` – komplettes Postgres-Schema, bereit als Migration.
- `docs/03-INTEGRATIONS.md` – Provider-Registry-Architektur inkl. aller 10 Provider.
- `docs/04-ROADMAP.md` – Phasen 1–4.5 mit Zeitschätzungen.

---

## Arbeitsweise mit Claude Code

Vor jeder grösseren Änderung:
1. Betroffenes Dokument unter `docs/` lesen.
2. Statusbericht: was geändert wird, was das betrifft, welche offenen Fragen.
3. Erst nach Freigabe Code schreiben.

Bei Uneinigkeit: Rückfrage. Keine stillen Scope-Erweiterungen.
