# VELAUR LABS — visual builder continuation

Added per-section card background/border/radius/gap/shadow, image radius/height/fit/position and desktop/tablet/mobile visibility options. These are supported by both the admin section editor and the public shared renderer. All colors are validated as six-digit hex and numeric design values are clamped in the public renderer. No schema migration is needed: section settings are JSONB.

## Remaining unverified and incomplete
This is **not** an Elementor-equivalent editor for all hard-coded bespoke pages, and does not finish redesign of all internal pages or the full 37-project asset inventory. This source was not deployed or exercised with Neon, Cloudinary, or real browsers; a complete Next.js build still requires the project dependencies.
