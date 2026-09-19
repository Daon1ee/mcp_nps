---
name: site-style-guide
description: Design rules for the DC National Parks one-page site (site/index.html, site/tokens.css). Use whenever you add, change or restyle anything visible on the site — a new section, card, chip, button, color, font, spacing, dark-mode tweak, or photo — so the result stays on the design tokens and existing component patterns.
---

# DC National Parks — site style guide

The site is a single page (`site/index.html`) whose look is defined by **design tokens in `site/tokens.css`**. This skill keeps every edit on those tokens and on the existing component patterns.

Files in this skill:
- `tokens.md` — what each token is for, plus the type/spacing/breakpoint conventions the page already follows.
- `patterns.md` — the existing components (section head, card, chip, event row, alert, dataset card, dialog…) with markup and CSS to copy.

## Before you edit

1. Read `site/tokens.css` (the values) and `tokens.md` (the meaning).
2. If you're building something new, find the closest component in `patterns.md` and copy it instead of inventing a new look.
3. Make the change, then run the checks at the bottom.

## Hard rules

1. **No raw colors in `index.html`.** No `#hex`, `rgb()`, `hsl()`, or named colors in CSS, inline styles, or JS. Use `var(--token)`. Need a translucent tint? `color-mix(in srgb, var(--alert) 30%, transparent)` (already used) or `rgba(var(--scrim-rgb), .6)`.
2. **Need a new color, radius, shadow or size that repeats?** Add a token to `tokens.css` first, with a comment saying what it's for, then use it. Add the dark-mode value in the `prefers-color-scheme: dark` block if it isn't a fixed over-photo color. One-off layout sizes (a grid `minmax`, an aspect ratio) can stay inline.
3. **Light and dark must both work.** Every themed token has a dark value. Never hardcode `white`/`black` for text or surfaces. Over-photo colors (`--on-photo*`, `--glass*`, `--credit`) are intentionally fixed.
4. **Two fonts only:** `--serif` (Fraunces) for headings and big numbers, `--sans` (Inter) for everything else. Don't add a third family.
5. **Photos are the only imagery.** No illustrations, stock art, emoji as decoration, or icon sets. Use NPS photos from the data. Details below.
6. **Don't imitate official NPS branding.** No arrowhead logo, no NPS wordmark, no green-and-brown "official" lookalike. The footer states this is an independent student project; keep it true.
7. **Accessible by default:** text/background contrast at least WCAG AA (4.5:1 for body text) in both themes; visible `:focus-visible` (already global — don't remove it); real `<button>`/`<a>` for interactive things; `aria-*` on toggles and live regions as in existing code; respect `prefers-reduced-motion` (already global).
8. **Escape data.** Any park/event/dataset text inserted with JS goes through `esc()`; URLs through `safeUrl()`.

## Photos

- Source: NPS images from `data.json` only. Show the photographer/credit wherever a photo set is shown (hero `.credit`, dialog `.imgcredit`).
- `alt`: use the NPS `altText`; decorative repeats (directory thumbnails next to the name) use `alt=""`.
- Crop with `object-fit: cover` inside a fixed `aspect-ratio` box (cards `16/10`, dialog gallery `4/3` lead image). Never stretch.
- Text on a photo needs the scrim (`rgba(var(--scrim-rgb), …)` gradient) and `--on-photo*` colors.
- Below the fold: `loading="lazy"`.
- Motion on photos is limited to the card hover zoom (`scale(1.04)`, `.4s`).

## Tone

Plain, welcoming, specific. Sentence case for headings. One short `eyebrow` label above each section title (uppercase, tracked). No exclamation marks, no marketing superlatives.

## Checks after every change

Run from the project root; both should print nothing / `none`:

```sh
# raw colors outside tokens.css
grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" site/index.html | grep -vE "rgba\(var\(--scrim-rgb\)"
# tokens used but not defined
comm -13 <(grep -oE "^\s*--[a-z-]+" site/tokens.css | tr -d ' ' | sort -u) <(grep -oE "var\(--[a-z-]+" site/index.html | sed 's/var(//' | sort -u)
```

Then open `site/index.html` in light **and** dark mode (macOS: System Settings → Appearance) and at ~390px wide (browser devtools) and confirm nothing overflows horizontally.
