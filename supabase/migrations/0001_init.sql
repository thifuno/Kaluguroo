-- Kaluguroo database schema
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- Every user-owned table is protected by Row Level Security.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email text,
  language text not null default 'th' check (language in ('th', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- health_goals
-- ---------------------------------------------------------------------------
create table if not exists public.health_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  age integer not null check (age between 13 and 120),
  gender text not null check (gender in ('male', 'female', 'other')),
  height_cm numeric(5, 1) not null check (height_cm between 100 and 250),
  current_weight_kg numeric(5, 1) not null check (current_weight_kg between 30 and 300),
  target_weight_kg numeric(5, 1) not null check (target_weight_kg between 30 and 300),
  activity_level text not null check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  goal text not null check (goal in ('lose', 'maintain', 'gain')),
  bmi numeric(4, 1),
  bmr integer,
  tdee integer,
  daily_calorie_target integer check (daily_calorie_target between 1200 and 6000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists health_goals_one_active_per_user
  on public.health_goals (user_id)
  where is_active;

-- ---------------------------------------------------------------------------
-- food_items (user_id null = curated/global item)
-- ---------------------------------------------------------------------------
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  name_en text,
  category text not null default 'other' check (
    category in (
      'rice', 'noodles', 'soup', 'meat', 'seafood', 'vegetable',
      'fruit', 'dessert', 'drink', 'snack', 'other'
    )
  ),
  serving_label text not null default '1 serving',
  serving_grams numeric(7, 1) not null default 0 check (serving_grams >= 0),
  calories numeric(7, 1) not null check (calories between 0 and 5000),
  protein numeric(6, 1) not null default 0 check (protein >= 0),
  carbs numeric(6, 1) not null default 0 check (carbs >= 0),
  fat numeric(6, 1) not null default 0 check (fat >= 0),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists food_items_global_name_key
  on public.food_items (lower(name))
  where user_id is null;
create index if not exists food_items_name_idx on public.food_items (lower(name));
create index if not exists food_items_category_idx on public.food_items (category);

-- ---------------------------------------------------------------------------
-- meals
-- ---------------------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date, meal_type)
);

create index if not exists meals_user_date_idx on public.meals (user_id, log_date desc);

-- ---------------------------------------------------------------------------
-- food_logs
-- ---------------------------------------------------------------------------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete set null,
  meal_id uuid references public.meals (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name_snapshot text not null,
  servings numeric(5, 1) not null default 1 check (servings > 0),
  calories numeric(7, 1) not null check (calories >= 0),
  protein numeric(6, 1) not null default 0 check (protein >= 0),
  carbs numeric(6, 1) not null default 0 check (carbs >= 0),
  fat numeric(6, 1) not null default 0 check (fat >= 0),
  source text not null default 'manual' check (source in ('manual', 'scan', 'custom')),
  ai_confidence numeric(4, 3) check (ai_confidence between 0 and 1),
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists food_logs_user_date_idx
  on public.food_logs (user_id, log_date desc);
create index if not exists food_logs_meal_idx on public.food_logs (meal_id);
create index if not exists food_logs_food_idx on public.food_logs (food_item_id);

-- ---------------------------------------------------------------------------
-- weight_logs
-- ---------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric(5, 1) not null check (weight_kg between 30 and 300),
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists weight_logs_user_date_idx
  on public.weight_logs (user_id, log_date desc);

-- ---------------------------------------------------------------------------
-- activity_logs
-- ---------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  minutes integer not null check (minutes between 1 and 1440),
  calories_burned integer not null default 0 check (calories_burned >= 0),
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_logs_user_date_idx
  on public.activity_logs (user_id, log_date desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists health_goals_set_updated_at on public.health_goals;
create trigger health_goals_set_updated_at before update on public.health_goals
  for each row execute function public.set_updated_at();

drop trigger if exists food_items_set_updated_at on public.food_items;
create trigger food_items_set_updated_at before update on public.food_items
  for each row execute function public.set_updated_at();

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at before update on public.meals
  for each row execute function public.set_updated_at();

drop trigger if exists food_logs_set_updated_at on public.food_logs;
create trigger food_logs_set_updated_at before update on public.food_logs
  for each row execute function public.set_updated_at();

drop trigger if exists weight_logs_set_updated_at on public.weight_logs;
create trigger weight_logs_set_updated_at before update on public.weight_logs
  for each row execute function public.set_updated_at();

drop trigger if exists activity_logs_set_updated_at on public.activity_logs;
create trigger activity_logs_set_updated_at before update on public.activity_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile row when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.health_goals enable row level security;
alter table public.food_items enable row level security;
alter table public.meals enable row level security;
alter table public.food_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.activity_logs enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- health_goals
drop policy if exists "health_goals_all_own" on public.health_goals;
create policy "health_goals_all_own" on public.health_goals
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- meals
drop policy if exists "meals_all_own" on public.meals;
create policy "meals_all_own" on public.meals
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- food_logs
drop policy if exists "food_logs_all_own" on public.food_logs;
create policy "food_logs_all_own" on public.food_logs
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- weight_logs
drop policy if exists "weight_logs_all_own" on public.weight_logs;
create policy "weight_logs_all_own" on public.weight_logs
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- activity_logs
drop policy if exists "activity_logs_all_own" on public.activity_logs;
create policy "activity_logs_all_own" on public.activity_logs
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- food_items: global rows are readable by everyone, writes are owner-only
drop policy if exists "food_items_select" on public.food_items;
create policy "food_items_select" on public.food_items
  for select using (user_id is null or (select auth.uid()) = user_id);

drop policy if exists "food_items_insert_own" on public.food_items;
create policy "food_items_insert_own" on public.food_items
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "food_items_update_own" on public.food_items;
create policy "food_items_update_own" on public.food_items
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "food_items_delete_own" on public.food_items;
create policy "food_items_delete_own" on public.food_items
  for delete using ((select auth.uid()) = user_id);
