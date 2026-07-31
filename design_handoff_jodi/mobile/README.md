# jodi (mobile)

A React Native (Expo) build of jodi, talking to the same backend as `../server/` — real accounts, matching, and chat, on your phone instead of in a browser.

This is a from-scratch React Native rewrite of `../client/`, not a wrapped web view: native gestures (`PanResponder`) for the swipe deck, `expo-audio` for real in-app voice-intro recording/playback, `expo-image-picker` for photo uploads, and `expo-linear-gradient`/`react-native-svg` for the visuals. I could not run this on an iOS simulator or a physical device to verify it visually — there's no Mac or simulator available in the environment this was built in. It type-checks cleanly and the logic is a direct, careful port of the already-verified web client, but **you should treat first real-device testing as part of bringing this up**, not a formality.

## Run it locally (Expo Go — fastest way to see it on your phone)

```sh
cd mobile
npm install
cp .env.example .env   # then edit EXPO_PUBLIC_API_URL, see below
npx expo start
```

Scan the QR code with the **Expo Go** app (App Store / Play Store) on your phone. Make sure `../server` is running (`npm run dev` from the repo root) and reachable from your phone.

### Setting `EXPO_PUBLIC_API_URL`

Your phone is a separate device on the network — `localhost` in `.env` means *the phone itself*, not your computer. Set it to your computer's LAN IP instead:

```sh
# find your LAN IP, e.g.:
#   macOS:   ipconfig getifaddr en0
#   Linux:   hostname -I
EXPO_PUBLIC_API_URL=http://192.168.1.23:4000
```

For the iOS Simulator specifically (which shares your Mac's network), `http://localhost:4000` does work. For a real device or an Android emulator, use the LAN IP. For a real build heading to TestFlight/production, point it at your deployed server's public URL instead.

## Getting this onto the App Store

I can build everything up to the point that needs your Apple account, your money, or your judgment call. Here's the actual sequence and who does which part:

### 1. Deploy the backend to a public HTTPS URL

`../server/` needs to be reachable from the internet before you build — see `../DEPLOY.md` for the full walkthrough (Fly.io, with a persistent volume for the SQLite database and uploaded photos/voice clips). Once deployed you'll have a URL like `https://jodi-yourname.fly.dev`.

Put that URL into `mobile/eas.json`'s `build.production.env.EXPO_PUBLIC_API_URL` (already wired up — just replace the placeholder) so the production build talks to your real backend instead of localhost.

### 2. Accounts you need (you, not me)
- **Apple Developer Program** — $99/year, at [developer.apple.com](https://developer.apple.com). As a company you'll also need a D-U-N-S number, which can take 1–2 weeks — start this early.
- **Expo account** — free, at [expo.dev](https://expo.dev). This is what lets you build for iOS without owning a Mac (see below).

### 3. Build with EAS (no Mac required)

[EAS Build](https://docs.expo.dev/build/introduction/) compiles the iOS binary in Expo's cloud. You still need the Apple Developer account from step 2, but not a physical Mac.

```sh
npm install -g eas-cli
eas login
eas build:configure          # links this project to your Expo account
eas build --platform ios --profile production
```

The first run will walk you through generating/uploading iOS credentials (or let EAS manage them for you — recommended unless you already have a specific provisioning setup).

### 4. Submit

```sh
eas submit --platform ios --profile production
```

This uploads the build to App Store Connect. From there you fill in the store listing and submit for review — that part's in App Store Connect's web UI, not the CLI.

### 5. What you'll need ready for the listing

- **App icon**: `assets/icon.png` is already a real 1024×1024 icon (the jodi mark), not a placeholder — usable as-is or swap it.
- **Screenshots** for 6.7" and 6.5" iPhone sizes. Take these from a real run of the app (simulator screenshots work) once you've verified it looks right on-device.
- **Privacy Policy URL** — a real policy is written at `../docs/privacy.html`, accurate to what this app actually collects and does with data. It still needs your contact email and legal entity/governing-law details filled in (marked with `[ ]` placeholders at the top of the page), and a lawyer's review before real users sign up. To host it: enable GitHub Pages on this repo (Settings → Pages → deploy from the `main` branch, `/docs` folder) and use `https://<your-github-username>.github.io/<repo>/privacy.html` as the Privacy Policy URL in App Store Connect.
- **Support URL**, app description, keywords, age rating (17+ or 18+, set honestly for a dating app).
- **A populated demo account** for the reviewer — Apple rejects empty-looking dating apps (guideline 2.1). Sign up a demo account ahead of time, seed it with a couple of profile prompts, and note the login in your review notes. The server's seed script (`npm run seed --prefix ../server`, or `fly ssh console -C "npm run seed"` against the deployed instance) already gives you 10 populated demo accounts you can hand to a reviewer directly (`aisha@demo.jodi` … `sana@demo.jodi`, password `password123`) — swap these out before a real public launch, they're for review/testing only.

### The Apple review guidelines most likely to bite a dating app

| Guideline | What it means here |
|---|---|
| 1.2 (UGC) | You need report/block (✅ built) and a way for Apple to see it working with the demo account. |
| 3.1.1 (IAP) | "Jodi Gold" is currently a non-functional placeholder — if you want to sell it for real, it **must** go through Apple's in-app purchase, not Stripe or another processor. |
| 5.1.1 (privacy) | Privacy policy (✅ written, needs your contact details + a lawyer's review), accurate data-use labels in App Store Connect, and in-app account deletion (✅ built — Me → delete my account, on both web and mobile). |
| 2.1 (completeness) | Ship the review team a demo account with real content already in it, not an empty new signup. |

## What's genuinely done vs. what needs you

**Done and working (same backend, same guarantees as the web client):** auth, matching with compatibility scoring, realtime chat with typing indicators, photo upload, in-app voice recording, report/block enforced server-side, in-app account deletion, a deployable backend (Docker + Fly.io config, verified locally), and a drafted privacy policy.

**Needs you, specifically:** actually running the deploy (your Fly/hosting account), the Apple Developer enrollment, the actual `eas build`/`eas submit` run (needs your Apple credentials), on-device verification (I couldn't run this on a simulator or phone — no Mac available here), filling in your contact/legal details on the privacy policy and getting it reviewed by a lawyer, and the store listing content (screenshots, description, keywords).
