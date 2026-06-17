-- FW Wheels contacts: every buyer (from Stripe) + every signup (from forms).
-- One table to back the Owner Admin > Contacts tab.

create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  source text,                              -- 'stripe', 'website', 'sms', 'manual', etc.
  total_spent numeric(10,2) not null default 0,
  order_count int not null default 0,
  sms_opt_in boolean not null default false,
  email_opt_in boolean not null default true,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- An email or phone is required; one of them must be present and unique.
create unique index if not exists contacts_email_unique on contacts (lower(email)) where email is not null;
create unique index if not exists contacts_phone_unique on contacts (phone) where phone is not null;
create index if not exists contacts_created_at_idx on contacts (created_at desc);

alter table contacts enable row level security;

-- Service role does everything. No anon access (the admin API uses service role,
-- the public /api/subscribe endpoint runs server-side with service role too).
revoke all on contacts from anon;
revoke all on contacts from authenticated;
grant all on contacts to service_role;

-- Trigger: keep updated_at fresh
create or replace function contacts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists contacts_set_updated_at on contacts;
create trigger contacts_set_updated_at
  before update on contacts
  for each row execute function contacts_set_updated_at();

-- RPC called by the Stripe webhook to record a buyer and credit them.
-- Adds total_spent_delta to total_spent, increments order_count, and merges
-- in any new contact details (name/phone) we got from Stripe.
create or replace function record_buyer_contact(
  email text default null,
  phone text default null,
  first_name text default null,
  last_name text default null,
  source text default 'stripe',
  total_spent_delta numeric default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(trim(lower(coalesce(email, ''))), '');
  v_phone text := nullif(trim(coalesce(phone, '')), '');
begin
  if v_email is null and v_phone is null then return; end if;

  insert into contacts (email, phone, first_name, last_name, source, total_spent, order_count)
  values (v_email, v_phone, first_name, last_name, source, total_spent_delta, 1)
  on conflict (lower(email)) where email is not null do update set
    phone        = coalesce(contacts.phone, excluded.phone),
    first_name   = coalesce(contacts.first_name, excluded.first_name),
    last_name    = coalesce(contacts.last_name, excluded.last_name),
    total_spent  = contacts.total_spent + total_spent_delta,
    order_count  = contacts.order_count + 1,
    updated_at   = now();
end;
$$;
grant execute on function record_buyer_contact(text, text, text, text, text, numeric) to service_role;
