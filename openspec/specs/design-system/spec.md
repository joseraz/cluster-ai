# Design System — Cluster AI

This design system is for use in Cluster AI.
All colour tokens, typography rules, spacing, and motion guidelines below apply to every surface in this app.

> *Quiet luxury. Candlelit dark mode. Warm blacks, cream text, gold accent.*

Dark mode is the default. Light mode is a sensible inversion of the same palette — ivory background, obsidian text.

---

## Visual foundations

**One word:** quiet luxury. The aesthetic is a warm leather armchair, a cathedral at night, the inside of an old book.

- **Background** is always `#1A1816` (obsidian) in dark mode — a warm black with a faint brown undertone. Never `#000`.
- **Surfaces** are `#241F1C` (walnut). Cards lift one hairline off the background, never with shadow.
- **Text** is `#F4EDE4` (cream), NOT white.
- **Accent** is `#C9A96E` (gold). One gold, used as a scalpel: active states, CTAs, ring/focus. A surface rarely has more than two or three instances of gold.
- No blue anywhere in the palette. No cool grays. No neon.

---

## Colour primitives (hex → HSL)

| Name | Hex | HSL | Role |
|---|---|---|---|
| obsidian | `#1A1816` | `30 9% 9%` | Page background (dark) |
| walnut | `#241F1C` | `24 13% 12%` | Card / surface background (dark) |
| walnut-light | `#2E2823` | `28 13% 16%` | Secondary, muted, border (dark) |
| espresso | `#3B2E25` | `26 23% 19%` | Accent background (dark) |
| ivory | `#FAF6F0` | `36 50% 96%` | Page background (light) |
| cream | `#F4EDE4` | `34 42% 93%` | Foreground / body text (dark) |
| sand | `#C7B8A3` | `35 24% 71%` | Muted foreground (dark) |
| camel | `#A8906F` | `35 25% 55%` | Accent border / ring (dark) |
| gold | `#C9A96E` | `39 46% 61%` | Primary / CTA (both modes) |
| muted | `#6B635A` | `32 5% 39%` | Muted foreground (light) |

---

## CSS variable mapping

All colours are consumed through shadcn CSS variables. Never use raw hex — always use `bg-primary`, `text-foreground`, etc., or the variables below.

### Dark mode (`.dark`)

```css
--background:             30 9% 9%;     /* obsidian */
--foreground:             34 42% 93%;   /* cream */
--card:                   24 13% 12%;   /* walnut */
--card-foreground:        34 42% 93%;
--popover:                24 13% 12%;
--popover-foreground:     34 42% 93%;
--primary:                39 46% 61%;   /* gold */
--primary-foreground:     30 9% 9%;
--secondary:              28 13% 16%;   /* walnut-light */
--secondary-foreground:   34 42% 93%;
--muted:                  28 13% 16%;
--muted-foreground:       35 24% 71%;   /* sand */
--accent:                 26 23% 19%;   /* espresso */
--accent-foreground:      34 42% 93%;
--destructive:            0 60% 40%;
--destructive-foreground: 34 42% 93%;
--border:                 28 13% 16%;
--input:                  28 13% 16%;
--ring:                   39 46% 61%;   /* gold */
--radius:                 1rem;
```

### Light mode (`:root`)

```css
--background:             36 50% 96%;   /* ivory */
--foreground:             30 9% 9%;     /* obsidian */
--card:                   0 0% 100%;
--card-foreground:        30 9% 9%;
--primary:                39 46% 61%;   /* gold — same in both modes */
--primary-foreground:     30 9% 9%;
--muted-foreground:       32 5% 39%;    /* muted */
--border:                 35 15% 88%;
--ring:                   39 46% 61%;   /* gold */
--radius:                 1rem;
```

---

## Typography

**Two families only. A third is forbidden.**

- **Playfair Display** — headlines, display text, emotional weight. Tailwind class: `font-display`
- **Inter** — body, labels, buttons, UI chrome. Tailwind class: `font-body`

Letter-spacing signals luxury:
- Body: `0` (normal)
- Uppercase labels: `0.06em` (`tracking-wide`)
- Wordmarks / eyebrows: `0.15em`–`0.35em`

---

## Spacing scale

`4 / 8 / 16 / 24 / 40 / 64` — Fibonacci-adjacent.

Layouts are centred and breath-heavy. Content does not fill to edges; it is placed.

---

## Corner radii

- `--radius: 1rem` (16px) — default, used by `rounded-lg` → cards, sheets, dialogs
- `rounded-md` = `calc(1rem - 2px)` = 14px → inputs, smaller containers
- `rounded-sm` = `calc(1rem - 4px)` = 12px
- `rounded-full` — pill buttons, avatar circles, mic buttons

Never sharp corners. Never mixed radii on one element.

---

## Borders and hairlines

Hairlines are always `1px solid`. Never 2px. Never dashed.

- Default border: `border-border` → `hsl(28, 13%, 16%)` in dark
- Strong border: `#3B2E25` (espresso)
- Accent ring: `#A8906F` (camel) — for focus states that need warmth

---

## Shadow system

Shadow is almost absent. Depth comes from the 1px hairline.

The only meaningful shadow is the **gold glow** (milestones, active CTA):
```css
box-shadow: 0 0 24px rgba(201, 169, 110, 0.28);
```

No inner shadows. No backdrop blur.

---

## Canvas (React Flow)

The network canvas uses inline styles (outside the CSS variable system). These must be updated directly in the component files:

| Target | Value |
|---|---|
| Canvas background | `#1A1816` (obsidian) |
| Edge stroke | `rgba(201, 169, 110, 0.22)` (gold tint) |
| UserNode glow | `rgba(201, 169, 110, 0.20)` |
| UserNode border | `rgba(201, 169, 110, 0.6)` |
| ContactNode background | `rgba(244, 237, 228, 0.92)` (cream) |
| ContactNode text | `#1A1816` (obsidian) |

---

## Animation

- Default easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Durations: `200ms` micro, `300ms` component, `500ms` full-screen
- No bouncy springs. No confetti. No parallax.

---

## Rules

1. Never use raw hex values in component files. Use CSS variables via Tailwind classes.
2. Gold appears once or twice per surface, never more.
3. No blue, no cool gray, no purple, no indigo anywhere.
4. Dark mode is the primary design target. Light mode is a secondary inversion.
5. Canvas components (`NetworkCanvas`, `UserNode`, `ContactNode`) use inline styles — update them with the hex values in the Canvas section above.
