# jodi

A React + TypeScript build of the **jodi** design handoff — a South Asian dating app prototype: a curated five-a-day swipe deck, prompt-based profiles with compatibility scoring, a crushes grid, chat, the match moment, and a profile screen.

This is a faithful rebuild of the interactive prototype in `Jodi.dc.html` as real, buildable source (Vite + React + TypeScript), not a redesign. Photos are still placeholder gradients — nothing here talks to a backend; all data is local mock state (see `src/data.ts`).

## Run it

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Structure

- `src/data.ts` — mock profiles, prompts, compatibility data, chat threads
- `src/useJodiApp.ts` — all app state and interaction logic (deck drag/fling physics, matching, chat, nav)
- `src/components/` — one component per screen (Discover, Crushes, Chats, Chat thread, Me) plus the bottom nav, profile detail overlay, and match modal
- `src/App.tsx` — composes the phone-frame shell around the screens

See `../Launch Guide.dc.html` for what's still needed to turn this into a shippable app (backend, auth, real matching engine, trust & safety, App Store requirements).
