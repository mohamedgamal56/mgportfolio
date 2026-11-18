-- =============================================================================
-- Mohamed Gamal Portfolio v2 - Complete PostgreSQL Schema + RLS + Storage
-- Run this inside Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Site Settings (single row 'main')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_name_ar TEXT NOT NULL,
  brand_name_en TEXT NOT NULL,
  logo_text TEXT NOT NULL DEFAULT 'MG',
  logo_url TEXT,
  hero_eyebrow TEXT NOT NULL DEFAULT 'COMMERCIAL FILMMAKER · REEL CREATOR',
  hero_title_ar TEXT NOT NULL,
  hero_title_en TEXT NOT NULL,
  hero_role_ar TEXT NOT NULL,
  hero_role_en TEXT NOT NULL,
  hero_desc_ar TEXT NOT NULL,
  hero_desc_en TEXT NOT NULL,
  hero_bg_image_url TEXT NOT NULL,
  showreel_youtube_id TEXT,
  hww_eyebrow TEXT NOT NULL DEFAULT 'HOW WE WORK',
  hww_title_ar TEXT NOT NULL,
  hww_title_en TEXT NOT NULL,
  hww_desc_ar TEXT NOT NULL,
  hww_desc_en TEXT NOT NULL,
  cta_eyebrow TEXT NOT NULL DEFAULT 'LET''S CREATE',
  cta_title_ar TEXT NOT NULL,
  cta_title_en TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  whatsapp_url TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  facebook_url TEXT NOT NULL,
  cv_url TEXT NOT NULL DEFAULT '',
  seo_description_ar TEXT NOT NULL,
  seo_description_en TEXT NOT NULL,
  section_visibility JSONB NOT NULL DEFAULT '{
    "explore_work": true,
    "featured_work": true,
    "results_showcase": true,
    "how_we_work": true,
    "testimonials": true,
    "services": false,
    "equipment": false,
    "client_logos": false,
    "booking_form": true
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Main Work Sections
CREATE TABLE IF NOT EXISTS public.sections (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  short_ar TEXT NOT NULL,
  short_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'film',
  accent_color TEXT NOT NULL DEFAULT 'teal' CHECK (accent_color IN ('teal', 'violet', 'amber')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  show_in_nav BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Folders inside Sections
CREATE TABLE IF NOT EXISTS public.folders (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_ar TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'folder',
  note_ar TEXT,
  note_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Media Items (Videos, Images, Placeholders)
CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  folder_id TEXT REFERENCES public.folders(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'youtube' CHECK (media_type IN ('youtube', 'image', 'placeholder')),
  aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9', '16:10')),
  youtube_id TEXT,
  image_url TEXT,
  custom_thumb_url TEXT,
  title_ar TEXT,
  title_en TEXT,
  group_label_ar TEXT,
  group_label_en TEXT,
  role_tags_ar TEXT,
  role_tags_en TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. How We Work Steps
CREATE TABLE IF NOT EXISTS public.process_steps (
  id TEXT PRIMARY KEY,
  step_number TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

-- 6. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  client_name_ar TEXT NOT NULL,
  client_name_en TEXT NOT NULL,
  client_role_ar TEXT,
  client_role_en TEXT,
  quote_ar TEXT NOT NULL,
  quote_en TEXT NOT NULL,
  source_label TEXT NOT NULL DEFAULT 'WhatsApp',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

-- 7. Services & Packages (Optional Section, Hidden by Default)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  features_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge_ar TEXT,
  badge_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

-- 8. Equipment & Gear (Optional Section, Hidden by Default)
CREATE TABLE IF NOT EXISTS public.equipment (
  id TEXT PRIMARY KEY,
  category_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  name TEXT NOT NULL,
  specs_ar TEXT NOT NULL,
  specs_en TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'camera',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

-- 9. Client Logos (Optional Section, Hidden by Default)
CREATE TABLE IF NOT EXISTS public.client_logos (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

-- 10. Booking / Contact Leads
CREATE TABLE IF NOT EXISTS public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL,
  project_type TEXT NOT NULL,
  industry_field TEXT,
  budget_range TEXT,
  project_details TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast ordering
CREATE INDEX IF NOT EXISTS idx_sections_order ON public.sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_folders_section_order ON public.folders(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_media_section_folder_order ON public.media_items(section_id, folder_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.contact_leads(created_at DESC);

-- =============================================================================
-- Row Level Security (RLS)
-- IMPORTANT: Disable public Sign-Up in Supabase Dashboard -> Authentication -> Providers -> Email
-- so ONLY Mohamed (the single created admin user) can sign in as 'authenticated'.
-- =============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (only visible items for anon visitors)
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Public read visible sections" ON public.sections FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible folders" ON public.folders FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible media_items" ON public.media_items FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible process_steps" ON public.process_steps FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible testimonials" ON public.testimonials FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible services" ON public.services FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible equipment" ON public.equipment FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Public read visible client_logos" ON public.client_logos FOR SELECT TO anon USING (is_visible = true);

-- Public Insert Policy ONLY for contact_leads (visitors cannot read other leads)
CREATE POLICY "Public submit booking lead" ON public.contact_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Full Admin Access for Authenticated User (Mohamed)
CREATE POLICY "Admin full site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full sections" ON public.sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full folders" ON public.folders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full media_items" ON public.media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full process_steps" ON public.process_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full equipment" ON public.equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full client_logos" ON public.client_logos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full contact_leads" ON public.contact_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- Storage Bucket for Portfolio Images (Hero Portrait, Thumbnails, Logos, CV)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view portfolio media"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin upload portfolio media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin update portfolio media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin delete portfolio media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-media');
