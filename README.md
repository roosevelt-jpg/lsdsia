# Life Star Driving School — Instructor Academy

Online Minnesota instructor-licensing preparation with campus practical training at Life Star Driving School’s Minnesota main campus.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma for local/dev (use a hosted Postgres `DATABASE_URL` on Vercel)
- Cookie session auth (`jose` + `bcryptjs`)
- Stripe Checkout + webhooks for online fees

## Required environment variables

Copy `.env.example` → `.env` and set values locally (or in the Vercel project settings). **Never commit secrets.** Demo/admin passwords come only from env — there are no hardcoded defaults in seed or this README.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Local: `file:./dev.db`. Vercel: Postgres connection string (Neon/Vercel Postgres/etc.) |
| `AUTH_SECRET` | Yes | Session signing secret (long random string) |
| `NEXTAUTH_SECRET` | Optional | Alias fallback for `AUTH_SECRET` |
| `NEXTAUTH_URL` | Yes in prod | Public site origin, e.g. `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Seed | Admin account email (default in example file is a placeholder address) |
| `ADMIN_PASSWORD` | Seed | Admin password — **must be set**; seed fails without it |
| `DEMO_EMAIL` | Seed | Demo candidate email |
| `DEMO_PASSWORD` | Seed | Demo candidate password — **must be set**; seed fails without it |
| `STRIPE_SECRET_KEY` | Payments | Stripe secret (`sk_test_…` / `sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Payments | Webhook signing secret (`whsec_…`) |

Demo logins: use whatever you put in `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `DEMO_EMAIL` / `DEMO_PASSWORD`. Do not paste those values into docs, tickets, or chat.

## Quick start (local)

```bash
cp .env.example .env
# Edit .env — set AUTH_SECRET, ADMIN_PASSWORD, DEMO_PASSWORD (and Stripe keys if testing payments)
npm install
npm run db:seed
npm run dev
```

App: [http://127.0.0.1:3047](http://127.0.0.1:3047)

The demo candidate (when seeded) has the first four lessons unlocked so the learn flow works without Stripe.

## Stripe test mode

1. Set Stripe keys in `.env` (see table above).
2. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3047/api/webhooks/stripe
   ```
3. Use Stripe test cards (e.g. `4242 4242 4242 4242`).

If Stripe keys are missing, the catalog stays browsable and shows “payments not configured”. Admins can mark orders paid manually for wire/cash. Entitlements are granted only after `checkout.session.completed` (webhook) or an admin “mark paid” action.

## Deploy on Vercel

1. **Import** the GitHub repo (`roosevelt-jpg/lsdsia`) in [Vercel](https://vercel.com/new) → Import Git Repository.
2. Framework preset: **Next.js** (default). Build command `npm run build` / output detected automatically.
3. **Environment variables** — add every required row from the table above (`DATABASE_URL` must be Postgres for serverless; SQLite file URLs are local-only). Also set Stripe keys if you want checkout live.
4. For Postgres: change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` (or maintain a production schema) so Prisma matches your hosted database, then redeploy / run migrate.
5. After first deploy, run seed once against the production DB (local machine or one-off job) with `ADMIN_*` / `DEMO_*` set in that environment — never bake passwords into the repo.
6. Point Stripe webhook to `https://<your-domain>/api/webhooks/stripe`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server on `0.0.0.0:3047` |
| `npm run db:seed` | Push schema + seed levels, lessons, prices, quiz bank, users |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Production server on port 3047 |

## Product surface

- Landing + `/pricing` by enrollment level (Foundation / Professional / School Operator)
- Candidate: enroll, store, learn (locks), practice exam (~125 cleaned Q&A items), application packet, MN practicum
- Admin: levels, pricing matrices, candidates, orders, content, quizzes, practicum confirmations

Quiz answer key lives at `prisma/data/quiz-bank.json` for **seed only**. It is not under `public/` and must not be exposed as a static download.
