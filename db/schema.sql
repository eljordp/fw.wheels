-- ============================================================================
-- FW Wheels — Admin Portal schema
-- Postgres / Supabase. Run via: psql "$DB_URL" -f db/schema.sql
-- Safe to re-run (idempotent-ish: IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ADMIN ALLOWLIST  (who may log into the portal)
-- Auth itself is Supabase Auth (email magic link / password). This table
-- gates which authenticated users get admin access. Owners: Enay, Fardeen.
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  role        text not null default 'owner',   -- owner | staff
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS  (a wheel model OR an accessory)
-- ---------------------------------------------------------------------------
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,           -- e.g. 'ah01', 'lug-nuts-black'
  kind          text not null default 'wheel',  -- wheel | accessory
  brand         text,                           -- Aodhan | Mflow Racing | Vors  (null for accessories)
  series        text,                           -- 'AH Series — Classic Multi-Spoke'
  name          text not null,                  -- 'AODHAN AH01'
  center_bore   text,                           -- '73.1mm'
  price_range   text,                           -- display string '$162 – $237 /wheel'
  images        jsonb not null default '[]',    -- array of image URLs
  -- accessory-only fields:
  acc_price     numeric(10,2),                  -- flat price for accessories
  acc_pack      text,                           -- 'Set of 20'
  acc_desc      text,
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_kind_idx on products (kind);
create index if not exists products_brand_idx on products (brand);

-- ---------------------------------------------------------------------------
-- PRODUCT VARIANTS  (a model + size = the real SKU / inventory unit)
-- price lives here (SIZE_PRICING). finishes/bolt/offsets describe the size.
-- ---------------------------------------------------------------------------
create table if not exists product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  size           text not null,                  -- '18x9.5'
  price          numeric(10,2) not null,         -- per-wheel price
  finishes       jsonb not null default '[]',    -- ['Gloss Black', ...]
  bolt_patterns  jsonb not null default '[]',    -- ['5x100','5x114.3']
  offsets        jsonb not null default '[]',    -- ['+30','+35']
  bolt_offsets   jsonb,                          -- { '5x112': ['+12',...] } optional
  bolt_configs   jsonb,                          -- [{bolt,offset,cb}] source-of-truth fitment (Enay inventory)
  price_overrides jsonb,                         -- { 'Gold Vacuum (PVD)': { '19x9.5': 337 } } finish-level price
  image          text,
  stock          int not null default 0,         -- units on hand (per size)
  low_stock_at   int not null default 4,         -- threshold for low-stock alert
  track_stock    boolean not null default false, -- if false, treated as always available
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (product_id, size)
);
create index if not exists variants_product_idx on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- CUSTOMERS  (deduped by email, built from orders)
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  phone         text,
  city          text,
  state         text,
  total_spent   numeric(12,2) not null default 0,
  orders_count  int not null default 0,
  first_order_at timestamptz,
  last_order_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS  (one row per completed Stripe checkout)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_payment_id text,
  customer_id       uuid references customers(id) on delete set null,
  email             text,
  customer_name     text,
  phone             text,
  amount_total      numeric(10,2) not null default 0,  -- dollars, incl tax/ship
  amount_subtotal   numeric(10,2),
  amount_tax        numeric(10,2),
  amount_shipping   numeric(10,2),
  currency          text not null default 'usd',
  payment_status    text,                              -- paid | unpaid
  fulfillment_status text not null default 'new',      -- new | processing | shipped | delivered | canceled | refunded
  ship_address      jsonb,
  tracking_number   text,
  carrier           text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_fulfillment_idx on orders (fulfillment_status);
create index if not exists orders_email_idx on orders (email);

-- ---------------------------------------------------------------------------
-- ORDER ITEMS  (line items, snapshotted at purchase time)
-- ---------------------------------------------------------------------------
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_slug text,
  name         text not null,
  product_type text,            -- wheel | accessory
  size         text,
  finish       text,
  bolt_config  text,
  unit_price   numeric(10,2) not null default 0,
  qty          int not null default 1,
  line_total   numeric(10,2) not null default 0,
  image        text
);
create index if not exists order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- EVENTS  (analytics funnel: page_view, product_view, add_to_cart,
--          begin_checkout, purchase, fitment_search)
-- ---------------------------------------------------------------------------
create table if not exists events (
  id          bigserial primary key,
  type        text not null,
  session_id  text,             -- anonymous browser session
  path        text,
  referrer    text,
  product_slug text,
  size        text,
  value       numeric(10,2),    -- $ value when relevant (cart/checkout/purchase)
  meta        jsonb,            -- extra: search query, finish, utm, etc.
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists events_type_idx on events (type);
create index if not exists events_created_idx on events (created_at desc);
create index if not exists events_session_idx on events (session_id);
create index if not exists events_product_idx on events (product_slug);

-- ---------------------------------------------------------------------------
-- SETTINGS  (key/value for SEO + store config editable from admin)
-- ---------------------------------------------------------------------------
create table if not exists settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Storefront uses the ANON key (read products/variants, insert events/orders
-- via server only). Admin reads/writes everything via authenticated session
-- gated by admin_users. Writes that must stay server-only use service_role,
-- which bypasses RLS entirely.
-- ============================================================================
alter table products          enable row level security;
alter table product_variants  enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table customers         enable row level security;
alter table events            enable row level security;
alter table settings          enable row level security;
alter table admin_users       enable row level security;

-- helper: is the current authed user an allowlisted admin?
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- PUBLIC STOREFRONT READS (anon): only active catalog
drop policy if exists "public read active products" on products;
create policy "public read active products" on products
  for select using (active = true);

drop policy if exists "public read active variants" on product_variants;
create policy "public read active variants" on product_variants
  for select using (active = true);

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings
  for select using (true);

-- ANALYTICS: anyone (anon) may insert an event, nobody may read except admin
drop policy if exists "anon insert events" on events;
create policy "anon insert events" on events
  for insert with check (true);

drop policy if exists "admin read events" on events;
create policy "admin read events" on events
  for select using (is_admin());

-- ADMIN FULL ACCESS on the management tables
do $$
declare t text;
begin
  foreach t in array array['products','product_variants','orders','order_items','customers','settings','admin_users','events']
  loop
    execute format('drop policy if exists "admin all %1$s" on %1$s;', t);
    execute format($f$create policy "admin all %1$s" on %1$s for all using (is_admin()) with check (is_admin());$f$, t);
  end loop;
end $$;

-- updated_at trigger
create or replace function touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on products;
create trigger products_touch before update on products
  for each row execute function touch_updated_at();

drop trigger if exists orders_touch on orders;
create trigger orders_touch before update on orders
  for each row execute function touch_updated_at();
