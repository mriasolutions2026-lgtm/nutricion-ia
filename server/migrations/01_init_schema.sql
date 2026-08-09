-- Enable UUID-OSSP extension for GUID generation
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. ORGANIZATIONS
-- ==========================================
create table if not exists public.organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. USER PROFILES
-- ==========================================
create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    organization_id uuid references public.organizations(id) on delete set null,
    role text not null check (role in ('admin', 'professional', 'patient')) default 'patient',
    name text,
    email text unique,
    sex text check (sex in ('M', 'F')),
    age integer,
    weight numeric(5,2),
    height numeric(5,2),
    target_weight numeric(5,2),
    dislikes text,
    activity_level text,
    diet_type text,
    allergies text[],
    goals text[],
    target_cals integer,
    target_protein integer,
    target_carbs integer,
    target_fat integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. PROFESSIONALS
-- ==========================================
create table if not exists public.professionals (
    id uuid primary key references public.user_profiles(id) on delete cascade,
    specialty text default 'General',
    license_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. PATIENTS
-- ==========================================
create table if not exists public.patients (
    id uuid primary key references public.user_profiles(id) on delete cascade,
    professional_id uuid references public.professionals(id) on delete set null,
    clinical_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5. NUTRITION LOGS (Flexible Unified Logs)
-- ==========================================
create table if not exists public.nutrition_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    date date not null default current_date,
    type text not null check (type in ('meal', 'hydration', 'weight', 'body_measurement', 'supplement', 'activity', 'metric')),
    payload jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on user_id and date for fast searches
create index if not exists idx_nutrition_logs_user_date on public.nutrition_logs(user_id, date);

-- ==========================================
-- 6. SUBSCRIPTIONS
-- ==========================================
create table if not exists public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    plan_tier text not null check (plan_tier in ('free', 'premium', 'enterprise')) default 'free',
    status text not null check (status in ('active', 'canceled', 'past_due')) default 'active',
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 7. USAGE LIMITS
-- ==========================================
create table if not exists public.usage_limits (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    plan_tier text not null default 'free',
    daily_ai_consults_limit integer not null default 10,
    monthly_ai_consults_limit integer not null default 300,
    image_analysis_limit integer not null default 4, -- 4 daily image analyses (free tier restriction)
    pdf_generation_limit integer not null default 1,  -- 1 monthly report PDF (free tier restriction)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 8. AI AUDIT LOGS
-- ==========================================
create table if not exists public.ai_requests (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.user_profiles(id) on delete set null,
    prompt text not null,
    model_requested text not null,
    tokens_estimated integer,
    cost_estimated numeric(8,6),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ai_responses (
    id uuid primary key default uuid_generate_v4(),
    ai_request_id uuid not null references public.ai_requests(id) on delete cascade,
    response_text text,
    model_used text,
    is_fallback_applied boolean default false,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.medical_validations (
    id uuid primary key default uuid_generate_v4(),
    ai_response_id uuid not null references public.ai_responses(id) on delete cascade,
    is_approved boolean default true,
    risk_detected boolean default false,
    risk_details text,
    validation_override_text text,
    validated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.patients enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_limits enable row level security;
alter table public.ai_requests enable row level security;
alter table public.ai_responses enable row level security;
alter table public.medical_validations enable row level security;

-- Drop existing policies if they exist (to prevent creation errors)
drop policy if exists "Users can view their own organization" on public.organizations;
drop policy if exists "Users can view their own profile" on public.user_profiles;
drop policy if exists "Users can update their own profile" on public.user_profiles;
drop policy if exists "Professionals can view assigned patient profiles" on public.user_profiles;
drop policy if exists "Patients can view their professional's profile" on public.user_profiles;
drop policy if exists "Users can manage their own nutrition logs" on public.nutrition_logs;
drop policy if exists "Professionals can view their patient logs" on public.nutrition_logs;
drop policy if exists "Users can view their own plan limits" on public.usage_limits;

-- 1. Organizations Policies
create policy "Users can view their own organization" on public.organizations
    for select using (
        exists (
            select 1 from public.user_profiles
            where user_profiles.organization_id = organizations.id
              and user_profiles.id = auth.uid()
        )
    );

-- 2. User Profiles Policies
create policy "Users can view their own profile" on public.user_profiles
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
    for update using (auth.uid() = id);

create policy "Professionals can view assigned patient profiles" on public.user_profiles
    for select using (
        exists (
            select 1 from public.patients
            where patients.id = user_profiles.id
              and patients.professional_id = auth.uid()
        )
    );

create policy "Patients can view their professional's profile" on public.user_profiles
    for select using (
        exists (
            select 1 from public.patients
            where patients.professional_id = user_profiles.id
              and patients.id = auth.uid()
        )
    );

-- 3. Nutrition Logs Policies
create policy "Users can manage their own nutrition logs" on public.nutrition_logs
    for all using (auth.uid() = user_id);

create policy "Professionals can view their patient logs" on public.nutrition_logs
    for select using (
        exists (
            select 1 from public.patients
            where patients.id = nutrition_logs.user_id
              and patients.professional_id = auth.uid()
        )
    );

-- 4. Subscriptions and Limits Policies
create policy "Users can view their own plan limits" on public.usage_limits
    for select using (auth.uid() = user_id);

-- ==========================================
-- AUTOMATION TRIGGER FOR SIGNUPS
-- ==========================================

-- Drop trigger and function if they already exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Trigger function to automatically create profile and limits on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
    target_role text;
begin
    target_role := coalesce(new.raw_user_meta_data->>'role', 'patient');

    insert into public.user_profiles (id, email, name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
        target_role
    );
    
    -- Insert specific role record
    if target_role = 'professional' then
        insert into public.professionals (id, specialty) values (new.id, 'General');
    elsif target_role = 'patient' then
        insert into public.patients (id) values (new.id);
    end if;

    -- Create default usage limits (4 daily image analyses, 10 daily chats, 1 monthly report PDF)
    insert into public.usage_limits (user_id, plan_tier, daily_ai_consults_limit, monthly_ai_consults_limit, image_analysis_limit, pdf_generation_limit)
    values (new.id, 'free', 10, 300, 4, 1);

    return new;
end;
$$ language plpgsql security definer;

-- Bind the trigger to auth.users table
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==========================================
-- 9. SCHEMA GRANTS (Ensures anon and authenticated roles have table access)
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_logs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_limits TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_requests TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_responses TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_validations TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
