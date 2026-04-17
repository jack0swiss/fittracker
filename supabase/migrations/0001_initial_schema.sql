-- FitTracker – initial schema
-- Siehe docs/02-DATA-MODEL.md für Kontext.

set search_path = public;

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'de-CH',
  unit_weight text not null default 'kg',
  unit_distance text not null default 'km',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles_owner" on profiles
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- exercises ----------
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  equipment text,
  is_compound boolean not null default false,
  default_rest_sec int not null default 120,
  notes text,
  created_at timestamptz not null default now()
);

alter table exercises enable row level security;
create policy "exercises_read" on exercises
  for select using (user_id is null or user_id = auth.uid());
create policy "exercises_write" on exercises
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- plans ----------
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table plans enable row level security;
create policy "plans_owner" on plans
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  day_index int not null,
  name text not null
);

alter table plan_days enable row level security;
create policy "plan_days_via_plan" on plan_days
  using (exists (select 1 from plans p where p.id = plan_days.plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from plans p where p.id = plan_days.plan_id and p.user_id = auth.uid()));

create table if not exists plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references plan_days(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index int not null,
  target_sets int not null,
  target_reps int not null,
  target_rpe numeric(3, 1)
);

alter table plan_exercises enable row level security;
create policy "plan_exercises_via_plan" on plan_exercises
  using (
    exists (
      select 1 from plan_days d
      join plans p on p.id = d.plan_id
      where d.id = plan_exercises.plan_day_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from plan_days d
      join plans p on p.id = d.plan_id
      where d.id = plan_exercises.plan_day_id and p.user_id = auth.uid()
    )
  );

-- ---------- workouts ----------
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day_id uuid references plan_days(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table workouts enable row level security;
create policy "workouts_owner" on workouts
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_index int not null,
  weight_kg numeric(6, 2) not null,
  reps int not null,
  rpe numeric(3, 1),
  is_warmup boolean not null default false,
  completed_at timestamptz not null default now()
);

alter table workout_sets enable row level security;
create policy "workout_sets_via_workout" on workout_sets
  using (exists (select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid()));

create index if not exists workout_sets_workout_idx on workout_sets (workout_id);
create index if not exists workout_sets_progression_idx on workout_sets (exercise_id, completed_at desc);

-- ---------- body_measurements ----------
create table if not exists body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null,
  metric text not null,
  value numeric(10, 3) not null,
  source text not null default 'manual',
  external_id text,
  created_at timestamptz not null default now(),
  constraint body_measurements_source_chk check (
    source in (
      'manual',
      'withings', 'google-health',
      'strava', 'fitbit', 'garmin', 'apple-health',
      'whoop', 'oura',
      'myfitnesspal', 'nutritionix'
    )
  ),
  constraint body_measurements_source_external_unique unique (source, external_id)
);

alter table body_measurements enable row level security;
create policy "body_measurements_owner" on body_measurements
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists body_measurements_user_metric_idx
  on body_measurements (user_id, metric, measured_at desc);

-- ---------- views ----------
create or replace view v_e1rm as
select
  w.user_id,
  s.exercise_id,
  s.workout_id,
  max(s.weight_kg * (1 + s.reps / 30.0)) as e1rm,
  min(s.completed_at) as at
from workout_sets s
join workouts w on w.id = s.workout_id
where s.is_warmup = false and s.reps between 1 and 15
group by w.user_id, s.exercise_id, s.workout_id;

create or replace view v_weekly_volume as
select
  w.user_id,
  date_trunc('week', s.completed_at) as week,
  sum(s.weight_kg * s.reps) as total_kg
from workout_sets s
join workouts w on w.id = s.workout_id
where s.is_warmup = false
group by w.user_id, date_trunc('week', s.completed_at);
