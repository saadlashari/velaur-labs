# VELAUR LABS — Netlify build fix (2026-10-13)

## Fixes made
- Replaced invalid spread of `eslint-config-next` exports with `FlatCompat` (Next.js 15 + ESLint 9 compatible).
- Added explicit `@eslint/eslintrc` dev dependency.
- Set `.next` as publish directory in `netlify.toml` instead of repository root.

## Required Netlify UI check
In Site configuration → Build & deploy → Build settings, remove any custom publish directory override that points to repository root or `/opt/build/repo`. Build command remains `npm run build`. Let `netlify.toml` supply `.next`.

## Note
This build has NOT been run locally with installed dependencies. The errors reported in the 5:38–5:39 PM deployment log are addressed in source/config, but a successful build and runtime test still need Netlify confirmation.
