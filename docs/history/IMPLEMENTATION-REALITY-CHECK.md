# VELAUR LABS — independent scope check

## Changes verified in this package
- Original multi-route Next.js application preserved.
- Navbar Services dropdown now reads its cards (label, icon, destination) from admin Global Settings. JSON field `services_menu`; eight items maximum; only local `/services/<slug>` links accepted.
- Footer Expertise links now read from admin Global Settings (`footer_services`) instead of hard-coded links.
- The settings API validates menu structures and persists data via the existing `global_settings` JSONB storage, without changing SQL tables.
- TypeScript/TSX syntax-only validation performed across 63 source files; no syntax diagnostics.

## Locked scope NOT achieved by this package
- Existing built-in page sections are not individually editable in the visual builder. Publishing custom `page_sections` can replace the built-in page layout, losing the premium bespoke components.
- Drag-and-drop canvas with robust desktop/mobile breakpoint styling, undo/redo, layout element selection, autosave, revision rollback is not complete.
- All 37 portfolio entries have NOT been verified and fully published with screenshots, consent and case studies.
- Full distinct eight service page content, accurate project-to-service mapping and SEO QA remain incomplete.
- Cross-browser/mobile visual QA, password/login/logout/2FA security testing, permission checks, email delivery, Cloudinary uploads, backup restore testing remain incomplete.
- `npm install` did not complete in this environment and complete Next.js production build was NOT verified.
- Netlify production deployment has NOT been performed.

## Release recommendation
**Do not replace your production website with this package as a claimed finished implementation.** It is a source update. Finish design/component registry and true public-preview/page editor integration, then test a clean production build and authenticated CMS operations on staging before launch.

## No SQL migration
The new menu settings use existing `global_settings` rows; no schema change for these particular updates.
