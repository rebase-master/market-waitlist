-- Amanah waitlist — initial schema.
-- Apply:  supabase db push        (Supabase CLI, reads this folder)
--   or:   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
--
-- One table captures market-appetite signups for a Shariah-compliant financing
-- product. Design rationale lives inline as COMMENT ON, so the schema documents
-- itself for whoever reads it next.

-- ── Enums ────────────────────────────────────────────────────────────────────

-- How the signup says they found us (self-reported; UTMs below capture the link side).
create type referral_source as enum (
  'friend_family', 'facebook', 'instagram', 'tiktok', 'search', 'news', 'other'
);

-- What they would use financing for. Asset/service-backed ONLY: a Murabaha
-- (cost-plus asset sale) product cannot honestly offer cash. Optional on the form,
-- captured as a demand-measurement signal.
create type financing_purpose as enum (
  'electronics', 'home_appliances', 'furniture', 'education', 'medical', 'vehicle', 'other'
);

-- ── Table ────────────────────────────────────────────────────────────────────

create table waitlist_signups (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null check (char_length(full_name) between 2 and 120),

  -- Contact: email OR phone (at least one, enforced below). Phone is the primary
  -- identity for Egypt's underbanked — mobile-money accounts outnumber bank
  -- accounts — so requiring email would filter out the exact segment being tested.
  email             text check (email = lower(email)),          -- route lowercases; this is a backstop
  phone             text check (phone ~ '^\+[1-9][0-9]{7,14}$'), -- E.164; app normalizes Egyptian forms to +20…

  referral_source   referral_source not null,
  financing_purpose financing_purpose,                 -- optional intent signal
  market            char(2) not null default 'EG',     -- ISO 3166-1 alpha-2; one table serves N market pages

  -- Referral loop (Egypt is WhatsApp-default). ref_code is this signup's own share
  -- code; referred_by is the ref_code that sent them here. The default mints an
  -- 8-char code; the route retries the insert on the (rare) ref_code collision.
  ref_code          text not null unique default upper(substr(gen_random_uuid()::text, 1, 8)),
  referred_by       text,

  -- Attribution: what the user says (referral_source) vs what the link says (UTMs).
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,

  created_at        timestamptz not null default now(),

  constraint contact_required check (email is not null or phone is not null)
);

comment on table  waitlist_signups is 'Market-appetite signups for a Shariah-compliant financing product. Written only by the server route via the service-role key; RLS denies all anon/authenticated access.';
comment on column waitlist_signups.phone is 'E.164. The app normalizes Egyptian mobile forms (010/011/012/015, leading-0, +20, 0020) before insert.';
comment on column waitlist_signups.financing_purpose is 'Optional demand-measurement signal; asset/service-backed values only (Murabaha-appropriate).';
comment on column waitlist_signups.ref_code is 'This signup''s own share code, used in the WhatsApp ?ref= link.';
comment on column waitlist_signups.referred_by is 'The ref_code of the signup that referred this one. Unvalidated by design — attribution only, never trusted as core data.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Dedupe email/phone without fighting NULLs. Two partial unique indexes cannot
-- share a single ON CONFLICT arbiter, so the route INSERTs and branches on the
-- 23505 constraint name (email|phone -> return existing ref_code; ref_code -> retry).
create unique index waitlist_email_uniq on waitlist_signups (email) where email is not null;
create unique index waitlist_phone_uniq on waitlist_signups (phone) where phone is not null;

create index waitlist_market_created_idx on waitlist_signups (market, created_at);
create index waitlist_referred_by_idx    on waitlist_signups (referred_by);

-- ── Row Level Security: deny-all ─────────────────────────────────────────────
-- Enable RLS with NO policies: anon and authenticated roles are fully denied.
-- The server route uses the service-role key, which bypasses RLS. The anon key
-- (shipped to the browser) can never read or write this table.
alter table waitlist_signups enable row level security;

-- ── Reporting view (kept out of the anon-exposed API) ────────────────────────
-- A plain view runs with owner privileges and does NOT inherit the table's RLS,
-- and Supabase auto-publishes public-schema views over the anon REST API — which
-- would leak aggregate demand counts to anyone holding the anon key. Placing it in
-- a non-exposed schema keeps PostgREST from serving it; read it from the SQL editor
-- or a service-role connection.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create view private.demand_report as
  select
    market,
    financing_purpose,
    referral_source,
    utm_source,
    count(*)                                        as signups,
    count(*) filter (where referred_by is not null) as referred_signups,
    min(created_at)                                 as first_seen,
    max(created_at)                                 as last_seen
  from waitlist_signups
  group by market, financing_purpose, referral_source, utm_source;

comment on view private.demand_report is 'Demand sliced by the axes growth measures. Lives in a non-exposed schema so it is never served over the anon REST API.';
