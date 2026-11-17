# Life Star Driving School — Instructor Academy

Online Minnesota instructor-licensing preparation with campus practical training at Life Star Driving School’s Minnesota main campus.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma (swap to Postgres with `DATABASE_URL`)
- Cookie session auth (`jose` + `bcryptjs`)
- Stripe Checkout + webhooks for online fees

## Quick start

```bash
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

App: [http://127.0.0.1:3047](http://127.0.0.1:3047)

### Demo logins (from `.env`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@lifestar.academy` | `LifeStarAdmin!2026` |
| Candidate (Professional) | `demo@lifestar.academy` | `DemoCandidate!2026` |

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
| `npm run build` | Production build |
| `npm run start` | Production server on port 3047 |

## Product surface

- Landing + `/pricing` by enrollment level (Foundation / Professional / School Operator)
- Candidate: enroll, store, learn (locks), practice exam (~125 cleaned Q&A items), application packet, MN practicum
- Admin: levels, pricing matrices, candidates, orders, content, quizzes, practicum confirmations

Quiz bank: `content/quiz-bank.json` (cleaned against Instructor Quiz / Q&A materials).
