# jodi

A full-stack build of the **jodi** design handoff — a South Asian dating app: a curated five-a-day swipe deck, prompt-based profiles with real compatibility scoring, a crushes ("who's into you") grid, realtime chat, the match moment, and an editable profile.

This is a real, working multi-user product — accounts, a database, a matching engine, and live chat between independent browser sessions — not a single-player mock. It started as a faithful rebuild of the interactive prototype in `../Jodi.dc.html`; it now has a real Express + Prisma backend behind it. See **"What's still missing"** below for what separates this from something you'd actually submit to an App Store.

## Architecture

```
design_handoff_jodi/
  client/   Vite + React + TypeScript — the phone-frame UI
  server/   Express + Prisma (SQLite) + Socket.IO — auth, matching, chat, uploads
```

- **Auth**: email + password, JWT, 18+ birthdate gate enforced server-side.
- **Matching**: "five for today" is computed server-side — real candidates, excluding anyone already swiped on or blocked, ranked by a real compatibility score (shared languages, faith, "what you want," interests) then seeded-shuffled so the five are stable through the day and rotate tomorrow.
- **Swipes & matches**: like/pass/rose are persisted; a mutual like/rose creates a real `Match` row. Both sides get notified instantly over a socket — whoever completes the match sees it from their swipe response, the other person gets a `match` push event — matching how real dating apps notify both sides, not just the one who happened to complete it.
- **Chat**: persisted `Message` rows, delivered live over Socket.IO to whoever has that match's room open, with a live typing indicator. Opening a thread marks the other person's messages read.
- **Profile editing**: name/city/prompts/preferences/photos/voice intro are all real, editable, and persisted. "Profile strength" is computed from what's actually filled in.
- **Voice intros**: recorded in-browser (MediaRecorder), uploaded, and played back for real — not a static waveform graphic.
- **Report & block**: both persisted; blocking hides the match/conversation from *both* sides and is enforced server-side (you can't message a match that's been blocked, not just hidden client-side).

## Run it

First time:

```sh
npm install                # installs the root orchestrator (concurrently)
npm run install:all        # installs client + server dependencies
cp server/.env.example server/.env   # then edit server/.env if you want a real JWT secret
npm run db:setup           # creates the SQLite db and seeds 10 demo profiles
npm run dev                # runs both client (5173) and server (4000) together
```

Open http://localhost:5173. Sign up for real, or log in as any seeded demo account (`aisha@demo.jodi` … `sana@demo.jodi`, password `password123`) to see a populated deck immediately.

To try matching/chat between two accounts, open two browser profiles (or one normal + one incognito window) so they get separate localStorage/sessions, and sign up or log in as two different users in each.

## Build

```sh
npm run build
```

Builds both workspaces. `server`'s build also lets it serve `client/dist` directly (`npm start` in `server/` after building) if you want a single process serving both API and UI.

## Structure

- `server/prisma/schema.prisma` — the data model: User, Prompt, Photo, Swipe, Match, Message, Report, Block
- `server/src/routes/` — auth, profile (incl. photo/voice upload), deck (matching + swipe), likes, matches, messages, safety (report/block)
- `server/src/lib/compatibility.ts` — the actual scoring function behind "X% match"
- `server/src/index.ts` — Express app + Socket.IO wiring (presence, chat rooms, match notifications)
- `client/src/useJodiApp.ts` — all client state and API/socket wiring (deck drag/fling physics stay client-side; everything else talks to the server)
- `client/src/components/` — one component per screen, plus the bottom nav, profile detail overlay, and match modal
- `client/src/AuthContext.tsx` — session/token management

## What's still missing

Deliberately out of scope for an engineering build — these need real business/legal/vendor decisions, not code:

- **Native mobile app** — done, see `mobile/`: a from-scratch React Native (Expo) rewrite, not a web wrapper. Not yet verified on an actual iOS simulator/device (no Mac available in the environment this was built in) — see `mobile/README.md`.
- **Backend deployment** — not yet actually deployed (needs your hosting account), but fully configured and locally verified: `server/Dockerfile`, `server/fly.toml`, and the exact `prisma migrate deploy` → boot sequence. See `DEPLOY.md`.
- **App Store submission** — needs your Apple Developer account, the EAS build/submit run, and on-device testing. See `mobile/README.md`'s submission walkthrough.
- **Privacy Policy** — a real policy describing this app's actual data practices is written at `docs/privacy.html`, ready to host via GitHub Pages. It still needs your contact/legal details filled in and a lawyer's review before real users sign up — no Terms of Service or business entity yet either.
- **Paid ID/photo verification** (Veriff/Persona/Onfido) — the `verified` badge is just a database flag today; there's no real liveness or ID check behind it.
- **Payments** — the "Jodi Gold" upsell is inert by design (it tells you payments aren't wired up rather than faking a purchase). Real IAP requires an Apple/Google developer account and billing integration.
- **Phone number / Apple / Google sign-in** — email + password only. No SMS provider is configured.
- **Push notifications** — realtime updates work in-app via Socket.IO while the app is open; there's no mobile/web push for when it's closed.
- **Moderation** — reports are recorded (`Report` table) but there's no admin queue or staff tooling to act on them.

See `../Launch Guide.dc.html` for the fuller picture of what launching for real involves.
