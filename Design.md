# Canvas Design System

> Status: Draft v0.1  
> Reference direction: [Studio Modular](https://studiomodular.be/)  
> Scope: Canvas desktop MVP, design baseline `1440 × 960`

Canvas adopts the reference site's bold editorial scale, warm off-white canvas, dark green typography, pastel accents, rounded media, asymmetric composition and restrained motion. The system must feel contemporary, optimistic and tactile while keeping artworks—not UI decoration—as the primary visual subject.

This document extracts a design language. Do not reproduce Studio Modular's logo, copy, photography, compositions or brand-specific assets.

## Color

### Core palette

| Token | Value | Use |
|---|---:|---|
| `color.canvas` | `#FFF7F0` | Primary page background; warm museum-paper tone |
| `color.surface` | `#FFFFFF` | Floating cards, drawers, dialogue and compact overlays |
| `color.ink` | `#0B1311` | Primary text and high-contrast icons |
| `color.brand` | `#1E4137` | Logo, major headings, primary controls and selected states |
| `color.brandHover` | `#18372F` | Hover/pressed state for solid brand surfaces |
| `color.muted` | `#858581` | Secondary metadata only |
| `color.line` | `#DEDCD7` | Dividers, subtle outlines and inactive tracks |
| `color.softGrey` | `#F4F4F2` | Quiet secondary surfaces |

### Accent palette

| Token | Value | Semantic role |
|---|---:|---|
| `color.blue` | `#BAD6FF` | Museum/map system; default soft action surface |
| `color.pink` | `#FFB1EB` | Artist system; human voice and avatar accents |
| `color.yellow` | `#F9E283` | Daily art and discovery cues |
| `color.orange` | `#FF643C` | Active hotspot and urgent visual focus |
| `color.purple` | `#CDB7F1` | Sources, historical context and interpretation |
| `color.purpleDark` | `#602148` | Text/icon on purple surfaces when needed |

### Color rules

- Use `color.canvas` as the dominant background across the four routes.
- Use `color.brand` or `color.ink` for at least 80% of text.
- Assign accent colors semantically; never choose a random pastel per card.
- Keep large pastel areas pale. Strong accents belong on small landmarks, pills, hotspots and transitions.
- On the artwork page, derive optional ambient color from the current artwork, but never tint the artwork itself.
- Body text must meet WCAG AA contrast. Do not place `color.muted` on pastel surfaces without checking contrast.
- Do not use pure black as the default UI color; use `color.ink`.

### Suggested CSS variables

```css
:root {
  --color-canvas: #fff7f0;
  --color-surface: #ffffff;
  --color-ink: #0b1311;
  --color-brand: #1e4137;
  --color-brand-hover: #18372f;
  --color-muted: #858581;
  --color-line: #dedcd7;
  --color-soft-grey: #f4f4f2;
  --color-blue: #bad6ff;
  --color-pink: #ffb1eb;
  --color-yellow: #f9e283;
  --color-orange: #ff643c;
  --color-purple: #cdb7f1;
  --color-purple-dark: #602148;
}
```

## Typography

### Font family

- Primary Latin/number font: `Manrope`.
- Primary Simplified Chinese font: `Noto Sans SC`.
- System fallback: `PingFang SC`, `Microsoft YaHei`, `Arial`, `sans-serif`.
- Use one sans-serif family across display and body. Character comes from scale, composition and weight—not from mixing many typefaces.
- Use only `400` and `600` in the MVP.

```css
--font-sans: "Manrope", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
```

### Desktop type scale

| Style | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| `Display/XL` | `clamp(96px, 13vw, 208px)` | `0.84–0.9` | 600 | One short hero phrase only |
| `Display/L` | `clamp(64px, 7vw, 112px)` | `0.92` | 600 | Major route title or section statement |
| `Heading/1` | `64px` | `1.02` | 600 | Page title |
| `Heading/2` | `44px` | `1.08` | 600 | Major section title |
| `Heading/3` | `28px` | `1.2` | 600 | Card and panel title |
| `Body/L` | `28px` | `1.45` | 400 | Editorial introduction |
| `Body/M` | `18px` | `1.6` | 400 | Default body and dialogue |
| `Body/S` | `15px` | `1.5` | 400 | Supporting copy |
| `Label` | `13px` | `1.2` | 600 | Metadata, location and mode label |

### Typography rules

- Use oversized type as spatial composition on map and artist-route pages.
- Keep display copy short: ideally 2–8 Chinese characters per line.
- Allow display text to approach or cross the viewport edge only when no essential content is hidden.
- Body copy should stay between `28–38` Chinese characters per line.
- Use sentence case. Avoid decorative all-caps for Chinese text.
- On the artwork viewer, reduce heading scale so the work remains dominant.
- Never place giant text over important artwork details.

## Radius

| Token | Value | Use |
|---|---:|---|
| `radius.none` | `0` | Full-bleed canvas and structural dividers |
| `radius.sm` | `12px` | Compact controls and tooltips |
| `radius.md` | `20px` | Information cards and dialogue bubbles |
| `radius.lg` | `clamp(20px, 1.6vw, 30px)` | Media cards, map canvas and large panels |
| `radius.xl` | `48px` | Hero blobs and major feature surfaces |
| `radius.pill` | `999px` | Buttons, tags, filters and map landmarks |
| `radius.circle` | `50%` | Hotspots and circular motion labels |

### Radius rules

- Rounded media is a primary brand behavior; use `radius.lg` consistently.
- Buttons and small taxonomy labels use the pill shape.
- Do not round every container. Page structure and large editorial sections may remain edge-to-edge.
- Artwork images and historic documents must retain their true rectangular boundaries. Apply radius to the surrounding viewer, not the artwork pixels.

## Layout

### Grid

- Desktop design frame: `1440 × 960`.
- Use a 12-column grid.
- Outer margin: `48px` at 1440px; increase to `64px` on screens wider than 1600px.
- Column gutter: `24px`.
- Base spacing unit: `4px`.
- Preferred spacing steps: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`.

### Composition

- Combine a strict underlying grid with visibly asymmetric placement.
- Alternate between full-width editorial moments and dense functional moments.
- Use oversized empty space to establish pacing; do not fill every viewport.
- Let large media extend across 5–8 columns.
- Use controlled overlap only for decorative blobs, labels and secondary images.
- Keep essential controls and body copy aligned to grid columns.
- Major page sections should normally use `96–160px` vertical spacing.

### Route-specific layout

#### Map

- The map occupies at least 65% of the first viewport.
- Treat land masses as soft organic forms rather than literal satellite geography.
- City/museum cards float near their selected landmark without obscuring it.
- Oversized page copy may frame the map, but the map remains operable.

#### Gallery

- Use an asymmetric editorial stage, not a conventional equal-card grid.
- The central artwork receives roughly 1.4–1.7× the scale of side works.
- Side works may crop at viewport edges to imply a larger spatial sequence.

#### Artwork

- Allocate 65–75% of horizontal space to the artwork viewer.
- Keep dialogue and artist presence in a stable side column or bottom dock.
- Controls should disappear visually when idle but remain discoverable.
- Avoid decorative overlap within the artwork's viewing area.

#### Artist route

- Use a long, expressive route with large city names, dates and selected works.
- Alternate text and media rather than repeating identical cards.
- Maintain clear chronological direction despite the asymmetric composition.

## Components

### Header

- Logo left; one high-emphasis menu control right.
- Header may be transparent over the canvas and become a soft surface after scroll.
- Desktop height: `88–104px`.
- Menu control uses `color.blue`, pill radius and `18px` label text.
- Keep header actions intentionally sparse.

### Primary button

- Pill shape with `16–20px` horizontal padding and minimum height `52px`.
- Default: `color.brand` background with `color.canvas` text.
- Soft variant: pastel background with `color.ink` text.
- Include a directional arrow for route-changing actions.
- Hover changes color and moves the arrow `4px`; do not scale the whole button dramatically.

### Text link

- Weight `600`, no permanent underline.
- Pair route-changing links with a north-east or right arrow.
- On hover, reveal underline or shift arrow; preserve layout.

### Pill tag

- White or semantic pastel background.
- `Label` or `Body/S` typography.
- Optional simple monochrome icon.
- Use for museum type, artwork medium, source category and route stage.

### Media card

- Large image/video with `radius.lg`.
- Title sits outside the media rather than permanently overlaying it.
- Supporting tags form a compact wrapping row.
- Cards can vary in size to create a masonry/editorial rhythm.
- Hover: media scale only; radius and card bounds remain fixed.

### Map landmark

- Circular core plus a soft outer ring.
- Color communicates category: museum blue, artist pink, daily art yellow.
- Selected state adds scale and label; do not rely on color alone.
- Landmark hit target is at least `44 × 44px`.

### Museum information card

- `color.surface` background, `radius.lg`, generous `24–32px` padding.
- One title, one concise fact group, up to three thumbnails and one primary action.
- Avoid dashboard-style statistics.

### Artwork stage

- Neutral or softly artwork-derived ambient background.
- Artwork retains its original aspect ratio and visible boundary.
- Viewer controls use compact soft pills.
- Fullscreen, reset and zoom form one control group.

### Hotspot

- `24–32px` visible core, `44px` minimum hit target.
- Default ring uses `color.orange`; selected hotspot may include a rotating or pulsing outer label.
- Motion stops after selection and when reduced motion is enabled.

### Artist avatar

- 2.5D collage with hard paper edges and limited soft shadow.
- Place inside an organic pastel field rather than a conventional profile card.
- Idle state is subtle; the avatar must never compete with the artwork.

### Question chip

- Soft pill or rounded rectangle using `color.blue`/`color.pink` at low emphasis.
- Keep questions to one or two lines.
- Hover and focus increase contrast; selected state becomes solid.

### Dialogue panel

- Stable width; internal vertical flow.
- Artist and user messages differ by alignment and surface, not by many colors.
- Use `Body/M` with comfortable line length.
- Source action remains adjacent to the answer it supports.

### Source drawer

- Slides from the right or rises from the dialogue column.
- `color.surface` background with `radius.lg` on exposed corners.
- Separate fact, interpretation and inference with labels and icons.
- Closing the drawer restores the exact previous viewing state.

### Circular motion label

- Use sparingly for “scroll”, “explore”, “look closer” or a selected hotspot.
- Text rotates around a static center icon.
- Never use more than one continuously rotating label in a viewport.

## Animation

### Motion principles

- Motion communicates spatial relationships: approaching, selecting, revealing and returning.
- Prefer transform and opacity; avoid layout-shifting animation.
- One dominant motion event per user action.
- Decorative loops must remain slow and low contrast.
- All interactions require a reduced-motion equivalent.

### Timing tokens

| Token | Duration | Use |
|---|---:|---|
| `motion.instant` | `120ms` | Pressed feedback |
| `motion.fast` | `250ms` | Color, underline, chip and button hover |
| `motion.base` | `350ms` | Card, drawer and small layout transitions |
| `motion.reveal` | `600ms` | Section reveal and large media entrance |
| `motion.route` | `900ms` | Map or gallery route transition |
| `motion.approach` | `1200–1600ms` | Walk-toward-artwork sequence |
| `motion.loop` | `12–16s` | Circular decorative text rotation |

```css
:root {
  --ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

### Interaction recipes

- **Page reveal:** opacity `0 → 1`, translateY `24px → 0`, `600ms`.
- **Media hover:** inner media scale `1 → 1.025`, `350ms`; container does not move.
- **Button hover:** color transition `250ms`; arrow translateX `0 → 4px`.
- **Map selection:** landmark scale `1 → 1.12`, card reveal `350ms`, camera movement `900ms`.
- **Gallery switch:** selected artwork moves to center in `600–900ms` with depth/scale interpolation.
- **Approach artwork:** background recedes, artwork enlarges and controls reveal in `1200–1600ms`.
- **Drawer:** translateX `100% → 0`, `350ms`; backdrop fades independently.
- **Circular label:** linear rotation `12–16s`; center icon remains static.

### Reduced motion

When `prefers-reduced-motion: reduce`:

- Remove parallax, bouncing, continuous rotation and camera travel.
- Replace route motion with `150–250ms` crossfades.
- Preserve state changes, focus treatment and spatial hierarchy.

## Do Not

- Do not copy Studio Modular's logo, photography, case-study layout or brand copy.
- Do not turn Canvas into a portfolio site; it remains an exploratory museum product.
- Do not use oversized typography on every screen. Reserve it for arrival and orientation moments.
- Do not place decorative type, blobs or avatars over important artwork details.
- Do not assign pastel colors randomly. Every accent must carry a stable meaning.
- Do not put every element inside a rounded card.
- Do not use equal-sized dashboard grids for the gallery or artist route.
- Do not use more than one continuous looping animation per viewport.
- Do not make hotspots pulse forever or compete with the artwork.
- Do not use scroll hijacking, forced horizontal scroll or hidden essential navigation.
- Do not use WebGL/3D merely to appear impressive; add it only when it clarifies spatial exploration.
- Do not animate layout properties when transform/opacity can achieve the result.
- Do not sacrifice text contrast for pastel aesthetics.
- Do not use more than two font weights or more than one primary font family in the MVP.
- Do not make dialogue resemble a generic messaging app; it belongs to the artwork-viewing environment.
- Do not allow motion, sound or the artist avatar to startle the user on page entry.
- Do not begin high-fidelity screens before the page/state list and low-fidelity hierarchy are confirmed.

