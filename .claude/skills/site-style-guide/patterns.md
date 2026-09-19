# Component patterns

Copy these instead of designing new ones. All CSS below already exists in `site/index.html`; the class names are the real ones. Colors, radii and fonts are always tokens.

## Page section

Every section is `<section id="…" aria-labelledby="…-h">` containing a `.sec-head` and content.

```html
<section id="events" aria-labelledby="events-h">
  <div class="sec-head">
    <span class="eyebrow">Next 60 days</span>
    <h2 id="events-h">Ranger programs &amp; events</h2>
    <p>Optional one-sentence intro, ≤ 62ch.</p>
  </div>
  <!-- content -->
</section>
```

If it should be reachable from the top nav, add `<li><a class="l" href="#id">Label</a></li>` (keep labels to 1–2 words).

## Photo card (featured park)

A `<button class="card">` (whole card is the click target) — photo on top at `16/10`, then designation label, serif title, 3-line clamped text, blossom "Details →".

```html
<button class="card" data-i="0">
  <div class="ph"><img src="…" alt="…" loading="lazy"></div>
  <div class="body">
    <span class="desig">National Historic Site</span>
    <h3>Frederick Douglass National Historic Site</h3>
    <p>Description, clamped to 3 lines.</p>
    <span class="more">Details →</span>
  </div>
</button>
```
Uses: `--card`, `--line`, `--radius`, `--shadow`, `--moss` (label), `--ink-soft` (text), `--blossom` (more). Hover: `translateY(-3px)`, photo `scale(1.04)`.

## Chip (filter)

`<button class="chip" aria-pressed="true|false">`. Pill, `--card` fill and `--line` border; pressed = `--ink` fill with `--paper` text. Group them in `.chips` with `role="group"` and an `aria-label`.

## Button

`<button class="btn">` — outlined pill, `--ink` border/text, fills with `--ink` on hover. One per list ("Show more"); don't add filled/primary buttons.

## Event row

`<article class="event">`: a 76px blossom date tile (`.date` with `.m` month, `.d` day in serif) + title (`h3`, sans 600), `.meta` line (`--ink-soft`), 2-line clamped description.

## Alert

Accordion in `.alerts` using native `<details><summary>`. Summary text in `--alert` 600; park tag right-aligned in `--ink-soft`; body in `--ink`. Panel is `--alert-bg` with a `color-mix` border. Use only for closures, warnings and safety notices.

## Stat pill (over hero photo)

`<span class="stat"><b>36</b>NPS sites in DC</span>` — frosted (`--glass`, `--glass-line`, `backdrop-filter: blur(8px)`), serif number. Only on photo backgrounds.

## Dataset card

`.ds`: publisher label (`--moss`, 600, `.78rem`) → title link (`--ink`, blossom underline on hover) → 240-char summary → `.tags` (format tags `.tag.fmt` in moss tint, keyword tags `.tag` in blossom tint).

## Directory tile

`.dir a`: 72px square thumbnail (`--radius` 8px, `alt=""`) + bold name + `--ink-soft` designation. Border turns `--blossom` on hover.

## Search input

`.search` — pill, `--card` fill, `--line` border, 16px text (keeps iOS from zooming). Always with an `aria-label`.

## Dialog (park details)

Native `<dialog>` opened with `showModal()`. Top: photo gallery (lead image left at 4/3, two stacked right; 1-up if only one photo; on phones lead on top + 2-up) with the round `.close` button (`--glass-solid`, `--shadow-float`). Body: eyebrow, serif title, description, `.facts` grid (label `--moss` uppercase `.72rem` + value `--ink-soft`), official link, photo credit line. Backdrop is `rgba(var(--scrim-rgb), .6)` with blur. Close on ✕, Esc and backdrop click.

## Map

Leaflet with OpenStreetMap tiles in `#map` (`--radius`, `--shadow`, 460px / 360px on phones). Circle markers only: featured = `--marker-featured` radius 9, others = `--marker-default` radius 6, ring `--marker-ring`. Colors come from `css("--marker-…")`, never literals. Popups use `--serif` for the name.

## New component checklist

- Built from `--card` / `--line` / `--radius` / `--shadow` unless it sits on a photo.
- Text uses `--ink` or `--ink-soft`; labels use the eyebrow/label type style.
- One accent role only (blossom *or* moss).
- Works at 390px and in dark mode.
- Interactive → real `<button>`/`<a>`, keyboard reachable, visible focus.
- Any user/API text goes through `esc()`.
