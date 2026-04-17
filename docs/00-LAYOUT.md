# 00 – LAYOUT

Verbindliches Screen-Design. UI-Code darf erst geschrieben werden, nachdem der
betroffene Screen hier durchgelesen und geklärt ist.

Alle Wireframes sind mobile-first (375 px). Desktop-Breakpoint ≥ 1024 px mit
Sidebar links, sonst Bottom-Navigation.

Navigation (Bottom-Nav mobil / Sidebar Desktop):
`Dashboard · Workouts · Übungen · Fortschritt · Körper · Mehr`
(Pläne, Integrationen, Einstellungen unter „Mehr".)

---

## 1. Dashboard (Startseite)

```
┌─────────────────────────────────────────┐
│  Hoi Jack          17.04.2026    ☾ / ☀  │
├─────────────────────────────────────────┤
│ ► Heute trainieren                      │
│ ┌───────────────────────────────────┐   │
│ │  Push – Tag A                     │   │
│ │  6 Übungen · ~52 min              │   │
│ │  [  Starten  ]                    │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ► Diese Woche                           │
│  3 / 4 Workouts   ████████░░  75 %     │
│  Gesamtvolumen: 12 340 kg (+8 %)       │
│                                         │
│ ► Vitalwerte (heute)                    │
│  Gewicht   74.2 kg    ⬇ 0.3 kg          │
│  HRV       58 ms      —                 │
│  Schritte  8 421      ⬆                 │
│                                         │
│ ► Letztes Workout                       │
│  Pull – Tag B · Di 15.04.               │
│  8 Sätze PR · +5 kg Kreuzheben          │
├─────────────────────────────────────────┤
│ [🏠]  [🏋]  [📖]  [📈]  [···]           │
└─────────────────────────────────────────┘
```

Komponenten:
- `<TodayWorkoutCard>` – liest aktuellen Plan
- `<WeekProgress>` – Workouts done / target, Volumen-Vergleich
- `<VitalsStrip>` – aggregierte Werte aus allen aktiven Integrationen
- `<LastWorkoutCard>` – letzter Eintrag

---

## 2. Workout Logger

Wichtigster Screen. Einhändig bedienbar während des Satzes.

```
┌─────────────────────────────────────────┐
│  ← Push – Tag A           ⏱ 00:42:15    │
├─────────────────────────────────────────┤
│  Übung 3 / 6                            │
│  Bankdrücken (Langhantel)               │
│  Ziel: 4×6 @ RPE 8                      │
│                                         │
│  Satz  │  kg   │ Wdh │ RPE │            │
│  ─────────────────────────────          │
│   1    │  80   │  6  │  7  │ ✓          │
│   2    │  82.5 │  6  │  8  │ ✓          │
│   3    │  82.5 │  5  │  9  │ ✓          │
│   4    │ [85 ] │[ 4] │[ 9] │ [✓ Satz]   │
│                                         │
│  Pause: 02:30 ⏸                         │
│                                         │
│  [ ← Übung ]  [ Nächste Übung → ]       │
├─────────────────────────────────────────┤
│  [  Workout beenden  ]                  │
└─────────────────────────────────────────┘
```

Komponenten:
- `<SetInput>` – kg / Wdh / RPE, 44 px Tap-Target, Stepper ±2.5 kg
- `<RestTimer>` – läuft automatisch nach `Satz ✓`, konfigurierbar pro Übung
- `<ExerciseHistoryPopover>` – letzte 3 Einträge derselben Übung

---

## 3. Fortschritt (Progress)

```
┌─────────────────────────────────────────┐
│  ← Fortschritt                          │
├─────────────────────────────────────────┤
│  [ Übung: Kreuzheben     ▾ ]            │
│                                         │
│  e1RM                         ⚡ PR      │
│                                         │
│   150┤                        ●         │
│   140┤                   ● ●            │
│   130┤          ● ●                     │
│   120┤   ● ●                            │
│   110┤●                                 │
│      └────────────────────────          │
│       Jan  Feb  Mär  Apr                │
│                                         │
│  ⚠ Deload empfohlen: 3 Sessions ohne PR │
│     und RPE ≥ 9 – Reduziere auf 70 %.   │
│                                         │
│  Volumen-Trend (4 Wochen):              │
│  ████████████████ +12 %                 │
└─────────────────────────────────────────┘
```

Komponenten:
- `<ExercisePicker>` – Autocomplete aus `exercises`
- `<ProgressionChart>` – e1RM-Verlauf, PR-Marker
- `<DeloadAlert>` – heuristisch: ≥ 3 Sessions ohne e1RM-Progression + RPE ≥ 9

---

## 4. Übungs-Bibliothek

```
┌─────────────────────────────────────────┐
│  ← Übungen              [+ Neue Übung]  │
├─────────────────────────────────────────┤
│  [ Suchen…            ]   [Filter ▾ ]   │
│                                         │
│  Brust                                  │
│   · Bankdrücken (LH)           ⭐        │
│   · Schrägbank (KH)                     │
│                                         │
│  Rücken                                 │
│   · Kreuzheben (konv.)         ⭐        │
│   · Klimmzug (weit)                     │
│                                         │
│  Beine · Schulter · Arme · Core         │
└─────────────────────────────────────────┘
```

---

## 5. Pläne

Liste der Trainingspläne (Push/Pull/Legs, Upper/Lower, etc.). Ein Plan enthält
Tage, ein Tag enthält Übungen mit Ziel-Sätzen. Phase 1: Create / Edit / Delete.

---

## 6. Körper (Body-Tracking)

Gewicht, Körperfett %, Umfänge, HRV, Schlaf. In Phase 1 nur manuelle Eingabe +
Liste. Chart und Trend kommt mit Integrationen in Phase 2.

---

## 7. Einstellungen

```
┌─────────────────────────────────────────┐
│  ← Einstellungen                        │
├─────────────────────────────────────────┤
│  Darstellung                            │
│   Theme       [ System │ Hell │ Dunkel ]│
│   Sprache     Deutsch (Schweiz)         │
│   Einheiten   kg · km                   │
│                                         │
│  Training                               │
│   RPE-Skala   1–10 (Mike Tuchscherer)   │
│   Pause-Default  2:30                   │
│                                         │
│  Integrationen                →         │
│                                         │
│  Daten                                  │
│   Export (JSON) · Import · Löschen      │
│                                         │
│  Über                                   │
│   Version 0.1.0                         │
└─────────────────────────────────────────┘
```

---

## 8. Integrationen (Settings → Integrationen)

Zwei Sektionen, beide aus dem Registry gerendert.

```
┌─────────────────────────────────────────┐
│  ← Integrationen                        │
├─────────────────────────────────────────┤
│  Aktiv                                  │
│  ┌─────────────────────────────────┐    │
│  │ 🟢 Withings                     │    │
│  │ Waage, Schlaf, Aktivität        │    │
│  │ Letzter Sync: vor 2 h           │    │
│  │ [ Verbinden ] [ Trennen ]       │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🟢 Google Health Connect        │    │
│  │ via Companion-App (Android)     │    │
│  │ Nicht verbunden                 │    │
│  │ [ Einrichten ]                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Geplant                                │
│  ┌─────────────────────────────────┐    │
│  │ ⚪ Strava    · Activities       │    │
│  │ ⚪ Fitbit    · Wearable         │    │
│  │ ⚪ Garmin    · Wearable         │    │
│  │ ⚪ Apple Health · iOS           │    │
│  │ ⚪ Whoop     · Recovery         │    │
│  │ ⚪ Oura      · Ring             │    │
│  │ ⚪ Nutritionix · Nutrition      │    │
│  │ ⚪ MyFitnessPal (deprecated)    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

Regeln:
- Reihenfolge wird aus `registry.ts` gelesen (keine hartkodierte Liste in der UI).
- `status: 'planned'` → Card ist `opacity-50 pointer-events-none`, Button
  „Bald verfügbar" statt „Verbinden".
- `status: 'deprecated'` → grauer Badge „Nicht mehr unterstützt".

---

## Offene Entscheidungen (geklärt in Runde 2)

- **Dark Mode** → ja, Tag 1. ✅
- **RPE-Tracking** → immer sichtbar. ✅
- **Integrations-Reihenfolge** → Withings + Google Health parallel in Phase 2,
  restliche Provider à la carte in Phase 4.5. ✅
