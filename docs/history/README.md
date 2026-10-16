# VELAUR LABS — Website + Admin Console

A Next.js App Router + TypeScript project for the VELAUR LABS public website and its admin console. The public site and admin interface live in one application so they can share server-side APIs and a PostgreSQL database.

## Routes

- `/` — Homepage
- `/about` — About page
- `/services` — Services overview
- `/services/[slug]` — Individual service detail pages
- `/work` — Portfolio concept previews (clearly labelled as illustrative)
- `/blog` — Blog listing / honest empty state until real posts are published
- `/contact` — Contact and inquiry form
- `/privacy-policy` and `/terms-of-service` — Draft legal copy requiring business/legal review
- `/admin/login` — Admin sign-in and one-time Super Admin setup
- `/admin` — Admin dashboard

## Stack

- Next.js 15 + React 19 + TypeScript
- PostgreSQL using `pg` (Neon-compatible)
- Netlify Next.js adapter/plugin configuration (`netlify.toml`)
- Node.js runtime for database-backed API routes

## Database setup

1. Create a PostgreSQL database in Neon.
2. Open Neon SQL Editor and run the complete `db/schema.sql` file from this repository. It is designed to create the tables and indexes idempotently.
3. Configure the environment variables listed in `.env.example` locally or in the Netlify site environment settings.
4. Use the Neon connection string intended for server-side applications. Keep all secrets server-side; never prefix secret environment variables with `NEXT_PUBLIC_`.
5. For local development, copy `.env.example` to `.env.local` and set the values for your local environment.

## Local development

Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## First Super Admin setup

1. Confirm the SQL schema has been applied and the server can connect to Neon.
2. Configure the server-side bootstrap secret and application origin in the environment.
3. Open `/admin/login` and choose **Set up first Super Admin**.
4. Create the account and add the one-time authenticator secret to an authenticator app. Verify the current six-digit code to enable 2FA.
5. Sign in using the Super Admin credentials and authenticator code.
6. Remove the bootstrap secret from the deployed environment once the initial account has been created. The endpoint also refuses to create a second initial administrator.

## Implemented foundation

- Responsive public website and admin UI shell.
- Dark/light theme preference endpoint and browser-side theme switch.
- PostgreSQL connection pool and schema for admins, sessions, inquiries, audit logs, revisions, approvals, projects, services, pages, blog posts, media metadata, global settings, redirects, email logs and backup events.
- Initial Super Admin bootstrap, password hashing with scrypt, database-backed opaque sessions, HttpOnly cookies and authenticator-based TOTP.
- Public inquiry submission endpoint with server-side validation, consent requirement and honeypot field.
- Admin dashboard summary reads live counts and recent activity from the database.
- Inquiry management UI/API for listing, searching, status, priority, assignment, follow-up date and internal notes.
- Sub-admin creation and activation/deactivation, plus permission assignment at creation and server-side permission checks on the exposed user/inquiry endpoints.
- Basic security response headers and Netlify Next.js configuration.

## Important limitations before production

This is a deployment candidate, not a fully completed production CMS. Apply the schema and configure the environment before testing. A successful TypeScript syntax transpilation was performed, but `npm install` timed out in this environment, so the full typecheck, lint and production build could not be verified here.

The following remain to be implemented or independently verified before describing the platform as production-ready:

- Full CRUD/publishing UI and server APIs for pages/sections, services, projects, blog/media and global settings. The schema exists, but not all CMS modules are connected to it yet.
- A complete configurable full visual page builder, drag-and-drop layouts, responsive preview, media upload/storage and approval workflow.
- Email provider integration for admin notifications and visitor confirmation emails. Inquiries are stored, but the API currently does not send emails.
- Login throttling/rate limiting, password recovery, recovery codes, broader 2FA recovery, penetration/security review and end-to-end testing.
- Automated daily database backups, pre-change backups, external backup retention and a tested restore process. The schema stores backup event records; it does not itself create backup files.
- Automatic inquiry assignment rules, richer inquiry history, full audit-log viewer and content revision/rollback workflows.
- Analytics integration, redirect management UI and production-ready consent/privacy review.
- Verify Netlify plugin compatibility, database connectivity, first-admin setup, form submission and all API permissions after deployment.

Do not put real credentials into source control or send them in chat. Configure production secrets in Netlify's environment variable settings. Do not deploy the current package as a production-ready finished platform until the remaining items above are addressed and end-to-end tests pass.
