# Bespoke page-wide design settings

Admin Global Settings now controls internal-page heading size, paragraph size, vertical section spacing and card corner radius using server-validated numeric bounds. Shared styles apply to existing About, Services, Work, Blog and Contact components without replacing their bespoke layout. The settings use `global_settings` JSONB; no migration needed.

Limitations: full Elementor-style per-element design editing is not implemented; production build / live Neon and browser QA remain unverified.
