-- ==========================================
-- MIGRATION 02: VOICE ENTRY TABLES & RLS
-- ==========================================

create extension if not exists "uuid-ossp";

-- 1. FOOD ENTRIES (Botón 1 — Comidas y Bebidas por Voz)
create table if not exists public.food_entries (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    food_name text not null,
    quantity numeric(8,2) default 1,
    unit text default 'porción',
    meal_type text default 'almuerzo',
    calories integer default 0,
    protein_g numeric(6,2) default 0,
    carbs_g numeric(6,2) default 0,
    fat_g numeric(6,2) default 0,
    source_transcript text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WEARABLE METRICS (Botón 2 — Métricas deportivas / Wearables)
create table if not exists public.wearable_metrics (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    metric_type text not null,
    value numeric(10,2) not null,
    unit text default '',
    recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
    source_transcript text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ASSISTANT CONVERSATIONS (Botón 3 — Asistente Conversacional Nutri)
create table if not exists public.assistant_conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    user_message text not null,
    assistant_response text not null,
    in_scope boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. VOICE FAILURES (Auditoría de fallos de procesamiento de voz)
create table if not exists public.voice_failures (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    endpoint_type text not null,
    raw_audio_data text,
    source_transcript text,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ÍNDICES COMPUESTOS (user_id + created_at)
-- ==========================================
create index if not exists idx_food_entries_user_created on public.food_entries(user_id, created_at);
create index if not exists idx_wearable_metrics_user_created on public.wearable_metrics(user_id, created_at);
create index if not exists idx_assistant_conversations_user_created on public.assistant_conversations(user_id, created_at);
create index if not exists idx_voice_failures_user_created on public.voice_failures(user_id, created_at);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.food_entries enable row level security;
alter table public.wearable_metrics enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.voice_failures enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can manage their own food entries" on public.food_entries;
drop policy if exists "Users can manage their own wearable metrics" on public.wearable_metrics;
drop policy if exists "Users can manage their own assistant conversations" on public.assistant_conversations;
drop policy if exists "Users can manage their own voice failures" on public.voice_failures;

create policy "Users can manage their own food entries" on public.food_entries
    for all using (auth.uid() = user_id);

create policy "Users can manage their own wearable metrics" on public.wearable_metrics
    for all using (auth.uid() = user_id);

create policy "Users can manage their own assistant conversations" on public.assistant_conversations
    for all using (auth.uid() = user_id);

create policy "Users can manage their own voice failures" on public.voice_failures
    for all using (auth.uid() = user_id);

-- ==========================================
-- PERMISOS DE TABLAS
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_entries TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wearable_metrics TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_conversations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_failures TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
