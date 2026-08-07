# Design System — Amanah waitlist

Visual direction matched to [Mal](https://mal.ai/)'s brand palette (palette only — original
wordmark, no Mal assets). High-trust, airy, mobile-first.

## Type

| Role | Face | Weights | Source |
|------|------|---------|--------|
| Display / headings | **Outfit** | 600, 700 | `next/font/google` → `--font-outfit` |
| Body / UI | **Inter** | 400, 500, 600 | `next/font/google` → `--font-inter` |

Both are self-hosted and subset by `next/font` (no render-blocking fetch).

## Color tokens

Defined in `app/globals.css` under `@theme` (Tailwind v4). Use the utilities
(`bg-periwinkle`, `text-ink`, `text-ink-muted`, …), never raw hex.

| Token | Hex | Use |
|-------|-----|-----|
| `periwinkle` | `#D0DDEE` | Page base (Mal's signature) |
| `periwinkle-wash` | `#E4EAF5` | Lighter wash / gradient fade |
| `surface` | `#FFFFFF` | Cards, form field, success card |
| `ink` | `#0A0A0A` | Primary text, wordmark, CTA fill |
| `ink-muted` | `#5B5F6B` | Secondary text (AA on periwinkle) |
| `error` | `#C11574` | Inline field errors (AA on white) |
| `focus` | `#C658FD` | Violet focus ring (from the aurora) |

**Aurora accent** — `linear-gradient(135deg,#F4C7DD,#CBB4F1,#C658FD,#F9C9A9)`, exposed as
`.aurora`. Decorative only: behind the form card / as a soft hero glow, **never under text**.
Black-on-periwinkle ≈ 15:1 contrast.

## Rules (from /plan-design-review)

- **One visual anchor:** the elevated white form card. Soft shadow, restrained aurora wash
  behind it only — never a full-bleed gradient. Hero text left-aligned on desktop, stacked on
  mobile (breaks the centered-everything AI pattern).
- **Radii:** vary them — form card `rounded-2xl`, inputs `rounded-xl`, CTA `rounded-full`
  (avoids the uniform-radius AI-slop tell).
- **Labels:** every field has a persistent visible label; placeholders carry format hints only.
- **Touch targets** ≥ 44px (CTA 52px). Logical tab order. ARIA landmarks. `prefers-reduced-motion`
  disables the aurora animation.
- **Copy:** "Shariah-compliant financing" — never "interest rate", never "lending" in consumer
  copy. Murabaha / profit-rate / admin-fee framing.
- **RTL (`/ar`):** CSS logical properties (`margin-inline`, `padding-inline`) + `dir="rtl"` so the
  same components mirror without duplicated CSS. Western digits for phone entry.
