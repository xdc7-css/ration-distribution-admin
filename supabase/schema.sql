create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_code text not null unique,
  family_name text not null,
  members_count integer not null check (members_count > 0),
  phone text,
  area text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null,
  default_quantity numeric(12,2) not null check (default_quantity >= 0),
  calculation_type text not null check (calculation_type in ('per_person', 'per_family')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_distributions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete restrict,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  members_count_at_delivery integer not null check (members_count_at_delivery > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, month, year)
);

create table if not exists public.monthly_distribution_items (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.monthly_distributions(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  item_name_snapshot text not null,
  unit_snapshot text not null,
  calculation_type_snapshot text not null check (calculation_type_snapshot in ('per_person', 'per_family')),
  default_quantity_snapshot numeric(12,2) not null,
  calculated_quantity numeric(12,2) not null check (calculated_quantity >= 0),
  delivered_quantity numeric(12,2) not null check (delivered_quantity >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_families_code on public.families (family_code);
create index if not exists idx_families_name on public.families using gin (to_tsvector('simple', family_name));
create index if not exists idx_monthly_distributions_family on public.monthly_distributions (family_id);
create index if not exists idx_monthly_distributions_month_year on public.monthly_distributions (month, year);
create index if not exists idx_distribution_items_distribution_id on public.monthly_distribution_items (distribution_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_families_updated_at
before update on public.families
for each row execute procedure public.set_updated_at();

create or replace trigger trg_items_updated_at
before update on public.items
for each row execute procedure public.set_updated_at();

create or replace trigger trg_monthly_distributions_updated_at
before update on public.monthly_distributions
for each row execute procedure public.set_updated_at();

create or replace view public.monthly_distribution_items_view as
select
  mdi.item_name_snapshot,
  sum(mdi.delivered_quantity) as delivered_total,
  md.month,
  md.year
from public.monthly_distribution_items mdi
join public.monthly_distributions md on md.id = mdi.distribution_id
group by mdi.item_name_snapshot, md.month, md.year;

alter table public.families enable row level security;
alter table public.items enable row level security;
alter table public.monthly_distributions enable row level security;
alter table public.monthly_distribution_items enable row level security;

create policy "admin authenticated can manage families"
on public.families
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "admin authenticated can manage items"
on public.items
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "admin authenticated can manage monthly distributions"
on public.monthly_distributions
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "admin authenticated can manage monthly distribution items"
on public.monthly_distribution_items
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
