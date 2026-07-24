# ChildcareOS

ChildcareOS is a safety operations prototype for childcare centers. It demonstrates three tightly scoped workflows:

- Server-compatible staff-to-child ratio and capacity decisions.
- Pickup authorization that treats revoked access as a hard block.
- Incident drafts grounded in staff observations with mandatory review and separate guardian notification.
- A real Groq operations agent that advises without changing safety state.
- Optional Solana wallet connection and signed devnet audit proofs.
- Motion-powered page and component transitions with reduced-motion support.

## Live MVP

- Production: `https://getchildcareos.vercel.app`
- Source: `https://github.com/bryankwandou/childcareos`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the public site, `/dashboard` for the operations console, and `/guardian` for the scoped guardian view.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current boundary

This repository is a functional product prototype. The safety decision functions and UI flows are implemented and tested. Production rollout still requires Supabase authentication, database persistence, row-level security policies, jurisdiction-specific ratio configuration, and a verified transactional notification provider.

The production schema and RLS contract are included in `supabase/migrations/001_initial.sql`. The running demo uses an in-memory store so every workflow can be tested without external credentials.

## Verified Solana devnet proof

- Public wallet: `35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr`
- Transaction: `26EeeFRZ3NaLfwhABzLrTUpXRq1MPtud1uE8EDeJyUE515YiYVN5w4SkPvBDGd8Sz4QmXpqd8MLR4hxg9TeuovoL`
- Cluster: Solana devnet
