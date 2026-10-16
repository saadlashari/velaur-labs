-- VELAUR LABS initial PostgreSQL schema. Run against the Neon database before enabling the API.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'SUB_ADMIN')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret_encrypted TEXT,
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_sessions_user_id_idx ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service TEXT NOT NULL,
  budget TEXT,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','IN_PROGRESS','REPLIED','CONVERTED','CLOSED')),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  follow_up_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'website_contact_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS inquiries_status_created_idx ON inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_assigned_to_idx ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS inquiries_email_idx ON inquiries(email);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actor_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, revision_number)
);

CREATE TABLE IF NOT EXISTS backup_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('STARTED','SUCCEEDED','FAILED')),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('SCHEDULED_DAILY','PRE_CHANGE','MANUAL')),
  provider_reference TEXT,
  message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Content-management tables (created idempotently; safe to run after the initial schema above).
CREATE TABLE IF NOT EXISTS global_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  no_index BOOLEAN NOT NULL DEFAULT FALSE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_reusable BOOLEAN NOT NULL DEFAULT FALSE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_id, section_key)
);
CREATE INDEX IF NOT EXISTS page_sections_order_idx ON page_sections(page_id, position);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  position INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  meta_description TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS services_status_position_idx ON services(status, position);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('WEBSITE','WEB_APPLICATION','MOBILE_APP')),
  page_type TEXT NOT NULL DEFAULT 'SIMPLE' CHECK (page_type IN ('SIMPLE','CASE_STUDY')),
  summary TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  live_url TEXT,
  app_store_url TEXT,
  play_store_url TEXT,
  figma_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  seo_title TEXT,
  meta_description TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_status_position_idx ON projects(status, position);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(is_featured, status, position);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  cover_media_id UUID,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','SCHEDULED','PUBLISHED','ARCHIVED')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  meta_description TEXT,
  social_image_url TEXT,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_provider TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  public_url TEXT,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
  alt_text TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_cover_media_id_fkey;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_cover_media_id_fkey FOREIGN KEY (cover_media_id) REFERENCES media_assets(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('QUEUED','SENT','FAILED')),
  provider_message_id TEXT,
  error_message TEXT,
  related_inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS email_logs_created_idx ON email_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301,302,307,308)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  submitted_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  submitted_revision INTEGER,
  reviewer_note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS content_approvals_status_idx ON content_approvals(status, submitted_at DESC);
