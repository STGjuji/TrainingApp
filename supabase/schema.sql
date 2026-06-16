create extension if not exists "uuid-ossp";

create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  notes text,
  scheduled_at timestamptz,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table workouts enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workouts'
      AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON workouts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workouts'
      AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access" ON workouts FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workouts'
      AND policyname = 'Public update access'
  ) THEN
    CREATE POLICY "Public update access" ON workouts FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workouts'
      AND policyname = 'Public delete access'
  ) THEN
    CREATE POLICY "Public delete access" ON workouts FOR DELETE USING (true);
  END IF;
END
$$;

create table if not exists meals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  calories integer,
  notes text,
  eaten_at timestamptz,
  created_at timestamptz default now()
);

alter table meals enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meals'
      AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON meals FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meals'
      AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access" ON meals FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meals'
      AND policyname = 'Public update access'
  ) THEN
    CREATE POLICY "Public update access" ON meals FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meals'
      AND policyname = 'Public delete access'
  ) THEN
    CREATE POLICY "Public delete access" ON meals FOR DELETE USING (true);
  END IF;
END
$$;

create table if not exists weight_entries (
  id uuid primary key default uuid_generate_v4(),
  kilos numeric(5,2) not null,
  recorded_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

alter table weight_entries enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weight_entries'
      AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON weight_entries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weight_entries'
      AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access" ON weight_entries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weight_entries'
      AND policyname = 'Public update access'
  ) THEN
    CREATE POLICY "Public update access" ON weight_entries FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weight_entries'
      AND policyname = 'Public delete access'
  ) THEN
    CREATE POLICY "Public delete access" ON weight_entries FOR DELETE USING (true);
  END IF;
END
$$;

create table if not exists garmin_imports (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  file_type text,
  uploaded_at timestamptz default now(),
  storage_path text,
  parsed_json jsonb
);

alter table garmin_imports enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'garmin_imports'
      AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON garmin_imports FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'garmin_imports'
      AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access" ON garmin_imports FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'garmin_imports'
      AND policyname = 'Public update access'
  ) THEN
    CREATE POLICY "Public update access" ON garmin_imports FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'garmin_imports'
      AND policyname = 'Public delete access'
  ) THEN
    CREATE POLICY "Public delete access" ON garmin_imports FOR DELETE USING (true);
  END IF;
END
$$;
