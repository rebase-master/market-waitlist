# Amanah — Shariah-compliant financing waitlist (Egypt)

A standalone, SEO-discoverable waitlist page that tests appetite for a **halal, interest-free
financing product in Egypt**. Independent of any main app: a fast, mobile-first Next.js page that
captures qualified signups and writes them to Postgres (Supabase).

<img src="docs/preview-desktop.png" alt="Amanah waitlist landing page" width="100%">

<p align="center"><img src="docs/preview.png" alt="Amanah waitlist on mobile" width="300"></p>

> **Design note:** the palette (periwinkle base, black ink, iridescent aurora accent) and type
> (Outfit + Inter) are matched to [Mal](https://mal.ai/)'s brand — palette only, original wordmark,
> no Mal assets. Details in [`DESIGN.md`](DESIGN.md).

---

## Why Egypt

Mal is Abu-Dhabi-based with a stated Middle-East rollout, so Egypt is the market you'd realistically
enter next: ~110M people, majority-Muslim, two-thirds of adults without formal credit access, mature
mobile-money rails (Vodafone Cash, InstaPay, Fawry), and consumer-lending fintechs (valU, Sympl,
MNT-Halan) already scaling — with Shariah-compliant financing the under-served flank. Full market and
SEO reasoning is in [`docs/PART2.md`](docs/PART2.md).

## Stack & rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router, TS) | SSG gives crawlable HTML + fast mobile load with no client framework tax |
| Styling | **Tailwind CSS v4** | Token-driven, zero runtime CSS |
| Database | **Supabase (Postgres)** | Managed Postgres + REST; the migration is plain SQL, portable to any Postgres |
| Validation | **Zod** + a pure phone normalizer | One shared module for client and server, unit-tested |
| Tests | **Vitest** | Fast, covers the validation + DB-error logic (the write path's heart) |
| Hosting | **Vercel** | First-class Next.js SSR/SSG + serverless routes |

**Rendering:** the page is statically prerendered; the only server code is one route handler
(`POST /api/waitlist`). This is what carries the Lighthouse mobile target (≥ 85; the production
build is fully static, ~119 kB first load). The build intentionally does **not** use
`output: 'export'`, which would drop the API route.

## Quick start

**Prerequisites:** Node 20+, npm, and a free [Supabase](https://supabase.com) project.

```bash
# 1. install
npm install

# 2. configure — copy the template and fill in your Supabase values
cp .env.example .env.local

# 3. run
npm run dev            # http://localhost:3000

# tests / checks
npm test               # 36 Vitest cases
npm run typecheck
npm run build          # production build
```

### Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Service-role / "secret" key. Bypasses RLS; used only by the API route. Never expose it. |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical origin for metadata / OG / (upcoming) sitemap. No trailing slash. |

> Supabase renamed its keys: the **"Secret key"** (`sb_secret_…`) is the value for
> `SUPABASE_SERVICE_ROLE_KEY`. Ignore the "Publishable" (anon) key — the app never uses it, because
> all database access is server-side.

## Database

One table, `waitlist_signups`, captures: full name, **email or phone** (at least one — phone is the
primary identity for Egypt's underbanked), self-reported referral source, an **optional intent
signal** (`financing_purpose`, asset-backed values only), `market`, a **referral code + referrer**
(`ref_code` / `referred_by`) for a WhatsApp share loop, UTM columns, and a timestamp. Security is
**Row Level Security with deny-all** — the browser's anon key can never touch the table; the server
route writes with the service-role key. A `demand_report` view (in a non-exposed `private` schema, so
it can't leak over the anon REST API) slices signups by the axes growth cares about.

Full, self-documenting DDL: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

### Applying the migration

**Option A — Supabase SQL Editor (simplest):** paste the contents of
`supabase/migrations/0001_init.sql` into a new query and Run.

**Option B — Supabase CLI:**
```bash
supabase link --project-ref <your-ref>
supabase db push
```

**Option C — psql:**
```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

Read the demand report (SQL Editor or a service-role connection):
```sql
select * from private.demand_report;
```

## Deployment (Vercel)

1. Import the GitHub repo into Vercel (framework auto-detected as Next.js).
2. Add the three env vars above under **Settings → Environment Variables** (server scope for the
   secret key). Set `NEXT_PUBLIC_SITE_URL` to the deployed origin.
3. Deploy. Smoke-test a real signup against the **live** URL (not localhost), then check the row in
   Supabase.

## SEO

Descriptive `<title>` + meta description, OpenGraph/Twitter cards, and `metadataBase`-driven
canonical are in [`app/layout.tsx`](app/layout.tsx). Structured data (`Organization` + `WebPage`
JSON-LD), `sitemap.ts`, `robots.ts`, and the Arabic `/ar` route with `hreflang` are the next commits
(see below). `FAQPage` markup is deliberately omitted — Google restricted FAQ rich results to
gov/health in 2023 — but the FAQ content stays for long-tail relevance.

## Project structure

```
app/
  layout.tsx           # fonts (Outfit/Inter) + SEO metadata
  page.tsx             # the waitlist page (hero, form, trust strip, FAQ)
  globals.css          # Tailwind v4 + Mal-matched design tokens
  api/waitlist/route.ts# POST endpoint: validate → insert → constraint-aware dedupe
components/
  waitlist-form.tsx    # form island: states, honeypot, WhatsApp share
lib/
  validation.ts        # shared Zod schema + Egyptian phone normalizer
  db-errors.ts         # 23505 constraint classifier
  supabase.ts          # server-only service-role client
  *.test.ts            # 36 Vitest cases
supabase/migrations/
  0001_init.sql        # schema + RLS + demand_report view + grants
DESIGN.md              # design system (tokens, type, rules)
```

## Build status

Scaffold + schema + validation + page/form + API route are in and verified (build passes, 36 tests
green). Still landing: SEO structured data + `sitemap.ts`/`robots.ts`, the Arabic `/ar` route, and
the Vercel deploy. Tracked as the checklist below.

## License

MIT (placeholder — this is an assessment project).
