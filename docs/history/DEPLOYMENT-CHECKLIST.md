# Netlify staging release checklist

This package is development work, not certified 100% production-ready.

1. Deploy to a staging Netlify site, not directly replacing a working production business website.
2. Use Node 20 or 22 LTS where available. Keep Next.js runtime enabled. `npm run build` is the build command; netlify.toml currently defines publish `.next`.
3. Configure `DATABASE_URL`, `AUTH_SECRET`, `BOOTSTRAP_SECRET`, `APP_URL` (real Netlify origin). Do not disclose these values in chat or commit them to Git.
4. Cloudinary media + profile avatar uploads need `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Email delivery requires the provider credentials outlined in `.env.example`.
5. Retain existing Neon schema; no new table required by this update. Existing global_settings JSONB keys store floating button and avatar settings.
6. Test site routes, Services hover menu, responsive mobile navigation, 3-card services preview, vertical process, four blog articles, four homepage portfolio highlights and all 8 service detail pages.
7. Log in to admin, test image upload, logout/session invalidation, pages/services/blog CRUD, approvals, and publishing visibility with Super Admin and Sub Admin roles.
8. Test contact form, confirm data saved and both emails delivered; verify all external project/app links and permissions before publishing them.
9. Test site and admin on widths 320, 375, 768, 1024, 1440; check dark/light theme and keyboard navigation.
10. Do not call release complete until build, live auth, database, media, email and browser QA pass.
