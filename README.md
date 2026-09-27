# Safar AI

AI-powered travel planner that generates personalized, editable itineraries in seconds. Users describe their destination, duration, interests and budget, and Safar AI creates a ready-to-use trip with locations, images, estimated times, and weather — all enriched and saved for later editing or sharing.

---

## Key features

- AI-generated itineraries tailored to user preferences
- Automatic JSON extraction & normalization of AI output
- Geocoding of venues and fallback strategies for robust coordinates
- Automatic image lookup (Wikipedia thumbnails) for venues
- Weather lookup for trip dates (first activity coordinates)
- Editable itineraries with real-time AI re-generation when the user updates a plan
- Authentication (NextAuth) and email notifications (nodemailer)
- MongoDB persistence via mongoose

---

## Stack

- Language(s): TypeScript
- Framework / runtime: Next.js (App Router, Next 15) + React 19
- Notable libraries/services:
  - @google/generative-ai (AI generation)
  - mongoose (MongoDB)
  - next-auth (authentication)
  - tailwindcss (styling)
  - nodemailer (email)
  - date-fns, framer-motion, radix-ui (UX / utility)

---

## How it's organized

Top-level layout (annotated):

```
README.md                 Project readme (this file)
package.json              npm scripts + dependencies
next.config.ts            Next.js configuration
seo.config.ts             Central SEO/PWA metadata (titles, OG, JSON-LD, sitemap entries)
tsconfig.json             TypeScript config
.eslint.config.mjs        ESLint config
postcss.config.mjs        PostCSS / Tailwind integration
scripts/
  generate-icons.mjs      Regenerates favicon/icons/og-image from the navbar logo

app/                      Next.js app directory (App Router)
  _components/
    landing/              Landing page components (Hero, steps)
    navigation/           Navbar and navigation components
    seo/                  JsonLd helper for schema.org structured data
  (client)/app/           Client-side app entry (redirects)
  page.tsx                Root landing page (imports landing + navbar)
  robots.ts               Generates /robots.txt
  sitemap.ts              Generates /sitemap.xml
  favicon.ico             Favicon (generated from the navbar logo)

components/               Reusable UI components (project-specific)
config/                   Runtime / infra configuration files (env-aware)
lib/                      App helpers & services
  faq.ts                  Marketing FAQ copy (shared by the page and its JSON-LD)
  helperFunctions.ts
  sanitization.ts         AI response JSON extraction & sanitization logic
  utils.ts
  SessionProviderWrapper.tsx
  services/               API integrations and service helpers

models/                   Mongoose models (persistence layer)
types/                    Type definitions used throughout the app
public/                   Static assets (logos, destination photos, generated PWA icons)
```

How it fits together (runtime shape):
- The Next.js App Router serves the landing and the app UI. Users create trips via the UI which triggers an AI generation request (server-side).
- AI response is sanitized & JSON-extracted (lib/sanitization.ts), normalized (venue/city/country), then enriched: geocoding (Nominatim or similar), image lookup (Wikipedia), and weather (Open‑Meteo).
- The enriched trip is stored in MongoDB through mongoose models and surfaced to the UI for display and editing.

---

## How it works (core flow)

1. User creates a trip: destination, duration, budget, interests.
2. AI generates an itinerary (AI returns text with JSON payload describing activities).
3. Extract & sanitize JSON from AI response (robust to formatting/text noise).
4. Normalize activities into structured fields (venue, city, country).
5. Geocode each location → lat/lon (primary: "venue, city, country", fallback: "city, country").
6. Fetch images (Wikipedia thumbnail) for venue; fallback to city image.
7. Get weather for trip dates from a weather API (first activity coordinates used).
8. Save the fully enriched trip to the database.
9. Display itinerary in UI with images, weather, and map links.

The flow and decisions are implemented in the repository helper files (see lib/ and safar ai flow outline).

---

## Getting started (local development)

Prerequisites
- Node.js (v18+ recommended; project aligns with Node 20 typings)
- npm (or yarn / pnpm)
- MongoDB (local or hosted)

Install & run locally:

```bash
# install dependencies
npm install

# development server (uses turborpack flag shown in package.json)
npm run dev
# → opens at http://localhost:3000
```

Available scripts (from package.json)
- dev: next dev --turbopack
- build: next build
- start: next start
- lint: next lint

---

## SEO, branding and PWA assets

**One place for all page metadata.** `seo.config.ts` holds the site URL (from
`NEXT_PUBLIC_BASE_URL`), the brand/PWA colours, the icon paths and a `PAGE_SEO`
table with the title, description, keywords, canonical path and index policy for
every route. Pages spread those values in with `buildMetadata("signIn")`, and the
same table feeds `app/sitemap.ts` (routes flagged `sitemap: true`) and
`app/robots.ts` (routes flagged `noindex` plus `ROBOTS_DISALLOW`). Client-rendered
screens under `app/(client)/app/*` get their metadata from the small server
`layout.tsx` files next to them.

Structured data is rendered by `app/_components/seo/JsonLd.tsx`: `Organization`
and `WebSite` site-wide (which tell Google your official site name and logo for
search results), plus `SoftwareApplication` on the landing page (which declares
the app category and free tier). Low-value markup (`FAQPage`, `BreadcrumbList`,
`WebPage`) was omitted to keep the server output lean.

**Brand colours.** Interactive design tokens in `app/globals.css` (`--primary`,
`--ring`, `--accent`, `--sidebar-*`, `--chart-*`) point at the brand coral, so
focus rings, hovers and primary surfaces are on-brand without per-component
overrides. The gradient itself is exposed as `bg-brand-gradient`,
`bg-brand-gradient-diagonal`, `bg-brand-gradient-muted` and `text-brand-gradient`
utilities, and the shared `Button` default variant uses it.

**Icons and social card.** Pre-rendered PNG/ICO/JPG assets derived from the
vector-drawn logo pin mark are structured under `public/assets/pwa-icons/`:
- `app/favicon.ico` (multi-resolution 16/32/48 browser tab icon)
- `public/assets/pwa-icons/browser-tab-96x96.png` (high-DPI tab icon)
- `public/assets/pwa-icons/apple-homescreen-180x180.png` (iOS Safari home screen icon)
- `public/assets/pwa-icons/pwa-android-192x192.png` (Android launcher icon)
- `public/assets/pwa-icons/pwa-splash-512x512.png` (PWA splash screen icon)
- `public/assets/pwa-icons/pwa-maskable-512x512.png` (Android adaptive maskable icon)
- `public/assets/pwa-icons/social-share-og-1200x630.jpg` (OpenGraph/Twitter sharing banner)

`public/manifest.json`, `public/sw.js`, and `seo.config.ts` mirror these exact asset locations.

---

## Required environment variables

Create a `.env.local` in the project root with at least the following entries (names are suggestions based on code & dependencies — adjust to match your deployment):

```
# Database
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/safarai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<a long random value>"

# Email (nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM="no-reply@safar.ai"

# Google / AI credentials
# Either a key or set GOOGLE_APPLICATION_CREDENTIALS to a JSON key file
GOOGLE_API_KEY="<key or leave unset if using service account>"
# or
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Optional 3rd-party services referenced by flow:
# NOMINATIM_USER_AGENT="safar-ai-your-email@example.com"
# OPEN_METEO_BASE_URL="https://api.open-meteo.com"
```

Notes:
- Double-check which variable names the application actually reads (search for process.env.* in server code).
- Do not commit secrets to version control.

---

## Deployment

The project is compatible with Vercel (Next.js first-class). Common steps:
1. Connect the repository to Vercel.
2. Add environment variables in Vercel dashboard (same names as in .env.local).
3. Deploy; Vercel will run `npm run build` and `npm start`.

If hosting elsewhere, ensure server-side environment variables and MongoDB access are configured.

---

## Development notes & areas to check

- AI pipeline: make sure the generative AI credentials are configured and that rate limits are monitored.
- JSON extraction: sanitization logic is in lib/sanitization.ts — test with a range of AI outputs.
- Geocoding: code falls back to city-level queries when venue-level geocoding fails.
- Images: Wikipedia thumbnails are used where available; images are lazy-loaded in the UI.
- Authentication & emails: next-auth + nodemailer used for auth flows and notifications — requires working SMTP and NEXTAUTH_SECRET.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: git checkout -b feat/my-change
3. Commit changes and open a PR with a clear description of the change.
4. Follow the existing code style (TypeScript + Tailwind). Run linters before submitting.

If you plan to work on an area not obvious from the code:
- Check lib/ (AI + sanitization), models/ (DB schema), and app/_components for UI behavior.
- Open an issue describing the change or feature if it is non-trivial.

---

## Troubleshooting

- App not starting: ensure MONGODB_URI is reachable and NEXTAUTH_SECRET is set.
- AI generation failures: confirm Google generative AI credentials and that the project has quota.
- Geocoding/image/weather failures: check external API availability and any required API keys.

---

## License

No license specified. If you want to make this open-source, add a LICENSE (MIT, Apache-2.0, etc.) to the repository.

---

## Maintainer / Contact

Repository owner: ZaryabAli-09  
For questions, open an issue or PR on this repository.
