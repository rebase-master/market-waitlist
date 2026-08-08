# Part 2 — Architecture, SEO Strategy & Trade-offs

Market: **Egypt.** It's the market Mal would realistically enter next (Abu-Dhabi HQ, stated
Middle-East rollout), and it turns every abstract decision into a concrete one: ~110M people,
majority-Muslim, roughly two-thirds of adults without formal credit, mature mobile-money rails
(Vodafone Cash, InstaPay, Fawry), and a crowd of consumer-lending fintechs (valU, Sympl, MNT-Halan,
Aman, Contact) already scaling — with *Shariah-compliant* financing the under-served flank.

The single reframe behind every choice below: **this page is a measurement instrument, not a
funnel.** The brief asks us to *test appetite*. So the goal isn't maximum raw signups — it's
signups we can *segment*, *attribute*, and *act on*.

---

## 1. Data model — what growth actually needs to measure

One table, [`waitlist_signups`](../supabase/migrations/0001_init.sql). Every column earns its place
by answering a growth question:

| Column | Growth question it answers |
|--------|----------------------------|
| `email` **OR** `phone` (`CHECK`) | *Are we reaching the underbanked?* Phone is primary identity in Egypt — mobile-money accounts outnumber bank accounts. Requiring email would silently filter out the exact segment we're testing. The phone-vs-email ratio is itself a reach KPI. |
| `financing_purpose` (optional enum) | *What do they actually want to finance?* Asset-backed values only (electronics, appliances, education, medical…) because a Murabaha product sells assets, not cash. The purpose mix tells us **which category to launch first**. |
| `referral_source` (enum) | *Which channel do users say brought them?* The self-reported side of attribution. |
| `utm_source/medium/campaign` | *Which channel actually brought them?* The link side. Self-report and UTM together triangulate real vs perceived channel value. |
| `ref_code` / `referred_by` | *Is this thing viral?* Every signup gets a share code; every referred signup records who sent them. This is the raw material for a K-factor. |
| `market` (default `EG`) | *One table, N markets.* When Mal tests Pakistan or Morocco next, it's a new page and a filter, not a new schema. |
| `created_at` | Cohorting, velocity, decay. |

The design that makes this *usable*, not just *stored*: a **`private.demand_report` view** that rolls
signups up by market × purpose × referral_source × utm_source, with referred-signup counts. It lives
in a non-exposed schema deliberately — a plain Postgres view runs with owner privileges and does
**not** inherit the table's RLS, and Supabase auto-publishes public-schema views over the anon REST
API. In `public` it would leak aggregate demand to anyone with the browser key. In `private` it's a
one-line query for the team and invisible to everyone else.

**Verified live:** phone normalized to E.164 (`01012345670 → +201012345670`), email lowercased,
`market`/`ref_code` defaulted, and the browser's anon key gets `permission denied` on the table
(RLS deny-all). Only the server's secret key writes.

---

## 2. Technical execution

**Architecture (deliberately small).** A server-rendered Next.js page + exactly one serverless
route (`POST /api/waitlist`). (The two localized pages are SSR rather than static-exported so each
locale gets a correct `<html lang>`/`dir` — see the trade-off note below; the HTML is fully crawlable
either way.) No auth, no ORM, no admin app. Supabase Postgres with **RLS deny-all**;
the anon key never touches the DB; the route writes with the service-role key. Validation lives in one
[shared module](../lib/validation.ts) imported by both the client (fast feedback) and the route (the
real boundary) so they can't drift — 36 Vitest cases cover the Egyptian phone normalizer and the
parse logic.

**The one genuinely tricky bit — dedupe.** Three unique constraints can fire `23505` (email, phone,
`ref_code`), so a blanket "duplicate = success" is wrong: a `ref_code` collision would report a
phantom success. The route branches on the constraint — **email/phone → return the *existing*
`ref_code`** (so a returning user's share link is live, and the identical response shape prevents
account enumeration); **`ref_code` → regenerate and retry.** Email is lowercased in the route so the
`CHECK` (which raises `23514`, not `23505`) can never surface as a hard failure. A honeypot field
returns silent success and writes nothing.

**SEO.** SSG gives crawlable HTML with no framework tax. Implemented and verified against the prod
server: descriptive `<title>` + meta description, OpenGraph/Twitter, `metadataBase` canonical, a
single `Organization` + `WebPage` JSON-LD block (`areaServed: Egypt` — deliberately **not**
`FinancialService`, which would over-claim a licence the disclaimer denies), `sitemap.xml`,
`robots.txt`, and a bilingual **`hreflang`** pair. `FAQPage` markup is omitted on purpose — Google
restricted FAQ rich results to gov/health in 2023 — but the FAQ content stays for long-tail.

**Performance.** ~119 kB first load, two subset fonts (`next/font`), zero hero images, CSS-only
gradients, server-rendered crawlable HTML. That's what carries the Lighthouse mobile target with room
to spare, on the low-end Android + patchy-3G reality of the target user.

**Bilingual.** A dictionary-driven page renders both `/` (English) and `/ar` (Arabic, RTL) from one
set of components — direction via `dir` + CSS logical properties, no duplicated CSS. More on why
that's a *growth* decision, not a nicety, below.

---

## 3. SEO & growth strategy for Egypt (concrete, measurable)

**Premise: in Egypt, the demand is Arabic.** Google has ~95%+ search share, traffic is
overwhelmingly mobile, and consumer-finance intent is searched in Arabic — often Egyptian-dialect
phrasing, not formal MSA. An English-only page optimising for "halal loan Egypt" is fishing in a
puddle. So the single highest-leverage SEO move is **shipping Arabic as a real, indexable route with
`hreflang`** — which is done, not promised.

**Keyword strategy (head → long-tail):**

- **Arabic head terms:** *تمويل حلال* (halal financing), *تمويل بدون فوائد* (interest-free financing),
  *تمويل إسلامي* (Islamic financing), *تقسيط بدون فوائد* (interest-free instalments). These are where
  valU / Sympl / Aman compete on the *instalment* framing; the open flank is the explicit
  **Shariah/halal** angle.
- **Purpose long-tail (high intent, low competition):** *تقسيط موبايل بدون فوائد* (phone instalments,
  no interest), *تمويل أجهزة كهربائية*, *تمويل مصاريف دراسية* (tuition financing). These map 1:1 to the
  `financing_purpose` enum — the same segmentation that runs the product roadmap runs the content
  roadmap.
- **English secondary:** expat / higher-income segment and brand terms. Lower volume, higher ARPU.

**Technical SEO roadmap** (beyond what's shipped): Arabic-first content depth per purpose category
(a thin waitlist page ranks for nothing long-term — it needs "how halal financing works" explainer
content in Arabic), `Article`/`BreadcrumbList` schema as content grows, Core Web Vitals held green as
features land, and an Arabic OG card so social shares render in-language.

**Channels — because SEO alone is slow, and the brief is about appetite *now*:**

- **The WhatsApp referral loop is the built-in growth engine.** Egypt is WhatsApp-default; the success
  screen hands each signup a prefilled bilingual share link carrying their `ref_code`. `referred_by`
  makes it *measured*, not hoped-for.
- **Paid social where Egypt actually is:** Facebook (still dominant), TikTok (fastest-growing, ideal
  for short "no-riba financing" explainers), Instagram. Every ad link carries UTMs → `utm_source` →
  the `demand_report` view. We'll know within a week which channel delivers *segmentable* demand, not
  just clicks.

**The measurement plan — first 4 weeks, concrete KPIs:**

| KPI | Why it matters | How it's captured |
|-----|----------------|-------------------|
| Signups by `utm_source` × `financing_purpose` | Which channel brings which demand | `demand_report` view |
| Blended cost per *qualified* signup | Efficiency, per channel | ad spend ÷ signups per UTM |
| Referral K-factor (`referred_signups` ÷ total) | Is it organically viral? | `referred_by` non-null share |
| Purpose mix | **Which asset category to launch first** | `financing_purpose` distribution |
| `/ar` vs `/` traffic + conversion | In-market PMF signal | analytics + `inLanguage` |
| Phone-vs-email ratio | Underbanked reach | `phone`/`email` null pattern |

Success at 4 weeks isn't "N signups." It's a defensible answer to: *which market segment, reached via
which channel, wants which product — and does it spread on its own?*

**Trust as a growth lever.** For a lending product the honest disclaimer ("waitlist, not yet
licensed") and Shariah-correct vocabulary (Murabaha / profit-rate / admin-fee, never "interest",
never "loan") aren't compliance drag — in a market burned by hidden-fee lenders, they're conversion
drivers with the exact audience most likely to want a halal product.

---

## 4. Speed-to-ship — prioritisation under the constraint

The brief rewards a polished single page over a half-built multi-page site, so the discipline was in
what got **cut** and sequenced:

- **Migration first, deploy by hour 3.** Evaluators read migrations; a live URL early de-risks the
  whole thing. Both done before any polish.
- **Built the measurement, not the funnel.** The one *optional* intent field and the referral loop
  went in because they're what the grade ("what growth needs to measure") actually rewards — while
  admin UI, email/OTP, captcha, and an i18n framework were cut to named next-steps.
- **`/ar` shipped, not deferred.** The earlier plan was English-only with Arabic "argued as a
  next-step." That's reasoning without prioritisation for *this* market — so Arabic became a real
  route. Kept minimal and hand-checked (formal MSA) rather than machine-translated, precisely because
  it faces native-speaker reviewers.

**Explicit trade-offs I'd defend:**

| Decision | Call | Why |
|----------|------|-----|
| No rate-limiting (yet) | Deferred | Real setup for a time-boxed build; documented as the #1 hardening step. Demand numbers are inflatable until it lands — I'd rather name that than hide it. |
| `referred_by` unvalidated | Accepted | A spoofed `?ref` pollutes *attribution only*, never core data. Validation is a documented next-step, not a launch blocker. |
| `demand_report` as a SQL view, no dashboard | Chose | The evaluator can run it; a dashboard is UI for a problem we don't have yet. |
| Supabase over raw Postgres | Chose | Managed Postgres + REST + a plain-SQL migration that's portable anywhere. One innovation token, well spent. |
| Palette matched to Mal's brand | Chose | Signals brand awareness to the evaluator; executed with restraint so the periwinkle/aurora reads as intentional, not generic pastel-fintech. |
| SSR for `/` + `/ar` (not static-export) | Chose | A correct per-locale `<html lang>`/`dir` needs the route at render time. Static-exporting both with one hardcoded `lang` let browsers auto-translate the Arabic page into a broken English-in-RTL hybrid. SSR fixes it for crawlers and browsers; the per-request cost on Vercel is negligible. |

**With 2 more hours** (also in the README): rate-limit + `referred_by` validation to protect the
demand signal; the referral loop's position/live-count on the success screen; analytics events + a
read surface over `demand_report`; and an Arabic-parity polish pass (native copy review, Arabic OG
card, locale-segmented layout so `<html lang>` matches per route).
