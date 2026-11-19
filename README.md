# Delia Visual Arts · Lenormand Gallery

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm check` / `pnpm test`: types and application tests.

## Google Drive and Sheets storage

Exhibition edits, settings and guestbook entries are stored in Google Sheets.
Artwork uploads and guestbook photos are stored in a Google Drive folder. The
image files are shared with **Anyone with the link** so the public exhibition
can display them. Do not upload private images.

The site calls a Google Apps Script web app that runs as the spreadsheet owner.
No `DATABASE_URL` is needed for gallery storage. The optional `DATABASE_URL`
setting is only used by the legacy Manus OAuth user flow.

### Configure Google storage

1. Create a Google spreadsheet for gallery data.
2. In that spreadsheet, choose **Extensions → Apps Script**. Replace the
   contents of `Code.gs` with `google-apps-script/Code.gs` from this repository
   and save.
3. Run `setupGalleryStorage` once from the Apps Script editor and approve the
   requested Google Sheets and Drive permissions. It creates the data tabs and
   a `Lenormand Gallery Images` folder in your Drive.
4. In Apps Script, open **Project Settings → Script properties** and add
   `API_SECRET` with a private random value of at least 32 characters.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to **Me**
   and **Who has access** to **Anyone**, then deploy and authorize it. Copy the
   Web app URL ending in `/exec`.
6. In the web host's private environment settings, add:
   - `GOOGLE_APPS_SCRIPT_URL`: the Web app URL.
   - `GOOGLE_APPS_SCRIPT_SECRET`: the exact same value as `API_SECRET`.
   - `CURATOR_PASSWORD`: a unique password with at least 16 characters.
   - `CURATOR_SESSION_SECRET`: a separate random value with at least 32
     characters.
7. Save the environment settings and redeploy. The curator studio is available
   at `/curator`.

To deploy the web app on Render, use **New → Blueprint** and select this
repository. Render detects `render.yaml`, creates a free Web Service, and asks
you to supply the four secret environment values above. A free service can sleep
when idle and may have monthly usage limits; check Render's current plan terms.

Keep the Apps Script secret and curator credentials private; do not commit them
to GitHub or include them in screenshots. If you change the Apps Script code,
create a new deployment version and update the web app deployment.

Google Drive and Apps Script have storage and usage quotas. This setup avoids a
paid PostgreSQL database, but it does not guarantee that the hosting service or
all Google usage will remain free. Check the current limits and pricing for the
Google account and hosting plan you choose. Back up the spreadsheet and Drive
folder separately.

### Local development

Set `GOOGLE_APPS_SCRIPT_URL` and `GOOGLE_APPS_SCRIPT_SECRET` in the server
environment to use the same Google storage. Without them, the app can start in
development, but gallery and guestbook persistence requests will fail explicitly.

### Database tests

Run server tests with `pnpm test --root . server`. PostgreSQL integration tests
are skipped unless `TEST_DATABASE_URL` points to a disposable PostgreSQL
database. Do not use a production database for tests.
