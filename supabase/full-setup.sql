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
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Public read visible sections" ON public.sections;
CREATE POLICY "Public read visible sections" ON public.sections FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible folders" ON public.folders;
CREATE POLICY "Public read visible folders" ON public.folders FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible media_items" ON public.media_items;
CREATE POLICY "Public read visible media_items" ON public.media_items FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible process_steps" ON public.process_steps;
CREATE POLICY "Public read visible process_steps" ON public.process_steps FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible testimonials" ON public.testimonials;
CREATE POLICY "Public read visible testimonials" ON public.testimonials FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible services" ON public.services;
CREATE POLICY "Public read visible services" ON public.services FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible equipment" ON public.equipment;
CREATE POLICY "Public read visible equipment" ON public.equipment FOR SELECT TO anon USING (is_visible = true);
DROP POLICY IF EXISTS "Public read visible client_logos" ON public.client_logos;
CREATE POLICY "Public read visible client_logos" ON public.client_logos FOR SELECT TO anon USING (is_visible = true);

-- Public Insert Policy ONLY for contact_leads (visitors cannot read other leads)
DROP POLICY IF EXISTS "Public submit booking lead" ON public.contact_leads;
CREATE POLICY "Public submit booking lead" ON public.contact_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Full Admin Access for Authenticated User (Mohamed)
DROP POLICY IF EXISTS "Admin full site_settings" ON public.site_settings;
CREATE POLICY "Admin full site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full sections" ON public.sections;
CREATE POLICY "Admin full sections" ON public.sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full folders" ON public.folders;
CREATE POLICY "Admin full folders" ON public.folders FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full media_items" ON public.media_items;
CREATE POLICY "Admin full media_items" ON public.media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full process_steps" ON public.process_steps;
CREATE POLICY "Admin full process_steps" ON public.process_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full testimonials" ON public.testimonials;
CREATE POLICY "Admin full testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full services" ON public.services;
CREATE POLICY "Admin full services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full equipment" ON public.equipment;
CREATE POLICY "Admin full equipment" ON public.equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full client_logos" ON public.client_logos;
CREATE POLICY "Admin full client_logos" ON public.client_logos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full contact_leads" ON public.contact_leads;
CREATE POLICY "Admin full contact_leads" ON public.contact_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- Storage Bucket for Portfolio Images (Hero Portrait, Thumbnails, Logos, CV)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public view portfolio media" ON storage.objects;
CREATE POLICY "Public view portfolio media" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin upload portfolio media" ON storage.objects;
CREATE POLICY "Admin upload portfolio media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin update portfolio media" ON storage.objects;
CREATE POLICY "Admin update portfolio media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin delete portfolio media" ON storage.objects;
CREATE POLICY "Admin delete portfolio media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-media');


-- SEED DATA

-- Auto-generated seed data for Mohamed Gamal Portfolio v2
-- Run after supabase/schema.sql in Supabase SQL Editor

INSERT INTO public.site_settings (id, brand_name_ar, brand_name_en, logo_text, logo_url, hero_eyebrow, hero_title_ar, hero_title_en, hero_role_ar, hero_role_en, hero_desc_ar, hero_desc_en, hero_bg_image_url, showreel_youtube_id, hww_eyebrow, hww_title_ar, hww_title_en, hww_desc_ar, hww_desc_en, cta_eyebrow, cta_title_ar, cta_title_en, whatsapp_number, whatsapp_url, instagram_url, facebook_url, cv_url, seo_description_ar, seo_description_en, section_visibility) VALUES ('main', 'محمد جمال', 'Mohamed Gamal', 'MG', NULL, 'COMMERCIAL FILMMAKER · REEL CREATOR', 'محمد جمال', 'Mohamed Gamal', 'صانع إعلانات & مصور ومونتير', 'FILMMAKER & Reel Creator', 'تصوير · مونتاج · إخراج · صناعة فيديوهات تجارية ومحتوى قصير بهوية بصرية واضحة.', 'Shooting · Editing · Directing — commercial videos and short-form content with a clear visual identity.', '/images/hero-portrait.webp', 'u46_YdxD7vY', 'HOW WE WORK', 'مش مجرد تصوير.', 'Not just filming.', 'إحنا مش مجرد بننفذ فيديو؛ إحنا شريك نجاح معاك. هدفنا نطلع بأفضل نتيجة لمحتواك، لأن نجاحك في المحتوى هو جزء من نجاحنا.', 'We don’t just produce a video — we’re your success partner. Our goal is the best possible result for your content, because your content’s success is part of ours.', 'LET''S CREATE', 'احكيلي فكرتك ونشوف إزاي نحولها لمحتوى قوي.', 'Tell me your idea and let''s turn it into strong content.', '201007176105', 'https://wa.me/201007176105', 'https://www.instagram.com/mohamed_gamal_pro/', 'https://www.facebook.com/MohamedGamalProo', '', 'محمد جمال — مخرج ومصور ومونتير لصناعة الريلز والإعلانات التجارية، تصوير البودكاست، والمحتوى الطبي للعيادات والبراندات في مصر. شاهد الأعمال واحجز مشروعك.', 'Mohamed Gamal — Commercial Filmmaker, Video Editor & Reel Creator crafting high-impact Reels, ads, podcasts, and medical content for clinics and brands.', '{"explore_work":true,"featured_work":true,"results_showcase":true,"how_we_work":true,"testimonials":true,"services":false,"equipment":false,"client_logos":false,"booking_form":true}'::jsonb) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('medical', 'محتوى طبي', 'Medical Content', 'Aesthetic Medicine · Dentistry · Gynecology', 'Aesthetic Medicine · Dentistry · Gynecology', 'محتوى طبي وتجميل مبني على فكرة واضحة وتصوير احترافي ومونتاج يحافظ على هوية الطبيب أو العيادة.', 'Medical and aesthetic content built on a clear idea, professional filming and editing that preserves the doctor or clinic’s identity.', 'stethoscope', 'violet', 1, true, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('podcast', 'بودكاست', 'Podcast', 'د. مصطفى نوارج · د. أحمد عثمان', 'Dr. Mostafa Nowarg · Dr. Ahmed Othman', 'تصوير متعدد الكاميرات، إخراج، مونتاج ومقاطع قصيرة قابلة للنشر على المنصات.', 'Multi-camera filming, directing, editing and short clips ready to publish across platforms.', 'mic', 'teal', 2, true, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('results', 'نتائج حققناها مع شركاء', 'Results With Partners', 'أرقام ونتائج حقيقية مع الشركاء', 'Real numbers & case studies with partners', 'أرقام ونتائج حقيقية مع شركائنا في التسويق، وتحتها شغلنا معاهم.', 'Real numbers and results with our marketing partners, along with our work together.', 'trending-up', 'amber', 3, true, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('social', 'Social Media', 'Social Media', 'أبرز الـReels', 'Our top Reels', 'مختارات من أقوى الـReels اللي اتعمل عليها شغل حقيقي.', 'A selection of the strongest Reels with real work behind them.', 'clapperboard', 'teal', 4, true, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('other', 'أعمال أخرى', 'Other Work', 'صناع محتوى · موشن جرافيك · عقارات', 'Creators · Motion Graphics · Real Estate', 'مشاريع متنوعة برا التصنيفات الأساسية.', 'A variety of projects outside the main categories.', 'layers', 'violet', 5, true, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES ('bts', 'Behind The Scenes', 'Behind The Scenes', 'كواليس التصوير والشغل من جوه', 'Behind-the-scenes footage of the work', 'لقطات من كواليس التصوير — دليل حي إني أنا اللي بصور وبنفذ الشغل من الألف للياء.', 'Footage from behind the scenes — live proof that I’m the one filming and executing the work from A to Z.', 'video', 'amber', 6, true, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('aesthetic', 'medical', 'Aesthetic Medicine', 'Aesthetic Medicine', 'الطب التجميلي', 'Aesthetic Medicine', 'sparkles', NULL, NULL, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('dentistry', 'medical', 'Dentistry', 'Dentistry', 'طب الأسنان', 'Dentistry', 'smile', NULL, NULL, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('gynecology', 'medical', 'Gynecology', 'Gynecology', 'النساء والتوليد', 'Gynecology', 'heart-pulse', NULL, NULL, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('nowarg', 'podcast', 'د. مصطفى نوارج', 'Dr. Mostafa Nowarg', 'الحلقة الكاملة + Behind The Scenes', 'Full episode + Behind The Scenes', 'user-check', NULL, NULL, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('othman', 'podcast', 'د. أحمد عثمان', 'Dr. Ahmed Othman', 'الحلقة الكاملة + صورة من الإيديتنج', 'Full Episode + Editing Screenshot', 'user-check', NULL, NULL, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('marketing-partners', 'results', 'أعمالي مع شركات التسويق', 'My Work With Marketing Companies', 'الحملات والنتائج', 'Campaigns & results', 'handshake', NULL, NULL, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('creators', 'other', 'صناع محتوى', 'Content Creators', 'Content Creators', 'Content Creators', 'users', NULL, NULL, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('motion', 'other', 'موشن جرافيك', 'Motion Graphics', 'Motion Graphics', 'Motion Graphics', 'shapes', NULL, NULL, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('cosmetics', 'other', 'Cosmetics', 'Cosmetics', 'مستحضرات التجميل', 'Cosmetics', 'droplets', NULL, NULL, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES ('realestate', 'other', 'محتوى عقاري', 'Real Estate Content', 'Real Estate', 'Real Estate', 'building-2', NULL, NULL, 4, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-aes-1', 'medical', 'aesthetic', 'youtube', '9:16', '2FUV7bnyflI', NULL, NULL, 'الطب التجميلي — ريل 1', 'Aesthetic Medicine — Reel 1', NULL, NULL, 'تصوير · مونتاج · تلوين', 'Filming · Editing · Color', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-aes-2', 'medical', 'aesthetic', 'youtube', '9:16', 'k_agatckLP4', NULL, NULL, 'الطب التجميلي — ريل 2', 'Aesthetic Medicine — Reel 2', NULL, NULL, 'تصوير · مونتاج', 'Filming · Editing', false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-aes-3', 'medical', 'aesthetic', 'youtube', '9:16', 'JGZr55V3mFI', NULL, NULL, 'الطب التجميلي — ريل 3', 'Aesthetic Medicine — Reel 3', NULL, NULL, 'تصوير · مونتاج', 'Filming · Editing', false, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-aes-4', 'medical', 'aesthetic', 'youtube', '9:16', 'i_PsmfIfnVo', NULL, NULL, 'الطب التجميلي — ريل 4', 'Aesthetic Medicine — Reel 4', NULL, NULL, 'تصوير · مونتاج', 'Filming · Editing', false, 4, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-den-1', 'medical', 'dentistry', 'youtube', '9:16', 'DlIeb3T9YoQ', NULL, NULL, 'طب الأسنان — ريل تعريفي', 'Dentistry — Dental Reel', NULL, NULL, 'تصوير · مونتاج · إخراج', 'Filming · Editing · Directing', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('med-gyn-1', 'medical', 'gynecology', 'youtube', '9:16', 'mU4I9clPkZ8', NULL, NULL, 'النساء والتوليد — ريل توعوي', 'Gynecology — Medical Reel', NULL, NULL, 'تصوير · مونتاج', 'Filming · Editing', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('pod-nowarg-1', 'podcast', 'nowarg', 'youtube', '16:9', '2I2IFFyOCL4', NULL, NULL, 'بودكاست د. مصطفى نوارج — الحلقة الكاملة', 'Dr. Mostafa Nowarg Podcast — Full Episode', 'الحلقة الكاملة', 'Full Episode', 'إخراج · تصوير متعدد الكاميرات · مونتاج', 'Directing · Multi-Cam · Editing', true, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('pod-nowarg-bts', 'podcast', 'nowarg', 'youtube', '9:16', 'LG7ZRvNpjQA', NULL, NULL, 'كواليس تصوير حلقة د. مصطفى نوارج', 'Dr. Mostafa Nowarg — Behind The Scenes', 'Behind The Scenes (دليل التنفيذ)', 'Behind The Scenes (Proof of Work)', 'كواليس · دليل التنفيذ', 'BTS · Proof of Work', false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('pod-othman-1', 'podcast', 'othman', 'youtube', '16:9', 'CKCl9S8oK30', NULL, NULL, 'بودكاست د. أحمد عثمان — الحلقة الكاملة', 'Dr. Ahmed Othman Podcast — Full Episode', 'الحلقة الكاملة', 'Full Episode', 'مونتاج · تلوين · هندسة صوت', 'Editing · Color · Sound', true, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('pod-othman-timeline', 'podcast', 'othman', 'placeholder', '16:10', NULL, NULL, NULL, 'صورة سكرين من التايم لاين (يمكنك رفعها من لوحة التحكم)', 'Timeline editing screenshot (upload from Admin Dashboard)', 'صورة من الإيديتنج', 'Editing Screenshot', NULL, NULL, false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('res-img-fb', 'results', NULL, 'image', '16:10', NULL, '/images/results/facebook-views.webp', NULL, 'مشاهدات صفحة فيسبوك', 'Facebook Page Views', 'نتائج موثقة', 'Verified Analytics', 'نمو عضوي وحملات', 'Organic & Paid Reach', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('res-img-ig', 'results', NULL, 'image', '16:10', NULL, '/images/results/instagram-views.webp', NULL, 'مشاهدات صفحة انستجرام', 'Instagram Page Views', 'نتائج موثقة', 'Verified Analytics', 'ريلز عالية الانتشار', 'High-Retention Reels', false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('res-mp-1', 'results', 'marketing-partners', 'youtube', '9:16', 'qjIYt_x-cwo', NULL, NULL, 'حملة شركاء التسويق — فيديو 1', 'Marketing Partners Campaign — Video 1', NULL, NULL, 'حملة تسويقية', 'Campaign Reel', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('res-mp-2', 'results', 'marketing-partners', 'youtube', '9:16', 'e1BrCgobIHI', NULL, NULL, 'حملة شركاء التسويق — فيديو 2', 'Marketing Partners Campaign — Video 2', NULL, NULL, 'حملة تسويقية', 'Campaign Reel', false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('res-mp-3', 'results', 'marketing-partners', 'youtube', '9:16', 'jMeXBZccBAw', NULL, NULL, 'حملة شركاء التسويق — فيديو 3', 'Marketing Partners Campaign — Video 3', NULL, NULL, 'حملة تسويقية', 'Campaign Reel', false, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('soc-1', 'social', NULL, 'youtube', '9:16', 'jGffxIM0sqQ', NULL, NULL, 'ذكاء اصطناعي', 'AI', NULL, NULL, 'Hook · AI Flow · كابشنز', 'Hook · AI Flow · Captions', true, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('soc-2', 'social', NULL, 'youtube', '9:16', 'ALeZ6ari7j8', NULL, NULL, 'المكسب الحقيقي من البودكاست', 'The Real Benefit of Podcasting', NULL, NULL, 'إخراج · مونتاج سريع', 'Directing · Fast Pacing', true, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('soc-3', 'social', NULL, 'youtube', '9:16', 'Ro7yjcvEuyw', NULL, NULL, 'ريلز ولا بودكاست', 'Reels or Podcast?', NULL, NULL, 'ستوري تيلنج · مونتاج', 'Storytelling · Editing', true, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('soc-4', 'social', NULL, 'youtube', '9:16', 'UzSTdVEtnmE', NULL, NULL, 'البودكاست مش تريند', 'Podcasting Isn''t a Trend', NULL, NULL, 'تصوير · مونتاج · ساوند ديزاين', 'Filming · Editing · Sound', false, 4, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('soc-5', 'social', NULL, 'youtube', '9:16', 'bcgsxxfjW4o', NULL, NULL, 'تصوير منتجات + ذكاء اصطناعي', 'Product Photography + AI', NULL, NULL, 'إنتاج تجاري · AI', 'Commercial · AI', true, 5, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cre-1', 'other', 'creators', 'youtube', '9:16', 'aj9jNpyo_-g', NULL, NULL, 'صناع محتوى — عمل 1', 'Content Creators — Work 1', NULL, NULL, NULL, NULL, false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cre-2', 'other', 'creators', 'youtube', '9:16', 'aSlJ1FaB-ns', NULL, NULL, 'صناع محتوى — عمل 2', 'Content Creators — Work 2', NULL, NULL, NULL, NULL, false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cre-3', 'other', 'creators', 'youtube', '9:16', 'Kt4VSj7Nsf4', NULL, NULL, 'صناع محتوى — عمل 3', 'Content Creators — Work 3', NULL, NULL, NULL, NULL, false, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-mot-1', 'other', 'motion', 'youtube', '9:16', 'N0jIAPfcXNQ', NULL, NULL, 'موشن جرافيك — عمل 1', 'Motion Graphics — Work 1', NULL, NULL, NULL, NULL, false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-mot-2', 'other', 'motion', 'youtube', '9:16', 'GJ3kTCvGvzY', NULL, NULL, 'موشن جرافيك — عمل 2', 'Motion Graphics — Work 2', NULL, NULL, NULL, NULL, false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-mot-3', 'other', 'motion', 'youtube', '9:16', '7o105FfAing', NULL, NULL, 'موشن جرافيك — عمل 3', 'Motion Graphics — Work 3', NULL, NULL, NULL, NULL, false, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-mot-4', 'other', 'motion', 'youtube', '9:16', 'VROqPMpieag', NULL, NULL, 'موشن جرافيك — عمل 4', 'Motion Graphics — Work 4', NULL, NULL, NULL, NULL, false, 4, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cos-1', 'other', 'cosmetics', 'youtube', '9:16', 'nHOe1RCA9Qs', NULL, NULL, 'مستحضرات التجميل — إعلان 1', 'Cosmetics — Ad 1', NULL, NULL, NULL, NULL, false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cos-2', 'other', 'cosmetics', 'youtube', '9:16', 'n0icX-1WDEA', NULL, NULL, 'مستحضرات التجميل — إعلان 2', 'Cosmetics — Ad 2', NULL, NULL, NULL, NULL, false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-cos-3', 'other', 'cosmetics', 'youtube', '9:16', '8D0Jj2N1eTE', NULL, NULL, 'مستحضرات التجميل — إعلان 3', 'Cosmetics — Ad 3', NULL, NULL, NULL, NULL, false, 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-re-1', 'other', 'realestate', 'youtube', '9:16', 'iaRHX-WznVA', NULL, NULL, 'محتوى عقاري — جولة 1', 'Real Estate — Tour 1', NULL, NULL, NULL, NULL, false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('oth-re-2', 'other', 'realestate', 'youtube', '9:16', 'Xm-3-VNNYLU', NULL, NULL, 'محتوى عقاري — جولة 2', 'Real Estate — Tour 2', NULL, NULL, NULL, NULL, false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('bts-1', 'bts', NULL, 'youtube', '9:16', 'dRKqQpl_Tqo', NULL, NULL, 'كواليس 1', 'Behind The Scenes 1', NULL, NULL, 'في الموقع · إضاءة وكاميرا', 'On Set · Lighting & Camera', false, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('bts-2', 'bts', NULL, 'youtube', '9:16', 'qiVcNnk7Qos', NULL, NULL, 'كواليس 2', 'Behind The Scenes 2', NULL, NULL, 'تصوير ميداني', 'Field Production', false, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES ('bts-3', 'bts', NULL, 'youtube', '9:16', 'UKJ2mZAO5BY', NULL, NULL, 'كواليس 3', 'Behind The Scenes 3', NULL, NULL, 'إخراج وتصوير', 'Directing & Filming', false, 3, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.process_steps (id, step_number, title_ar, title_en, desc_ar, desc_en, sort_order, is_visible) VALUES ('step-1', '01', 'الفكرة والسكريبت', 'Concept & Script', 'Hook واضح وDirection يخلي المشاهد عنده سبب يكمل.', 'A clear hook and direction that gives the viewer a reason to keep watching.', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.process_steps (id, step_number, title_ar, title_en, desc_ar, desc_en, sort_order, is_visible) VALUES ('step-2', '02', 'التصوير', 'Filming', 'إضاءة وتكوين وحركة كاميرا مناسبة للهوية والمنصة.', 'Lighting, composition and camera movement suited to the identity and platform.', 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.process_steps (id, step_number, title_ar, title_en, desc_ar, desc_en, sort_order, is_visible) VALUES ('step-3', '03', 'المونتاج والتلوين', 'Editing & Color', 'إيقاع بصري وColor Grading وSound Design متماسك.', 'Visual pacing, color grading and cohesive sound design.', 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.process_steps (id, step_number, title_ar, title_en, desc_ar, desc_en, sort_order, is_visible) VALUES ('step-4', '04', 'النتيجة', 'The Result', 'المحتوى النهائي هدفه يخدم البراند وليس مجرد لقطة جميلة.', 'The final content is meant to serve the brand, not just look pretty.', 4, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.testimonials (id, client_name_ar, client_name_en, client_role_ar, client_role_en, quote_ar, quote_en, source_label, sort_order, is_visible) VALUES ('test-1', 'د. مصطفى نوارج', 'Dr. Mostafa Nowarg', 'بودكاست ومحتوى طبي', 'Podcast & Medical Content', '“بجد التصوير والمونتاج تحفة بصرية تسلم إيديكم.”', '“Honestly, the filming and editing are a visual masterpiece — hats off to you.”', 'WhatsApp', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.testimonials (id, client_name_ar, client_name_en, client_role_ar, client_role_en, quote_ar, quote_en, source_label, sort_order, is_visible) VALUES ('test-2', 'مالك شركة منطلق (م. محمد صالح)', 'Owner of Muntalaq Company (Eng. Mohamed Saleh)', 'شريك نجاح', 'Success Partner', '“انت شغلك عالي ماشاء الله يا محمد، وحقيقي مبسوط إننا اشتغلنا مع بعض.”', '“Your work is top-notch, Mohamed, mashallah — and I’m genuinely glad we got to work together.”', 'WhatsApp', 2, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, title_ar, title_en, desc_ar, desc_en, features_ar, features_en, badge_ar, badge_en, sort_order, is_visible) VALUES ('srv-reels', 'باقة صناعة الـ Reels', 'Short-Form Reels Production', 'تخطيط الأفكار والـ Hooks، تصوير احترافي، مونتاج إيقاعي، وتلوين سينمائي جاهز للنشر.', 'Concept & hook scripting, cinematic filming, rhythmic editing, and color grading ready to publish.', '["كتابة أفكار وHooks جذابة","تصوير 4K وإضاءة احترافية","مونتاج + Sound Design + Captions"]'::jsonb, '["Scroll-stopping hooks & scripts","4K filming & pro lighting","Editing, Sound Design & Captions"]'::jsonb, 'الأكثر طلباً', 'Most Popular', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, title_ar, title_en, desc_ar, desc_en, features_ar, features_en, badge_ar, badge_en, sort_order, is_visible) VALUES ('srv-podcast', 'إنتاج البودكاست الكامل', 'Full Podcast Production', 'تصوير متعدد الكاميرات، هندسة صوت، مونتاج الحلقة الكاملة، واستخراج مقاطع قصيرة للسوشيال ميديا.', 'Multi-camera setup, audio mastering, full episode edit, plus viral short clips for social media.', '["تصوير Multi-Cam سينمائي","تسليم الحلقة الكاملة 16:9","تقطيع Reels قصيرة 9:16"]'::jsonb, '["Multi-cam studio lighting","Full 16:9 episode master","Vertical 9:16 social cutdowns"]'::jsonb, 'للشركات وصناع المحتوى', 'For Brands & Creators', 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.services (id, title_ar, title_en, desc_ar, desc_en, features_ar, features_en, badge_ar, badge_en, sort_order, is_visible) VALUES ('srv-commercial', 'الإعلانات التجارية والميدانية', 'Commercials & Brand Films', 'إخراج وتنفيذ إعلانات العيادات والمنتجات والعقارات بهوية بصرية ترفع قيمة البراند.', 'Directing and producing clinic, product, and real estate commercials with elevated visual identity.', '["إدارة فنية وStoryboard","حركة كاميرا Gimbal & B-Roll","تلوين سينمائي متكامل"]'::jsonb, '["Art direction & storyboard","Gimbal & dynamic B-roll","Cinema color grading"]'::jsonb, 'إنتاج متكامل', 'Full Production', 3, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.equipment (id, category_ar, category_en, name, specs_ar, specs_en, icon_name, sort_order, is_visible) VALUES ('eq-cam', 'الكاميرا والعدسات', 'Camera & Optics', '4K Cinema Camera System', 'تصوير 10-bit Log مع عدسات Prime واسعة وبورتريه لعزل سينمائي.', '10-bit Log capture paired with fast prime lenses for crisp cinematic depth.', 'camera', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipment (id, category_ar, category_en, name, specs_ar, specs_en, icon_name, sort_order, is_visible) VALUES ('eq-rig', 'الحركة والإضاءة', 'Stabilization & Lighting', 'Gimbal + Bi-Color Studio Lights', 'حركة كاميرا ناعمة وإضاءة Key / Rim احترافية تناسب العيادات والبودكاست.', 'Motorized gimbal stabilization and soft key/rim studio lighting.', 'aperture', 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.equipment (id, category_ar, category_en, name, specs_ar, specs_en, icon_name, sort_order, is_visible) VALUES ('eq-post', 'المونتاج والتلوين', 'Post-Production Suite', 'Premiere Pro · After Effects · DaVinci Resolve', 'مسار عمل متكامل للمونتاج، الموشن جرافيك، التلوين، وهندسة الصوت.', 'End-to-end editing, motion graphics, DaVinci color grading, and sound design.', 'monitor-play', 3, true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.client_logos (id, name_ar, name_en, logo_url, website_url, sort_order, is_visible) VALUES ('logo-muntalaq', 'منطلق ميديا', 'Muntalaq Media', NULL, NULL, 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.client_logos (id, name_ar, name_en, logo_url, website_url, sort_order, is_visible) VALUES ('logo-nowarg', 'د. مصطفى نوارج', 'Dr. Mostafa Nowarg', NULL, NULL, 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.client_logos (id, name_ar, name_en, logo_url, website_url, sort_order, is_visible) VALUES ('logo-othman', 'د. أحمد عثمان', 'Dr. Ahmed Othman', NULL, NULL, 3, true) ON CONFLICT (id) DO NOTHING;