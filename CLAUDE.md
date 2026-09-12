# Rakeeen Home

Personal life-dashboard for Hamed — water, focus/Pomodoro, prayer & Quran, fitness,
finance, calendar. React + TypeScript + Vite + Firebase (Firestore + Auth), deployed
to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. A companion
Discord bot lives in `backend/` (subscription reminders + gold prices — not deployed
by the same workflow, run separately).

**Read `docs/ARCHITECTURE.md` before adding or moving a file.** This file is the
short version; that one explains the layers and the reasoning.

## Commands

```
npm run dev         # local dev server (http://localhost:5173/Rakeeen-Home/)
npm run build         # production build — esbuild-based; this is the real smoke test
npm run test:run       # vitest, single run
npm run lint            # eslint
```

The repo has pre-existing eslint warnings/tsc errors that predate this guide —
`npm run build` (not `tsc`) is the pass/fail signal for "did this break the app".

## The five rules that matter most

1. **No business logic inside components.** If it doesn't need `useState`/a
   ref/a DOM or Firestore call, it's a pure function — put it in `domain/<area>/`
   with a test, and call it from the component.
2. **Time-dependent functions take `now: Date = new Date()`** as their last
   param — never call `new Date()` inside pure logic. This is what makes them
   testable without mocking the clock.
3. **Only `src/data/` imports `firebase/*`.** Everything else uses
   `useFirebaseSync` (or asks for a `data/` primitive).
4. **Imports use the `@/` alias** (`@/features/finance/useFinance`), never
   `../../..`. Never import across feature folders — shared logic goes in
   `domain/`, `ui/`, or `lib/`.
5. **Before changing behavior or UI, know what "unchanged" looks like.** Most
   refactors in this codebase are meant to be invisible — run the build, run the
   tests, and actually load the page (see "Local verification" below) before
   calling something done.

## Local verification (do this before saying a change is finished)

1. `npm run build` — must be clean.
2. `npm run test:run` — must pass.
3. Load the app locally and look at the page(s) you touched. Auth is behind
   Google sign-in; for local UI checks without a real login, `useAuth.tsx` has
   historically been temporarily patched with a `localStorage`-gated dev bypass
   (`__dev_skip_auth`) — add it, verify, then **remove it before committing**.
   Don't leave it in.

## Things that look like bugs but are load-bearing

- `getLogicalDate()` (`domain/day.ts`) rolls the "day" at 04:00, not midnight —
  water/fitness dailies use this. Focus sessions use `getPomoLogicalDate()`
  instead, which is the real calendar day (no rollback).
- The calendar depends on `VITE_ICAL_PROXY` (a Cloudflare Worker, see
  `docs/ical-proxy-worker.js`) to read Google Calendar — the browser can't fetch
  it directly (no CORS headers from Google). Without the env var it falls back to
  flaky public CORS proxies.
- `useFirebaseSync`'s `setValue` is `useCallback`-memoized on purpose — an
  earlier version recreated it every render, which made a consumer's `useEffect`
  re-run constantly and contributed to a Firestore client crash
  (`INTERNAL ASSERTION FAILED`). Don't remove the memoization.
- `src/lib/firebase.ts` forces `experimentalForceLongPolling` — that's the actual
  fix for the crash above. Don't revert it "to try WebSockets".

## Don't

- Don't add a new top-level folder under `src/` without updating
  `docs/ARCHITECTURE.md`.
- Don't put a Firestore call inside a `features/` component — go through
  `useFirebaseSync`.
- Don't reach into another feature's folder (`features/water/` importing from
  `features/finance/`) — promote the shared thing to `domain/`, `ui/`, or `lib/`.
- Don't commit with a dev-auth bypass still active, or with `.env.local` /
  secrets in the diff.
