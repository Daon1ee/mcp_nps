# Design tokens

Values live in `site/tokens.css` — that file wins if this one ever disagrees. This file explains **what each token is for** and records the conventions the page already follows.

Concept: **a cherry-blossom pink accent on marble-cream paper with deep navy ink** — DC in April — with a moss green as the quiet second accent. Photography carries the rest.

## Color

| Token | Light | Dark | Use for |
|---|---|---|---|
| `--ink` | `#14213d` | `#eef1f8` | Body text, headings, active chip fill |
| `--ink-soft` | `#4a5570` | `#a9b3c9` | Secondary text, meta lines, descriptions |
| `--paper` | `#faf7f2` | `#0f1626` | Page background |
| `--card` | `#ffffff` | `#172038` | Raised surfaces: cards, event rows, dialog, inputs |
| `--line` | `#e6dfd3` | `#263252` | 1px borders, dividers, image placeholders |
| `--blossom` | `#c2577a` | `#ee8fb0` | Primary accent: links, eyebrows, date tiles, "Details →", focus ring, featured map markers |
| `--blossom-soft` | `#f6dde5` | `#3a2233` | Tinted background behind blossom text (date tile, tags) |
| `--moss` | `#3d5a4c` | `#8fc1a8` | Secondary accent: designation labels, fact labels, dataset publisher, format tags, default map markers |
| `--gold` | `#b8892b` | `#e0b45a` | Reserved — not used yet. Use for a single "highlight" role if one is ever needed; don't sprinkle |
| `--alert` | `#9a3412` | `#ffb98a` | Closures and warnings only |
| `--alert-bg` | `#fdefe4` | `#3a2418` | Background of the alerts panel |

**Accent discipline:** blossom = "interactive / featured", moss = "informational label", alert = "problem". Don't use alert colors for decoration, and don't use blossom for body text.

### Over-photo colors (fixed in both themes)

`--on-photo` (white), `--on-photo-soft` (lead paragraph), `--on-photo-accent` (pink emphasis in the hero headline), `--scrim-rgb` (navy as `R, G, B` for `rgba(var(--scrim-rgb), a)`), `--hero-fallback`, `--glass` / `--glass-line` (frosted stat pills), `--glass-solid` / `--on-glass-solid` (dialog close button), `--credit` (photo credit), `--marker-ring`.

`--marker-featured` / `--marker-default` are read in JS with `css("--marker-featured")`.

## Type

| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| Hero title | `--serif` | `clamp(2.4rem, 7vw, 4.6rem)` | 700 | `max-width: 16ch`; one phrase in `--on-photo-accent` |
| Section title (`h2`) | `--serif` | `clamp(1.7rem, 3.4vw, 2.3rem)` | 700 | `line-height 1.15`, `letter-spacing -.01em` |
| Card title (`h3`) | `--serif` | `1.3rem` | 700 | |
| Dialog title | `--serif` | `1.9rem` | 700 | |
| Big number | `--serif` | `1.15rem`–`1.7rem` | 700 | stat pills, date tile day |
| Body | `--sans` | `16px` / `1.6` | 400 | |
| Item title (event, dataset) | `--sans` | `1.02rem`–`1.1rem` | 600 | not serif |
| Secondary / description | `--sans` | `.88rem`–`.95rem` | 400 | `--ink-soft` |
| Meta / small | `--sans` | `.78rem`–`.85rem` | 400–500 | |
| Eyebrow / label | `--sans` | `.72rem`–`.75rem` | 600 | UPPERCASE, `letter-spacing .1em`–`.14em` |

Body copy max line length: `62ch` for section intros, `52ch` for the hero lead.

## Space

The page uses an informal 4px-based scale. Reuse these rather than inventing new numbers:

`4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 44 · 72` (px)

| Where | Value |
|---|---|
| Section top padding | `72px` (`56px` under 640px) |
| Section head → content | `28px` |
| Grid gap (cards) | `20px`; list gap (events) `12px`; directory `14px` |
| Card body padding | `18px 20px 20px` |
| Panel padding (event row, dataset) | `16px 18px` / `18px 20px` |
| Chip / button padding | `6px 14px` / `10px 20px` |
| Content width | `--wrap` (1120px) with `--gutter` (16px) side margins |
| Sticky nav height | `--nav-h` (56px); anchors use `scroll-padding-top: calc(var(--nav-h) + 16px)` |

## Shape & depth

| Token | Value | Use |
|---|---|---|
| `--radius` | 14px | cards, panels, map |
| `--radius-lg` | 18px | dialog |
| `--radius-sm` | 10px | date tile, small tiles |
| `--radius-pill` | 999px | chips, stat pills, buttons, search |
| `--shadow` | soft two-layer navy | cards, map |
| `--shadow-dialog` | large, dark | dialog only |
| `--shadow-float` | small, dark | controls floating over photos |

Borders are always `1px solid var(--line)` (alerts use a `color-mix` of `--alert`).

## Breakpoints & layout

- One breakpoint: `max-width: 640px`. Below it: single-column grids, brand text hidden in nav, 60px date tile, gallery becomes 2-up with a full-width lead image, map `360px` tall.
- Card grids: `repeat(auto-fill, minmax(320px, 1fr))` (featured, datasets), `minmax(250px, 1fr)` (directory).
- Never allow horizontal page scroll at 390px.

## Motion

Small and quick: `.15s`–`.4s`, transforms only (`translateY(-3px)` card hover, `scale(1.04)` photo, chevron rotate). All motion is disabled under `prefers-reduced-motion`.
