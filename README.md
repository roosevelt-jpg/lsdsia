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

1. In [Vercel](https://vercel.com): **Add New… → Project → Import** `roosevelt-jpg/lsdsia` (Framework Preset: Next.js).
2. Add a **Postgres** store (Vercel Postgres / Neon / Supabase) and copy the connection string.
3. In Project → **Settings → Environment Variables**, set at least:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres URL from step 2 |
| `AUTH_SECRET` | Long random string |
| `NEXTAUTH_SECRET` | Same or another random string |
| `NEXTAUTH_URL` / `APP_URL` | Your `https://….vercel.app` (or custom domain) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin (run seed once) |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Optional demo candidate |
| `STRIPE_SECRET_KEY` | Live or test |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Matching publishable key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint → `/api/webhooks/stripe` |

4. **Postgres provider:** before the first production deploy, change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` (or keep a Postgres-ready branch). Local remains `file:./dev.db`.
5. Build command is already `prisma generate && next build` (`npm run build`). After deploy, run seed once against production (Vercel CLI or a one-off job):  
   `DATABASE_URL=… ADMIN_PASSWORD=… DEMO_PASSWORD=… npx tsx prisma/seed.ts`  
   (or `prisma db push` then seed).
6. In Stripe Dashboard, add webhook endpoint `https://<your-domain>/api/webhooks/stripe` for `checkout.session.completed`.

## Security notes

- Admin UI and admin server actions require an authenticated **admin** session (`requireUser(["admin"])` redirects otherwise).
- JSON APIs use `getAuthorizedUser` and return **401** when unauthorized.
- Quiz answer bank lives at `prisma/data/quiz-bank.json` (seed-only). Routes `/quiz-bank.json` and `/content/*` redirect away so answer keys are not publicly downloadable.

## Product surface

- Landing + `/pricing` by enrollment level (Foundation / Professional / School Operator)
- Candidate: enroll, store, learn (locks), practice exam (~125 cleaned Q&A items), application packet, MN practicum
- Admin: levels, pricing matrices, candidates, orders, content, quizzes, practicum confirmations
