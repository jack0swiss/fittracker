# 02 – DATA MODEL

Komplettes Postgres-Schema für Supabase. Die Migration liegt fertig unter
`supabase/migrations/0001_initial_schema.sql`.

## Kern-Tabellen

### `profiles`
Erweitert `auth.users`. 1:1 via `id uuid references auth.users`.

| Spalte        | Typ           | Notiz                          |
|---------------|---------------|--------------------------------|
| id            | uuid PK       | = auth.users.id                |
| display_name  | text          |                                |
| locale        | text          | default `'de-CH'`              |
| unit_weight   | text          | `'kg'` (enum später)           |
| unit_distance | text          | `'km'`                         |
| created_at    | timestamptz   | default now()                  |

### `exercises`
Globale Library + User-eigene. `user_id nullable` → global wenn NULL.

| Spalte            | Typ        | Notiz                               |
|-------------------|------------|-------------------------------------|
| id                | uuid PK    |                                     |
| user_id           | uuid FK    | nullable (NULL = global)            |
| name              | text       | „Bankdrücken (LH)"                  |
| category          | text       | chest / back / legs / …             |
| equipment         | text       | barbell / dumbbell / cable / …      |
| is_compound       | boolean    |                                     |
| default_rest_sec  | int        | default 120                         |
| notes             | text       |                                     |

### `plans`
Ein Plan = eine Mesozykel-Vorlage.

| Spalte        | Typ      |                              |
|---------------|----------|------------------------------|
| id            | uuid PK  |                              |
| user_id       | uuid FK  |                              |
| name          | text     | „PPL 5-Tage"                 |
| description   | text     |                              |
| created_at    | timestamptz |                           |

### `plan_days`
Tage in einem Plan (Push / Pull / Legs / …).

| Spalte   | Typ     |                          |
|----------|---------|--------------------------|
| id       | uuid PK |                          |
| plan_id  | uuid FK | cascade delete           |
| day_index| int     | 0-basiert                |
| name     | text    | „Push A"                 |

### `plan_exercises`
Zuordnung Übung → Plan-Tag mit Ziel-Sätzen.

| Spalte         | Typ     |                           |
|----------------|---------|---------------------------|
| id             | uuid PK |                           |
| plan_day_id    | uuid FK |                           |
| exercise_id    | uuid FK |                           |
| order_index    | int     |                           |
| target_sets    | int     |                           |
| target_reps    | int     |                           |
| target_rpe     | numeric | null = kein RPE-Target    |

### `workouts`
Eine absolvierte Session.

| Spalte        | Typ         |                         |
|---------------|-------------|-------------------------|
| id            | uuid PK     |                         |
| user_id       | uuid FK     |                         |
| plan_day_id   | uuid FK     | nullable (freies WO)    |
| started_at    | timestamptz |                         |
| ended_at      | timestamptz | nullable                |
| notes         | text        |                         |

### `workout_sets`
Die Rohdaten jedes Satzes. Herzstück.

| Spalte        | Typ     |                           |
|---------------|---------|---------------------------|
| id            | uuid PK |                           |
| workout_id    | uuid FK | cascade delete            |
| exercise_id   | uuid FK |                           |
| set_index     | int     | 1-basiert                 |
| weight_kg     | numeric |                           |
| reps          | int     |                           |
| rpe           | numeric | 1–10, nullable            |
| is_warmup     | boolean | default false             |
| completed_at  | timestamptz |                       |

## Body-Tracking

### `body_measurements`
Universelle Tabelle für Waage, HRV, Schritte, Schlaf etc. – pro Metrik ein Row.

| Spalte       | Typ         |                                             |
|--------------|-------------|---------------------------------------------|
| id           | uuid PK     |                                             |
| user_id      | uuid FK     |                                             |
| measured_at  | timestamptz |                                             |
| metric       | text        | `weight_kg` / `body_fat_pct` / `hrv_ms` / … |
| value        | numeric     |                                             |
| source       | text        | siehe Check-Constraint unten                |
| external_id  | text        | Idempotenz-Key für Dedup                    |

## Source-Check-Constraint

Verhindert Tippfehler bei Provider-Keys, kompatibel mit allen 10 aktuellen + geplanten Providern:

```sql
ALTER TABLE body_measurements
ADD CONSTRAINT body_measurements_source_chk CHECK (
  source IN (
    'manual',
    'withings', 'google-health',
    'strava', 'fitbit', 'garmin', 'apple-health',
    'whoop', 'oura',
    'myfitnesspal', 'nutritionix'
  )
);
```

Die gleiche Liste gilt für `workouts.source` (wird Phase 2 hinzugefügt).

## RLS

Jede Tabelle mit `user_id` hat:
```sql
ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "<t>_owner" ON <t>
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

`exercises` erlaubt zusätzlich `user_id IS NULL` für globale Übungen (nur read).

## Views

### `v_e1rm`
Epley-Formel für e1RM-Kurve pro Übung.
```sql
CREATE VIEW v_e1rm AS
SELECT
  user_id, exercise_id, workout_id,
  max(weight_kg * (1 + reps / 30.0)) AS e1rm,
  min(completed_at) AS at
FROM workout_sets
WHERE NOT is_warmup AND reps BETWEEN 1 AND 15
GROUP BY user_id, exercise_id, workout_id;
```

### `v_weekly_volume`
```sql
CREATE VIEW v_weekly_volume AS
SELECT
  user_id,
  date_trunc('week', completed_at) AS week,
  sum(weight_kg * reps) AS total_kg
FROM workout_sets
WHERE NOT is_warmup
GROUP BY user_id, date_trunc('week', completed_at);
```

## Indexe

- `workout_sets (workout_id)`
- `workout_sets (user_id, exercise_id, completed_at DESC)` – Progression
- `body_measurements (user_id, metric, measured_at DESC)`
- `body_measurements (source, external_id)` unique – Dedup
