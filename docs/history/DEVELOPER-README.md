# Running the VELAUR LABS app

1. Install Node 20+ and run `npm install` in the project directory.
2. Configure `.env.local` using `.env.example`. Never expose secrets in browser/public code.
3. Run the SQL in `db/schema.sql` against Neon staging. Do not run destructive migrations on production without a verified backup.
4. Start with `npm run dev`; open `/` and `/admin/login`.
5. In the admin panel use **Global Settings** (`/admin/settings`), **Pages & Sections** (`/admin/pages`), and **Content CMS** (`/admin/content`).
6. Test `npm run typecheck`, `npm run lint`, `npm run build` before pushing to Netlify.

The app contains completed routes alongside unimplemented/incompletely tested admin modules. Read `PASS-6-CHANGELOG.md` before release.
