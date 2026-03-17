# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project location

`~/my-app` (`/Users/felixhelson/my-app`)

## Commands

```bash
cd ~/my-app
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type-check without emitting
```

## Architecture

Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand, Supabase, Stripe.

### Two Modes

The app runs in **demo mode** (client-side only, no database) or **live mode** (Supabase auth + DB). Demo mode is triggered when the user selects it on the login screen, which sets `user.id = 'demo-user-1'` in the auth store. All pages/actions check this to decide whether to call Supabase or use mock data.

### Auth & State

- `app/page.tsx` — Login/signup/demo entry point. On success, sets Zustand stores and redirects to `/home`.
- `src/store/authStore.ts` — Auth via Supabase (`supabase.auth.signInWithPassword` / `signUp`). User profile (including `pointsBalance`) fetched from `profiles` table.
- `src/store/partnersStore.ts` — Partners/cycles read/written directly to Supabase. `cycleStatus` always computed client-side by `cycleEngine.ts`.
- Protected pages read from these stores directly — there's no middleware-based auth guard.

### Supabase (`src/lib/supabase.ts` + `src/lib/supabase-server.ts`)

- Browser client uses anon key (respects RLS) — import from `src/lib/supabase.ts`
- Server/API route client uses service role key (bypasses RLS) — import from `src/lib/supabase-server.ts`
- Schema is at `supabase/schema.sql` — run in the Supabase SQL editor to apply

### Key tables

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — firstName, profileType, pointsBalance |
| `partners` | Per-user partners with cycle settings + birthday |
| `cycles` | Period log entries per partner |
| `orders` | Purchase history, linked to Stripe session |
| `points_transactions` | Points ledger (earned/redeemed) |
| `subscriptions` | Recurring monthly orders (Stripe subscription ID) |
| `sponsors` | Tampon + gift sponsors |

### Stripe

- One-time: `app/api/checkout/route.ts` creates a Checkout session, redirects to Stripe
- Webhook: `app/api/webhooks/stripe/route.ts` handles `checkout.session.completed` (records order, awards points), `invoice.payment_succeeded` (recurring), `customer.subscription.deleted`
- Points awarded at 1 point per $1 spent, via `increment_points` Supabase RPC

### Cycle Engine (`src/lib/cycleEngine.ts`)

`calculateCycleStatus(lastPeriodStart, avgCycleLength, avgPeriodLength)` — pure client-side, no API dependency. Returns phase, day, mood alert, gift recommendations, fun facts.

### Gift & Checkout Flow

`/gifts` → `/gift/[id]` → `/api/checkout` → Stripe Checkout → `/gift/success`

- Demo mode: checkout succeeds immediately (no Stripe call)
- Live mode: Stripe session created server-side, webhook records the order

### Theme & UI

- `src/utils/theme.ts` — All colors (primary coral `#D85A30`, phase colors, etc.)
- `src/components/ui.tsx` — Shared components: `Card`, `Button`, `Avatar`, `Badge`, `PhaseBar`, `EmptyState`, `Toggle`
- `src/components/BottomNav.tsx` — Fixed bottom nav (Home / Gifts / Calendar / Profile)

### Mock Data (`src/lib/mockData.ts`)

Demo partner "Sophia" (last period 2026-02-19, 28-day cycle), user "Marcus", and 15+ mock gifts. Update `lastPeriodStart` if demo cycle status looks stale.

### Environment Variables

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # from Stripe dashboard → Webhooks
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
