# VELAUR LABS — approved scope & implementation audit

Legend: `[x]` implemented in source (not production-tested); `[ ]` not completed or unverified.

## Locked visual requirements
- [ ] Official supplied logo integrated in header/footer/favicon (pending proper logo asset treatment)
- [ ] Balanced premium futuristic visual design: 3D hero + actual product screenshots
- [ ] Dark and light modes fully tested
- [ ] Responsive at 320, 375, 390, 768, 1024, 1440px; no overflow, working menus/forms

## Dedicated public pages
- [x] `/` home (source route exists; design/content still needs overhaul)
- [x] `/about` separate about page
- [x] `/services` overview + individual 8 service pages (`/services/[slug]`)
- [x] `/work` portfolio hub, `/work/websites`, `/work/web-applications`, `/work/mobile-apps`
- [x] `/work/projects/[slug]` published real-project detail page, simple or case-study mode
- [x] `/blog` published articles list and `/blog/[slug]` published article detail page
- [x] `/contact`, privacy, terms
- [ ] Verify navigation, data rendering and SEO on deployed site
- [ ] Service-page unique thorough content + visual layouts + SEO/FAQs
- [ ] Admin-managed services content replaces hardcoded service data
- [ ] Verified project links and actual portfolio items entered by administrator

## Admin — backend and UI
- [x] Authentication and inquiry API foundations exist in source
- [ ] Replace static admin dashboards and preview modules with actual data and action endpoints
- [ ] CMS CRUD: pages, sections, services, projects, blog, media
- [ ] Responsive drag/reorder block-based page builder, preview, drafts & publishing
- [ ] Custom roles/action permissions enforced server-side
- [ ] Approval workflow + version history and restore
- [ ] Inquiry owner/status updates, notifications and visitor emails
- [ ] SEO/branding/global settings persisted in database
- [ ] Security 2FA full flow, audit logs, backup/restore tested

## Quality and deployment
- [ ] Production Next build verified
- [ ] Desktop/tablet/mobile interactive QA
- [ ] Netlify deployed + Neon connected + routes checked
- [ ] End-to-end test new project/post -> publish -> appears in correct public page

## Current pass changes
- Separate project detail and blog article routes read only `PUBLISHED` database rows.
- All three portfolio category pages read real projects from Neon with correct category filtering.
- Blog index reads real published posts; no fake demo posts.
- Responsive CSS for category/article cards. Public database routes are dynamic.
- No claim that admin CRUD, final design, full build, or live deployment is complete.
