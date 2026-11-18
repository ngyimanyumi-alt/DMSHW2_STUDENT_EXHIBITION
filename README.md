# Delia Visual Arts · Lenormand Gallery

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## PostgreSQL and Render deployment

The API requires PostgreSQL and a private `DATABASE_URL` (`postgresql://` or
`postgres://`). Without a configured, reachable database and applied migrations,
guestbook and exhibition requests fail; there is no local-file fallback.

1. Create **Render PostgreSQL** in the same region as your Render **Web Service**
   (a Static Site alone cannot run this Express API).
2. In the Web Service's **Environment** settings, set `DATABASE_URL` to the
   database's **Internal Database URL**. Keep the full URL private: it contains
   credentials. Do not commit it, put it in a `VITE_` variable, or paste it into logs.
3. For a native Node service, use `corepack enable && pnpm install --frozen-lockfile && pnpm build`
   as the build command and `pnpm start` as the start command. The included
   Dockerfile is also supported.
4. Set the **Pre-Deploy Command** to `pnpm db:migrate` so the checked-in migrations
   run before the new version serves requests. If your Render plan does not
   support pre-deploy commands, run `pnpm db:migrate` once from a Render shell or
   one-off job with the same private environment before starting/redeploying.
   The Docker image includes the migration files and CLI.
5. Deploy and check that exhibition content loads and guestbook messages can be
   submitted and listed. Follow the curator setup below before using `/curator`.

Migrations now target a **fresh PostgreSQL database**, not an existing MySQL
database. The old MySQL migration history has been replaced; this is not an
in-place conversion or data transfer. Back up any existing MySQL data and plan
a separate import (including resetting PostgreSQL ID sequences after importing
explicit IDs). Do not reuse MySQL migration metadata.

`pnpm db:migrate` only applies pending checked-in migrations and is safe to rerun.
For future schema changes, run `pnpm exec drizzle-kit generate`, review and commit
the SQL and metadata, then apply migrations. `pnpm db:push` retains the existing
generate-and-migrate shortcut; do not use generation as a production deploy step.
Timestamp update triggers are in `drizzle/0001_updated_at.sql` and preserve
automatic `updatedAt` updates, including direct SQL updates. Timestamps use
PostgreSQL `timestamptz` and are returned as JavaScript `Date` values.

### Curator access and image uploads on Render

In the Render Web Service's **Environment** settings, add these private values:

- `CURATOR_PASSWORD`: a unique password with at least 16 characters, used to
  sign in at `/curator`.
- `CURATOR_SESSION_SECRET`: a separate random value with at least 32 characters.
  Generate it privately with `openssl rand -hex 32`. Do not reuse the password.

Save and redeploy after applying `pnpm db:migrate`. If your Render tier has no
Pre-Deploy Command, temporarily use `pnpm db:migrate && pnpm start` as the native
service's Start Command, then revert to `pnpm start` after the migration succeeds.
For Docker without a Pre-Deploy Command, the same command can be used as the
Docker Command override.

Curator sign-in, artwork uploads (including Google Drive imports), and guestbook
photos no longer require Manus settings. New images are stored in PostgreSQL and
served under `/api/media/`; include them in your database backups. Existing
`/manus-storage/` URLs are not copied by the migration. If an old artwork no longer
loads on Render, re-upload it or re-import its original Drive link in the studio.

### Database tests

Run server tests with `pnpm test --root . server`. PostgreSQL integration tests
are skipped unless `TEST_DATABASE_URL` points to a disposable PostgreSQL database.
For example, set it privately in your shell and run
`pnpm test --root . server/postgres.integration.test.ts`.
The test account needs permission to create/drop schemas; tests apply the actual
migrations twice in a uniquely named schema, exercise persistence, and remove
that schema afterward. Do not use your production database for tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The Manus platform serves legacy `/manus-storage/` assets when hosted there; Render does not proxy those assets.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
