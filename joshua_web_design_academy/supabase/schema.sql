create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  amount numeric(10,2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

-- The browser never connects directly to this table.
-- Netlify Functions use the service-role key, kept only in Netlify environment variables.
-- Do not expose the service-role key in frontend code.
