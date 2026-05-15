-- ApexAI Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Portfolios table
create table if not exists public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text default 'My Portfolio',
  holdings jsonb default '[]',
  total_value numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI analyses table
create table if not exists public.ai_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  analysis text,
  health_score integer,
  risk_level text,
  sentiment text,
  created_at timestamptz default now()
);

-- Watchlists table
create table if not exists public.watchlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  coin_id text not null,
  coin_name text,
  coin_symbol text,
  added_at timestamptz default now()
);

-- Contact messages table
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.watchlists enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own portfolios" on public.portfolios for select using (auth.uid() = user_id);
create policy "Users can insert own portfolios" on public.portfolios for insert with check (auth.uid() = user_id);
create policy "Users can update own portfolios" on public.portfolios for update using (auth.uid() = user_id);
create policy "Users can delete own portfolios" on public.portfolios for delete using (auth.uid() = user_id);

create policy "Users can view own analyses" on public.ai_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.ai_analyses for insert with check (auth.uid() = user_id);

create policy "Users can manage own watchlist" on public.watchlists for all using (auth.uid() = user_id);

-- Contact messages: service role only
create policy "Service role only" on public.contact_messages for all using (false);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
