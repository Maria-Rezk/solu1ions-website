# Solu1ions — Website

Premium single-page site for **Solu1ions** (Damascus, Syria): an immersive, editorial, motion-driven experience built around the official brand guidelines — chrome brand objects, the five year-statues, Virtual Pink `#c9144b` on deep Medieval Blue / Vulcan surfaces.

Built with **Vite + React 19 + TypeScript**, animated with **GSAP (ScrollTrigger + SplitText)** and **Lenis** smooth scrolling.

---

## Quick start

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

Requires Node 20.19+ (Vite 8).

## Contact form endpoint (optional)

The form POSTs JSON to `VITE_CONTACT_ENDPOINT` when set; without it, it opens a prefilled email draft to `info@solu1ions.com`.

```bash
cp .env.example .env
# .env
VITE_CONTACT_ENDPOINT=https://formspree.io/f/XXXXXXXX   # Formspree / Basin / your own API
```

Payload: `{ name, company, email, phone, service, budget, message }` — a honeypot field (`website`) is dropped client-side.

---

## Architecture

```
src/
├─ main.tsx                  # fonts + style layers + root render
├─ App.tsx                   # Lenis wiring, preloader gate, section assembly
├─ types.ts                  # shared domain types
├─ data/                     # ALL content lives here — edit copy without touching components
│  ├─ site.ts                # nav, socials, contact, taglines, marquee words
│  ├─ services.ts            # 4 service chapters (verified service lists)
│  ├─ projects.ts            # selected work (real engagements)
│  ├─ clients.ts             # client roster (owner-confirmed)
│  ├─ milestones.ts          # year statues 2021–2025 (verbatim brand-book stories)
│  ├─ values.ts              # vision / mission / six values (verbatim)
│  └─ testimonials.ts        # EMPTY by design — section renders only verified quotes
├─ lib/
│  ├─ gsap.ts                # plugin registration + shared eases
│  └─ scroll.ts              # Lenis singleton + scrollToId
├─ hooks/                    # usePrefersReducedMotion, useIsTouch
├─ assets/
│  ├─ brand/                 # official vector logo (logo-wordmark.svg, logo-icon.svg)
│  ├─ fonts/                 # self-hosted ADB Fixo woff2 (Medium/Bold + italics)
│  └─ *.webp                 # chrome/glass brand objects, year statues
├─ components/
│  ├─ layout/                # Preloader, Navbar, FullscreenMenu, Footer, Logo
│  ├─ motion/                # SplitLines, Reveal, Marquee, Magnetic, ParallaxMedia, Cursor
│  └─ sections/              # Hero, Ticker, Intro, Services, Journey, Work, Clients,
│                            # Approach, Testimonials, Contact
└─ styles/
   ├─ fonts.css              # ADB Fixo @font-face declarations
   ├─ tokens.css             # design tokens — colors, type scale, spacing, z-index
   ├─ base.css               # reset, typography roles, primitives (.btn, .eyebrow…)
   ├─ layout.css             # preloader / navbar / menu / marquee / footer
   └─ sections.css           # per-section styles + responsive rules
```

**Principles:** content lives in `data/`, motion primitives are reusable, every animation has a reduced-motion path, and no component invents copy.

## Design system

All tokens in `src/styles/tokens.css`:

| Token | Value | Brand name |
|---|---|---|
| `--c-magenta` | `#c9144b` | Virtual Pink (accent) |
| `--c-navy` | `#2b344f` | Medieval Blue (surfaces) |
| `--c-vulcan` | `#0f121b` | Vulcan (page background) |
| `--c-concrete` | `#f2f2f2` | Concrete (ink — never pure white) |
| `--c-nobel` / `--c-bayoux` / `--c-brick` | `#b3b3b3` / `#4a5d7a` / `#9c1a35` | secondary palette |
| `--c-magenta-on-blue` | 65 % magenta / 35 % navy | brand tint rule for magenta on Dark Blue |

Type scale, section rhythm, and z-index layers are also tokenised — change once, applies everywhere.

### ADB Fixo (display font)

ADB Fixo is the brand's **primary** display face, self-hosted per the brand owner's
confirmation that the licence permits web embedding. It is subset to the weights the
design uses — **Medium (500)** and **Bold (700)**, each with its italic — converted to
`woff2` in `src/assets/fonts/` and declared in `src/styles/fonts.css`. Elements set at
`font-weight: 600` resolve up to Bold. `--font-display` points at `'ADB Fixo'`.

> ⚠️ **Licence:** the `.woff2` files are publicly downloadable once deployed (as with any
> web font). Keep this only while the ADB Fixo licence permits `@font-face` embedding.
> To revert to a bundled fallback, restore `@fontsource-variable/archivo` and point
> `--font-display` back at `'Archivo Variable'`.

Inter (secondary/body) is bundled via Fontsource and matches the brand spec.

## Signature moments

- **Preloader** — cycling service words + counter, clip-wipe handoff (skipped entirely under reduced motion).
- **Hero** — masked kinetic display with the rotating chrome fan as an inline media chip.
- **Service chapters** — four numbered chapters, alternating dark/light, sticky brand-object media, staggered service rows.
- **The Journey** — pinned horizontal scroll through the five year statues (≥1024 px + motion allowed); clean vertical sequence otherwise.
- **Selected Work** — real engagements with an honest branded placeholder treatment until case-study media exists.
- **Contact** — validated inquiry form (field + form errors, duplicate-submit guard, honeypot, endpoint/mailto strategy).

## Accessibility & motion

- `prefers-reduced-motion` honoured globally: no preloader, no pin, no parallax, content instantly visible; Lenis disabled (native scroll).
- Fullscreen menu: focus trap, `Escape` to close, `inert` background, scroll lock.
- Semantic landmarks, labelled sections, `aria-expanded` accordion, `aria-live` form status, skip-to-content link, visible `:focus-visible` rings.
- `html.no-js` fallback keeps all content visible without JavaScript.

## Content verification — before launch

| Item | Where | Status |
|---|---|---|
| Client roster | `data/clients.ts` | ✅ confirmed by brand owner as real, approved for public display |
| Project titles / years | `data/projects.ts` | ✅ confirmed by brand owner — approved to publish |
| Testimonials | `data/testimonials.ts` | empty — add only verified quotes |
| Phone number | `data/site.ts` | omitted (brand book contains a placeholder) — add real number if wanted |
| Instagram handle | `data/site.ts` | ⚠ `solu1ions.bd` (brand book) vs `solu1ions_bd` (live site) — confirm which is current |
| Case-study media | `data/projects.ts → media` | replace `null` with real imagery to swap out placeholders |
| Logo files | `src/assets/brand/` | ✅ official vector wordmark + icon (recolourable via the `Logo` component) |
| OG / social preview | `public/og-image.png` | regenerate if branding changes |

## Deployment

Static output — any static host (Netlify, Vercel, Cloudflare Pages, nginx):

```bash
npm run build   # → dist/
```

- Set `VITE_CONTACT_ENDPOINT` as a build-time env var on the host.
- `robots.txt` + `sitemap.xml` reference `https://solu1ions.com` — adjust if the domain differs.
- Single route only; no SPA-rewrite rules needed.

## Browser support

Vite's `baseline-widely-available` target (Chrome 107+, Safari 16+, Firefox 104+). Uses `color-mix()`, `svh` units, and CSS grid-row transitions — all within that baseline.
