# Amanah — Architecture, SEO Strategy & Trade-offs

**Market: Egypt** · Live: [market-waitlist.vercel.app](https://market-waitlist.vercel.app) ([/ar](https://market-waitlist.vercel.app/ar)) · Repo: [github.com/rebase-master/market-waitlist](https://github.com/rebase-master/market-waitlist)

The premise behind every decision: **this page is a measurement instrument, not a funnel** — the goal isn't maximum signups but signups we can segment, attribute, and act on.

## Section 1 — Data Model & Page Architecture

**Why these fields.** One table, `waitlist_signups`; every column answers a growth question:

- `email` **or** `phone` (CHECK ≥1) — *are we reaching the underbanked?* Phone is primary identity in Egypt; requiring email would filter out the segment being tested. Phones normalized to E.164.
- `financing_purpose` (optional enum) — *what would they finance?* Asset-backed values only (a Murabaha product sells assets, not cash); the mix decides which category launches first. Optional, so intent never costs conversion.
- `referral_source` + UTM columns — *which channel works?* Self-reported vs. link-declared attribution triangulate real vs. perceived channel value.
- `ref_code` / `referred_by` — *is it viral?* Every signup gets a share code; referred signups record who sent them — raw material for a K-factor.
- `market` (default `EG`) + `created_at` — one table serves N markets; per-market cohorts and velocity.

A `demand_report` view (market × purpose × source × UTM, with referred counts) makes the measurement claim runnable. It lives in a non-exposed `private` schema — plain views don't inherit RLS and Supabase auto-publishes public-schema views over the anon REST API, so demand data would leak. The table itself is RLS deny-all; only the server route writes.

**Extending it.** A second market is a config change, not a migration: new `market` value, new route (§2), and one schema change — the unique indexes on email/phone become composite `(market, email)` / `(market, phone)` so one person can join two waitlists. A second *product* starts as a `product` enum folded into `demand_report`, normalizing into a `products` table only when products carry their own attributes.

**Indexes.** Partial uniques on `email`/`phone` (`WHERE NOT NULL` — dedupe without fighting NULLs; they back the returning-user lookup); unique `ref_code` (share-link resolution); `(market, created_at)` (the most common read: per-market cohorts); `referred_by` (K-factor joins). Nothing else until a query earns it.

**Rendering: SSG.** Both locales are statically prerendered under route-group root layouts (`app/(en)`, `app/(ar)`): `/` ships `<html lang="en" dir="ltr">`, `/ar` ships `lang="ar" dir="rtl"`, all metadata in the `<head>` at build time; the only server code is `POST /api/waitlist`. Why: crawlers get complete HTML from the CDN edge with no JS execution, and low-end Android/3G users get ~0.5s first paint (Lighthouse mobile 100). SSR adds per-request latency for content that changes only at deploys; ISR solves staleness we don't have; CSR hands crawlers an empty shell. Earned lesson: a middleware-based i18n attempt made the layout dynamic and Next *streamed* title/meta into the `<body>`, invisible to head-only crawlers — route groups fixed lang/dir and kept everything static.

## Section 2 — Growth & Organic Discovery Plan (first 30 days, zero budget)

**Keyword rationale: Arabic-first, long-tail-first.** Egyptian consumer-finance demand is searched in Arabic (Google ≈97% share, overwhelmingly mobile). With zero domain authority, head terms — *تمويل حلال*, *تقسيط بدون فوائد* — are unreachable in 30 days; valU, Sympl, and Aman own the *instalment* framing. The 30-day targets:

1. **Purpose long-tail**, mapping 1:1 to the `financing_purpose` enum — *تقسيط موبايل بدون فوائد*, *تمويل أجهزة منزلية*, *تقسيط مصاريف دراسية* — high intent, low competition; the segmentation that runs the product runs the content.
2. **Question queries** the FAQ answers — *هل التقسيط حلال؟* ("is instalment buying halal?") — the Shariah-explicit angle no incumbent owns.
3. **Branded terms** (*أمانة تمويل*) — the off-page moves below seed searches we can rank #1 for in week one.

`/ar` is the canonical spearhead (hand-written MSA, hreflang pair with `/`); English serves the expat/affluent secondary segment.

**Two zero-budget off-page moves.**

1. **MENA startup press + free directories.** Pitch "waitlist testing appetite for Shariah-compliant consumer financing in Egypt" to Wamda, MenaBytes, Waya, StartupScene — pre-launch fintech waitlists are exactly their beat; each pickup is a DA-50+ backlink plus referral traffic that seeds branded search. Same day: free citations on MAGNiTT, Crunchbase, F6S. Fastest legitimate authority a zero-history domain can get.
2. **Community seeding through the built-in WhatsApp loop.** Egypt's money conversations happen in Facebook groups and WhatsApp. Answer real instalment/halal questions in the big personal-finance groups (useful answers, not spam); the success screen does the rest — every signup gets a prefilled Arabic wa.me share carrying `?ref=CODE`, and `referred_by` + UTMs record which community converts. The distribution mechanism ships inside the page.

**Second market without duplicate content.** Market-scoped paths on one domain — `/eg/` + `/eg/ar/`, then `/ma/` + `/ma/ar/` (current routes 301 into `/eg/…`). Paths beat subdomains pre-authority: link equity consolidates on one host while each market×locale keeps its own URL, self-canonical, per-market `<title>`/description, and one hreflang cluster (`ar-EG`, `en-EG`, `ar-MA`, `x-default` → chooser). Duplication is avoided by making pages *substantively* different — rails, currency, purposes, FAQ, and disclaimer are market-specific blocks driven by the dictionary system that runs EN/AR today. One sitemap lists every variant; the DB is ready.

**How I'd know within 2 weeks.** Honestly: rankings for competitive terms won't move in 14 days. What's measurable is indexation health, early impressions, and conversion of seeded traffic:

| Metric | Tool | Healthy by day 14 | Change course if… |
|---|---|---|---|
| URLs indexed | Search Console (sitemap day 0) | Indexed ≤ 7 days | Not by day 7 → fix indexing before anything else |
| Impressions | GSC Performance | Branded present; non-branded > 0 | Zero non-branded → content too thin; deepen FAQ/purpose copy |
| Visitor→signup | Vercel Analytics ÷ `demand_report` | ≥ 8% (waitlist benchmark 10–30%) | < 5% → messaging/form friction, not channels |
| Intent quality | `demand_report` | ≥ 30% include `financing_purpose` | Near-zero → curiosity, not demand; revisit positioning |
| Referral share | `referred ÷ total` | ≥ 15% carry `referred_by` | < 5% → weak share incentive; add position/count |
| Channel mix | `utm_source` split | One source clearly winning | Flat → reallocate seeding weekly to the winner |

## Section 3 — Trade-offs & What I Cut

**Deliberately left out** (each a named next-step in the README): **rate limiting** — real setup; demand numbers are script-inflatable until it lands, and I'd rather name that than hide it. **`referred_by` validation** — a spoofed `?ref` pollutes attribution only. **Admin dashboard** — `demand_report` is queryable; a UI solves a problem we don't have. **OTP verification** — kills waitlist conversion; dedupe + honeypot carry data quality. **i18n framework** — two locales need a typed dictionary. **Full CSP** — needs nonce plumbing; XFO/nosniff/referrer/permissions headers shipped instead.

**If the timeline doubled**, in order: (1) edge rate limit + `referred_by` validation — make the numbers *defensible* before driving traffic; (2) analytics events (signup, share-click, locale) + a `demand.sql` one-pager so growth reads the instrument without me; (3) referral count + position on the success screen — the share button becomes a score; (4) Arabic OG card + native-speaker copy pass.

**50,000 signups in a weekend.** The throughput math is boring on purpose: ~0.3 writes/s average, double-digit peaks — an indexed insert plus one index-backed dedupe SELECT, and the pages are static files on Vercel's CDN, so even millions of *views* never touch compute. What breaks, in order: **(1) trust in the data** — with no rate limit, a viral moment is when the bots arrive and "appetite" stops being defensible; fix with an Upstash sliding-window limit at the edge (~1h) and honeypot-trip monitoring. **(2) Free-tier ceilings, not architecture** — Supabase's micro instance and Vercel Hobby fair-use throttle long before the schema does; upgrade both before the weekend, zero code changes. **(3) `ref_code` collision retries** under burst — bounded at 3 attempts with 8 chars of entropy, a non-event, but log retry counts to see it coming. That was the intent: the boring parts scale, so the first thing at risk is confidence in the numbers — and it's the first thing the roadmap hardens.
