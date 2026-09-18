# Wedding Invitation

A digital wedding invitation for Elvin & Eric — December 28, 2026, Kisii, Kenya.
Built with [TanStack Start](https://tanstack.com/start) (React 19), Nitro, Drizzle
ORM on SQLite / Turso, and Tailwind CSS v4.

## Features

- **Public invitation page** (`/`): hero with photo, live countdown, ceremony &
  reception programme, and an RSVP form.
- **Admin panel** (`/admin`): password-protected dashboard with
  - RSVP responses table + stats (total, attending, guests expected),
  - site-details editor (names, dates, images, colors, programme schedule),
  - password management (changing it revokes all other sessions).

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build          # production build (Nitro / node server in .output)
npm run preview        # preview the production build
npm run check          # biome lint + format check
npm run db:generate    # generate migrations after schema changes
npm run db:push        # push schema to the database
npm run db:studio      # open drizzle studio
```

## Environment Variables

Create `.env.local` (or `.env`) with the variables you need:

| Variable | Required | Description |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | yes\* | Turso DB URL, e.g. `libsql://project-user.turso.io`. Defaults to `file:local.db` when unset. |
| `TURSO_AUTH_TOKEN` | for remote | Turso database auth token. Not needed for local `file:` DBs. |
| `ADMIN_PASSWORD` | fallback | Admin password used **only** until one is stored in the DB. Set a strong value. |
| `PUBLIC_SITE_URL` | for OG | Public origin (e.g. `https://invite.example.com`). Used to build absolute Open Graph image URLs. `VITE_PUBLIC_SITE_URL` is also accepted. |
| `STORAGE_S3_BUCKET` | for uploads | S3-compatible bucket name (Cloudflare R2, AWS S3, MinIO). When set, uploads go to object storage. |
| `STORAGE_S3_ENDPOINT` | for R2 | Endpoint URL, e.g. `https://<account>.r2.cloudflarestorage.com`. |
| `STORAGE_S3_REGION` | optional | Region (default `auto`, which suits R2). |
| `STORAGE_S3_ACCESS_KEY_ID` | for uploads | Object storage access key. |
| `STORAGE_S3_SECRET_ACCESS_KEY` | for uploads | Object storage secret key. |
| `STORAGE_S3_PUBLIC_URL` | for uploads | Public URL prefix for uploaded files, e.g. `https://media.example.com`. |

\* `TURSO_DATABASE_URL` is required for any remote deployment.

### Admin password

The admin password is resolved in this order:

1. `admin_password` value stored in the `settings` table (takes precedence), or
2. the `ADMIN_PASSWORD` environment variable.

On first successful login from the env fallback, the password is hashed
(scrypt + salt) and stored in the DB. Use the **Security** tab in the admin
panel to rotate the password, which revokes every other active session.

### Temporary password / forced change

When the `force_password_change` key in the `settings` table is `"1"`, a
successful login only unlocks a single **"Choose a new password"** screen.
Until the password is changed, the protected endpoints (`listRsvps`,
`updateSiteSettings`, `uploadImage`) refuse to run with
_"You must change your temporary password before continuing."_ Changing the
password clears the flag and revokes all other sessions.

> Change the default! The included `.env.local` in this repo is a starter value
> and is git-ignored.

## Image Uploads

Uploaded images go through the admin **Details** tab (drag & drop or picker,
with client-side cropping, max 5 MB).

- **Without `STORAGE_S3_*` vars** — files are written to `public/uploads/`
  locally. Works for local dev and Node hosts with persistent disks.
- **With `STORAGE_S3_*` vars** — files are uploaded to your S3-compatible
  bucket and the returned URL is stored in site settings. **Use this for
  serverless deploys** (Vercel, Netlify, Cloudflare) where the local disk is
  ephemeral or read-only.

## Deploying

```bash
npm run build
node dist/server/index.mjs   # or run via your host's Node entrypoint
```

For Vercel/Netlify/Cloudflare deploys set the env vars above (Turso + object
storage + `PUBLIC_SITE_URL`), since the runtime disk is not persistent.

## Security notes

- Passwords are hashed with `scrypt` (64-byte key, random salt).
- Logins are rate limited (5 attempts / 15 min) per client IP.
- State-changing server functions verify the `Origin` header to guard against
  CSRF; session cookies are `HttpOnly` with `SameSite=Lax`.