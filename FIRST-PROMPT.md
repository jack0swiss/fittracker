# Erster Prompt für Claude Code

Wenn du `claude` im Projekt-Root startest, paste diesen Prompt als erstes:

---

Lies zuerst `CLAUDE.md` und `docs/00-LAYOUT.md` – dort stehen alle Regeln und
das Screen-Design. Dann `docs/01-TECH-STACK.md` bis `docs/04-ROADMAP.md` überfliegen.

Anschliessend gibst du mir einen kurzen Statusbericht:

1. Welchen Phase-1-Meilenstein würdest du als erstes umsetzen?
2. Welche Fragen hast du, bevor du anfängst zu coden?
3. Was fehlt im Skeleton, das du brauchst?

**WICHTIG**: Wir sind in Phase 1 (MVP). Keine Integration-Logik coden – die
Provider sind absichtlich Stubs. Schreib noch keinen Code. Erst wenn ich deinen
Plan bestätigt habe. UI-Texte auf Deutsch, Code-Kommentare und Identifier auf
Englisch.

---

## Danach: empfohlene Reihenfolge

Nach der Freigabe des Plans in dieser Reihenfolge arbeiten (aus `04-ROADMAP.md`):

1. **Milestone 2** – Dexie-Schema + React-Query-Offline-Adapter
2. **Milestone 3** – Übungs-Bibliothek mit Seed (30 Standard-Übungen)
3. **Milestone 4** – Pläne (CRUD, Drag-Reorder)
4. **Milestone 5** – Workout-Logger (SetInput, RestTimer, PR-Detection)
5. **Milestone 6** – Progress-Screen (e1RM, Deload-Alert)
6. **Milestone 7** – Body-Tracking (manuell)
7. **Milestone 8** – PWA-Manifest finalisieren, Install-Prompt
8. **Milestone 9** – Polish, Bug-Sweep, Swiss-Locale-Check
