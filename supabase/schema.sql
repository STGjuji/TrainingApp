create extension if not exists "uuid-ossp";

create table workouts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  notes text,
  scheduled_at timestamptz,
  completed boolean default false,
  created_at timestamptz default now()
);

create table meals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  calories integer,
  notes text,
  eaten_at timestamptz,
  created_at timestamptz default now()
);

create table weight_entries (
  id uuid primary key default uuid_generate_v4(),
  kilos numeric(5,2) not null,
  recorded_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

create table garmin_imports (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  file_type text,
  uploaded_at timestamptz default now(),
  storage_path text,
  parsed_json jsonb
);
