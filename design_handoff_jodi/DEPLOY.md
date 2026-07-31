# Deploying the jodi backend

The mobile app (and the web client, in production) needs `server/` reachable at a public **HTTPS** URL — not `localhost`. iOS blocks plain HTTP by default (App Transport Security), so this isn't optional.

This covers the primary path (Fly.io, chosen because SQLite needs a real persistent disk, which Fly's volumes give you for free at this scale) plus what changes if you'd rather use Render or Railway.

## Option A: Fly.io (recommended — has free persistent volumes)

Everything below runs from `server/`.

```sh
cd server
brew install flyctl        # or see https://fly.io/docs/flyctl/install/
fly auth login
```

**1. Claim the app.** `fly.toml` is already written, but the app name `jodi-server` is almost certainly taken — edit `app = "jodi-server"` in `fly.toml` to something unique first (e.g. `jodi-yourname`), then:

```sh
fly launch --no-deploy --copy-config
```

Say **no** if it offers to overwrite `fly.toml` — the committed one already has the right build/env/volume config.

**2. Create the persistent volume** (holds the SQLite file + uploaded photos/voice clips — without this, every redeploy wipes your data):

```sh
fly volumes create jodi_data --region iad --size 1
```

Use the same region as `primary_region` in `fly.toml`. 1GB comfortably covers thousands of users' photos at launch scale; resize later if needed.

**3. Set secrets** (never commit these — `fly.toml`'s `[env]` block only holds non-sensitive config):

```sh
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
```

**4. Deploy:**

```sh
fly deploy
```

**5. Verify:**

```sh
curl https://<your-app-name>.fly.dev/api/health
# {"ok":true}
```

That URL — `https://<your-app-name>.fly.dev` — is what goes into the mobile app's production build (see `mobile/eas.json`'s `production.env.EXPO_PUBLIC_API_URL`, and update `mobile/.env` for local testing against the real backend too).

**Redeploying later:** just `fly deploy` again from `server/` after pulling new code. `docker-entrypoint.sh` runs `prisma migrate deploy` on every boot, so schema changes roll out automatically; the volume means your data survives it.

**Seeding demo accounts on the deployed instance** (for the App Store reviewer — see `mobile/README.md`):

```sh
fly ssh console -C "npm run seed"
```

## Option B: Render / Railway

Both work, with one caveat: **their free tiers don't include a persistent disk**, so a fresh SQLite file gets created on every deploy/restart and all data (including uploaded photos) is lost. Fine for a quick demo, not fine for anything real. If you go this route, either pay for a persistent disk add-on, or switch `server/prisma/schema.prisma`'s datasource to Postgres (both platforms offer a free managed Postgres instance) — that's a `provider = "postgresql"` change plus a fresh `prisma migrate dev` to generate Postgres-flavored migrations; ask if you want this done.

Both platforms build directly from `server/Dockerfile` if you point them at this repo with `server/` as the root/context directory. Set the same environment variables as above (`DATABASE_URL`, `JWT_SECRET`, `UPLOAD_ROOT`, `PORT`) in their dashboard.

## What's already wired up for this

- `server/Dockerfile` — multi-stage build (installs deps, runs `prisma generate` + `tsc`, ships a slim runtime image)
- `server/docker-entrypoint.sh` — runs `prisma migrate deploy` before starting the server, so the schema is always current on boot
- `server/src/upload.ts` — reads `UPLOAD_ROOT` from the environment (defaults to `./uploads` for local dev) and creates the `photos/`/`voice/` subdirectories on first boot, so a fresh mounted volume works with no manual setup
- Verified locally: ran the exact build → `prisma migrate deploy` → `node dist/index.js` sequence the container uses, against a fresh throwaway SQLite path with `DATABASE_URL`/`UPLOAD_ROOT` set the way `fly.toml` sets them — schema applied, server booted, `/api/health` responded, upload directories were created automatically. (Couldn't do a literal `docker build` here — no Docker daemon available in this sandbox — but every step the Dockerfile runs was exercised directly.)

## Not done here

- Actually running any of the above — needs your Fly/Render/Railway account
- A custom domain (Fly gives you `*.fly.dev` for free over HTTPS; add your own domain later via `fly certs add`)
- Postgres migration (only needed if you skip Fly's volume and want a database-backed alternative)
