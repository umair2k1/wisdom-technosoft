# Wisdom Technosoft — Website

Marketing site for Wisdom Technosoft. Astro 4, Tailwind CSS, GSAP + ScrollTrigger, Three.js.

One fixed 3D canvas runs behind the whole page. The page is a tall scroll track; the camera flies from station to station as you scroll and scrubs the scene at each stop.

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview
```

Node 18.17.1 or newer.

## Structure

```
src/
  data/
    content.js      all copy (hero, services, principles, vision, team, contact)
    site.js         email, phone, address, WhatsApp, maps links
    logo.js         brand mark as vector shapes (traced from logo-ghost.png): one source for
                    the nav/footer SVG, favicon.svg and the 3D emblem
  scripts/
    stage.js        tiny loader: starts the 3D world after first paint
    world.js        Three.js world: route, camera, 8 scenes, lights (own chunk, tree-shaken)
    motion.js       GSAP: hero letters, chapter reveals, HUD, principles, vision, anchor flights
    form.js         contact form + mailto/WhatsApp fallback
  components/       Nav, Logo, Hud, Hero, Chapter, Principles, Vision, Team, Contact, Footer
  layouts/          Layout.astro (head, SEO, fonts, capability check, fixed layers)
  pages/            index.astro, privacy.astro, 404.astro, api/contact.ts
  styles/           global.css (tokens + all component styles)
public/             favicons, logo PNGs, robots.txt, sitemap.xml
```

## How the scroll world works

- Each `[data-chapter="i"]` section is **station i** in 3D. Order in the DOM = order along the route:
  `0` hero, `1–5` services, `6` principles, `7` finale (vision, team, contact).
- `world.js` reads `scrollY` every frame. The camera dwells at a station for the first ~60% of that section's scroll length, then flies to the next. Inside a station, local progress (0–1) scrubs the scene.
- Scenes: your logo, extruded in metal (assembles on load, bursts apart as the camera flies through it) → blocks assemble into a skyline → voice rings and waveform → noisy points swept into a clean lattice → gears turned by the scrollbar → cross and heartbeat trace → principle carousel → the logo again (pieces fly back together on arrival).
- `data-object="left|right"` on a section sets which side the 3D object takes; the text takes the other. In portrait or narrow windows the object moves above the text.
- `motion.js` handles the DOM side: each chapter's giant background word (it sits *behind* the 3D layer), copy reveals, HUD, anchor flights, and a slight velocity skew on copy.

## Common edits

| Change | Where |
| --- | --- |
| Any text | `src/data/content.js` |
| Contact details | `src/data/site.js` |
| Add or reorder a service | `chapters` in `content.js`, a matching `buildX()` in `world.js`, a station in `STATIONS`, a stop in `Hud.astro` |
| Camera route and spacing | `STATIONS` in `world.js` |
| How long the camera dwells | `smooth(0.6, 1, …)` in `frame()` in `world.js` |
| Lighting | `key`, `fill`, `environmentIntensity` in `world.js` |
| Section scroll length | `.chapter { height }`, `.hero`, `.principles`, `.vision` in `global.css` |
| Colours and type | `:root` tokens in `global.css`, Google Fonts link in `Layout.astro` |
| Logo accent colour (the crown) | `--logo-accent` in `global.css`. The 3D emblem reads it at load; the nav crown follows the chapter accent (delete the `.brand .logo-accent` rule to pin it) |
| Logo shapes | `src/data/logo.js` |

## Fallbacks and performance

- **Plain page:** no WebGL, a lost GL context, a render error, `prefers-reduced-motion`, Save-Data, a 2G connection, a device with 2 GB of memory or less, or JavaScript turned off all get a readable static layout (`html.no-stage`). Nothing is hidden by CSS permanently: with JS on, animated elements are held back only until `motion.js` releases them, and CSS shows them after 3.5 s if scripts fail.
- **Weight:** Three.js loads as its own tree-shaken chunk after first paint and all materials are compiled once up front. Particle counts, pixel ratio and antialiasing drop on small or touch screens, and the pixel ratio falls to 1 if the first two seconds run slowly. The render loop pauses when the tab is hidden.
- **Fonts:** Instrument Serif and Inter Tight come from Google Fonts, as before. To remove that third-party request, self-host them (for example with Fontsource) and delete the three font `<link>` tags in `Layout.astro`.

## Contact form

The form posts JSON to `PUBLIC_FORM_ENDPOINT` (see `.env.example`), or to the bundled `/api/contact` route when it is empty. That route needs a server adapter; on static hosting it does not exist, so the form hands the same details to the visitor's email client or WhatsApp. To submit for real on static hosting, set `PUBLIC_FORM_ENDPOINT` to a form service URL (Formspree, Web3Forms, your own API) at build time.

## SEO and deployment

- `npm run build` writes a fully static site to `dist/`; any static host works.
- `public/robots.txt` and `public/sitemap.xml` assume `https://wisdomtechnosoft.com` (matches `site` in `astro.config.mjs`).
- `Layout.astro` adds canonical, Open Graph, Twitter and Organization JSON-LD tags; `404.astro` is marked `noindex`.

## Assets

- `src/data/logo.js` holds the brand mark as four vector shapes traced from `logo-ghost.png`. The nav and footer render it as inline SVG (`Logo.astro`), `public/favicon.svg` is generated from it, and `world.js` extrudes the same shapes into the 3D emblem.
- `public/` also has your original files: `favicon-32.png`, `favicon.png`, `apple-touch-icon.png` (linked in `Layout.astro`; `favicon.png` doubles as the share image) and `logo-mark.png`, `logo-mark-light.png`, `logo-mark-brand.png`, `logo-ghost.png` (kept for print, decks and social; the page does not load them).
- Brand colours: ivory `#f4f0e8`, crown `#c9a27e`.
