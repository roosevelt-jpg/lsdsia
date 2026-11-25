# Life Star Driving School — Instructor Academy

Online Minnesota instructor-licensing preparation with campus practical training at Life Star Driving School’s Minnesota main campus.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma locally (Postgres on Vercel — see below)
- Cookie session auth (`jose` + `bcryptjs`)
- Stripe Checkout + webhooks for online fees

## Quick start

```bash
cp .env.example .env
# Edit .env: set AUTH_SECRET, ADMIN_PASSWORD, and DEMO_PASSWORD (required for seed)
npm install
npm run db:seed
npm run dev
```

App: [http://127.0.0.1:3047](http://127.0.0.1:3047)

### Demo logins

Emails default to `admin@lifestar.academy` and `demo@lifestar.academy`.  
**Passwords come only from your `.env`** (`ADMIN_PASSWORD` / `DEMO_PASSWORD`) — nothing is hardcoded in the repo.

The demo candidate has the first four lessons unlocked so the learn flow works without Stripe.

## Stripe test mode

1. Set in `.env`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
2. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3047/api/webhooks/stripe
   ```
3. Use Stripe test cards (e.g. `4242 4242 4242 4242`).

If Stripe keys are missing, the catalog stays browsable and shows a clear “payments not configured” message. Admins can mark orders paid manually for wire/cash.

Entitlements are granted only after `checkout.session.completed` (webhook) or an admin “mark paid” action.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server on `0.0.0.0:3047` |
| `npm run db:seed` | Push schema + seed levels, lessons, prices, full quiz bank, users |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Production server on port 3047 |

## Deploy on Vercel

**Production branch must be `main` and must contain the Next.js app** (not only the empty GitHub “Initial commit”). If the domain shows Vercel’s plain `404 NOT_FOUND`, Production was almost certainly still deploying that empty commit — Redeploy after `main` has `package.json` + `src/`.

1. In [Vercel](https://vercel.com): **Add New… → Project → Import** `roosevelt-jpg/lsdsia` (Framework Preset: **Next.js**, Root Directory: **`.`**).
2. Project → **Settings → Git**: Production Branch = `main`.
3. Add a **Postgres** store (Vercel Postgres / Neon / Supabase) and copy the connection string. SQLite file URLs do not work on Vercel serverless.
4. In Project → **Settings → Environment Variables**, set at least:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres URL from step 3 |
| `AUTH_SECRET` | Long random string |
| `NEXTAUTH_SECRET` | Same or another random string |
| `NEXTAUTH_URL` | `https://lifestar.myflynai.com` (or your `*.vercel.app`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin (run seed once) |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Optional demo candidate |
| `STRIPE_SECRET_KEY` | Live or test |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Matching publishable key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint → `/api/webhooks/stripe` |

5. **Postgres provider:** set `provider = "postgresql"` in `prisma/schema.prisma` for production (local can stay sqlite in a separate branch/env). Then **Deployments → Redeploy** the latest `main` commit.
6. After a green deploy, seed once against production:  
   `DATABASE_URL=… ADMIN_PASSWORD=… DEMO_PASSWORD=… npx prisma db push && npx tsx prisma/seed.ts`
7. Stripe webhook: `https://lifestar.myflynai.com/api/webhooks/stripe` for `checkout.session.completed`.

Landing and `/pricing` can render without a seeded DB (tuition fallbacks).

### Login on Vercel (required env)

Without these, `/login` submit fails (server exception). In **Vercel → Settings → Environment Variables** (Production), set:

1. `AUTH_SECRET` — long random string  
2. `ADMIN_PASSWORD` — admin login password  
3. `DEMO_PASSWORD` — demo candidate password  
4. Optional: `ADMIN_EMAIL` / `DEMO_EMAIL` (defaults `admin@lifestar.academy` / `demo@lifestar.academy`)  
5. Optional: `DATABASE_URL` Postgres URL (recommended). If unset, the build seeds a SQLite file for serverless.

Then **Deployments → Redeploy** the latest `main` commit (enable “Use existing Build Cache” off if the DB did not seed).

Login emails default to `admin@lifestar.academy` / `demo@lifestar.academy`; passwords are exactly the values you set above — nothing is hardcoded in the repo.

## Security notes

- Admin UI and admin server actions require an authenticated **admin** session (`requireUser(["admin"])` redirects otherwise).
- JSON APIs use `getAuthorizedUser` and return **401** when unauthorized.
- Quiz answer bank lives at `prisma/data/quiz-bank.json` (seed-only). Routes `/quiz-bank.json` and `/content/*` redirect away so answer keys are not publicly downloadable.

## Product surface

- **Marketing site (CMS-driven)** — homepage matches the ChatGPT Life Star mock (navy/gold): `/`, `/programs`, `/admissions`, `/students`, `/resources`, `/about`. Admin manages copy/images at **`/admin/website`**. Defaults seed from `src/lib/cms-seed.ts`; placeholder photos in `public/cms/` (replace via CMS upload → `/api/cms-media/[key]`).
- **Auth / onboarding UI** — split-pane Sign In (`/login`), Create Account (`/signup`), Forgot/Reset Password, Role Selection (`/onboarding/role`), 4-step Profile (`/onboarding/profile`), Welcome (`/onboarding/welcome`). Remember-me, password visibility, Google/Microsoft OAuth when env credentials are set, admin role gated by `ADMIN_INVITE_CODE`.
- `/pricing` (BTW $7,000 / Classroom $15,000 with 50% down payment plans; online levels separate) — tuition prefs unchanged
- Candidate: **driver’s license upload** (`/app/onboarding/license`) required before other `/app` routes; enroll, store, learn, quiz, application, practicum
- **Student identity card** on the candidate dashboard: passport photo (private upload), enrollment number, program, dates, Code 128 barcode; admin print at `/admin/candidates/[id]/id-card` for Minnesota campus exams
- **Digital certificate** (`/app/certificate`): auto-issued when an admin marks the program certified (if the student has passed the practice exam); admins can also **Issue certificate** from Candidates (completes program + issues, with a clear error if not eligible). Public verify: `/verify/[code]`
- **School launch** (`/app/school-launch`): after certification, coaching to register/operate a driving school (U.S. state DMV/operator packet — not legal advice); academy welcomes students worldwide (campus practicals remain in Minnesota)
- Admin: premium console, **Website CMS**, licenses, school-launch, print student IDs, issue certificates, levels, pricing, candidates, orders, content, quizzes, practicum

### Certificate signatories & registration IDs

- Owner signature is fixed product copy: **John Addo**, Owner (`src/lib/certificate-brand.ts`).
- Program Director name + MN registration / operator license placeholders live on `SchoolSetting` (`programDirectorName`, `schoolRegistrationId`, `operatorLicenseId`). Seed from env `PROGRAM_DIRECTOR_NAME`, `LSDS_SCHOOL_REGISTRATION_ID`, `LSDS_OPERATOR_LICENSE_ID`, or edit the `SchoolSetting` row / constants in `certificate-brand.ts`.

### Private uploads

License, school-launch, and student ID photos are stored in the database as private blobs and served only via `/api/private-uploads/[id]` to the owning candidate or an admin. They are never placed under `public/`.
