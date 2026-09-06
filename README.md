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
tsconfig.json             TypeScript config
.eslint.config.mjs        ESLint config
postcss.config.mjs        PostCSS / Tailwind integration

app/                      Next.js app directory (App Router)
  _components/
    landing/              Landing page components (Hero, steps)
    navigation/           Navbar and navigation components
  (client)/app/           Client-side app entry (redirects)
  page.tsx                Root landing page (imports landing + navbar)

components/               Reusable UI components (project-specific)
config/                   Runtime / infra configuration files (env-aware)
lib/                      App helpers & services
  helperFunctions.ts
  sanitization.ts         AI response JSON extraction & sanitization logic
  utils.ts
  SessionProviderWrapper.tsx
  services/               API integrations and service helpers

models/                   Mongoose models (persistence layer)
types/                    Type definitions used throughout the app
public/                   Static assets (logos, images, favicons)
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
