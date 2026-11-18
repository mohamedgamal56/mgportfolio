import fs from 'node:fs';
import {
  SEED_CLIENT_LOGOS,
  SEED_EQUIPMENT,
  SEED_FOLDERS,
  SEED_MEDIA_ITEMS,
  SEED_PROCESS_STEPS,
  SEED_SECTIONS,
  SEED_SERVICES,
  SEED_SETTINGS,
  SEED_TESTIMONIALS,
} from '../src/data/seed-data.ts';

const esc = (v) =>
  v === null || v === undefined ? 'NULL' : "'" + String(v).replace(/'/g, "''") + "'";
const bool = (v) => (v ? 'true' : 'false');
const json = (v) => "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";

const lines = [
  '-- Auto-generated seed data for Mohamed Gamal Portfolio v2',
  '-- Run after supabase/schema.sql in Supabase SQL Editor',
  '',
];

const s = SEED_SETTINGS;
lines.push(
  `INSERT INTO public.site_settings (id, brand_name_ar, brand_name_en, logo_text, logo_url, hero_eyebrow, hero_title_ar, hero_title_en, hero_role_ar, hero_role_en, hero_desc_ar, hero_desc_en, hero_bg_image_url, showreel_youtube_id, hww_eyebrow, hww_title_ar, hww_title_en, hww_desc_ar, hww_desc_en, cta_eyebrow, cta_title_ar, cta_title_en, whatsapp_number, whatsapp_url, instagram_url, facebook_url, cv_url, seo_description_ar, seo_description_en, section_visibility) VALUES (${esc(s.id)}, ${esc(s.brand_name_ar)}, ${esc(s.brand_name_en)}, ${esc(s.logo_text)}, ${esc(s.logo_url)}, ${esc(s.hero_eyebrow)}, ${esc(s.hero_title_ar)}, ${esc(s.hero_title_en)}, ${esc(s.hero_role_ar)}, ${esc(s.hero_role_en)}, ${esc(s.hero_desc_ar)}, ${esc(s.hero_desc_en)}, ${esc(s.hero_bg_image_url)}, ${esc(s.showreel_youtube_id)}, ${esc(s.hww_eyebrow)}, ${esc(s.hww_title_ar)}, ${esc(s.hww_title_en)}, ${esc(s.hww_desc_ar)}, ${esc(s.hww_desc_en)}, ${esc(s.cta_eyebrow)}, ${esc(s.cta_title_ar)}, ${esc(s.cta_title_en)}, ${esc(s.whatsapp_number)}, ${esc(s.whatsapp_url)}, ${esc(s.instagram_url)}, ${esc(s.facebook_url)}, ${esc(s.cv_url)}, ${esc(s.seo_description_ar)}, ${esc(s.seo_description_en)}, ${json(s.section_visibility)}) ON CONFLICT (id) DO NOTHING;`
);
lines.push('');

for (const r of SEED_SECTIONS) {
  lines.push(
    `INSERT INTO public.sections (id, title_ar, title_en, short_ar, short_en, description_ar, description_en, icon_name, accent_color, sort_order, is_visible, show_in_nav) VALUES (${esc(r.id)}, ${esc(r.title_ar)}, ${esc(r.title_en)}, ${esc(r.short_ar)}, ${esc(r.short_en)}, ${esc(r.description_ar)}, ${esc(r.description_en)}, ${esc(r.icon_name)}, ${esc(r.accent_color)}, ${r.sort_order}, ${bool(r.is_visible)}, ${bool(r.show_in_nav)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_FOLDERS) {
  lines.push(
    `INSERT INTO public.folders (id, section_id, title_ar, title_en, subtitle_ar, subtitle_en, icon_name, note_ar, note_en, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.section_id)}, ${esc(r.title_ar)}, ${esc(r.title_en)}, ${esc(r.subtitle_ar)}, ${esc(r.subtitle_en)}, ${esc(r.icon_name)}, ${esc(r.note_ar)}, ${esc(r.note_en)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_MEDIA_ITEMS) {
  lines.push(
    `INSERT INTO public.media_items (id, section_id, folder_id, media_type, aspect_ratio, youtube_id, image_url, custom_thumb_url, title_ar, title_en, group_label_ar, group_label_en, role_tags_ar, role_tags_en, is_featured, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.section_id)}, ${esc(r.folder_id)}, ${esc(r.media_type)}, ${esc(r.aspect_ratio)}, ${esc(r.youtube_id)}, ${esc(r.image_url)}, ${esc(r.custom_thumb_url)}, ${esc(r.title_ar)}, ${esc(r.title_en)}, ${esc(r.group_label_ar)}, ${esc(r.group_label_en)}, ${esc(r.role_tags_ar)}, ${esc(r.role_tags_en)}, ${bool(r.is_featured)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_PROCESS_STEPS) {
  lines.push(
    `INSERT INTO public.process_steps (id, step_number, title_ar, title_en, desc_ar, desc_en, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.step_number)}, ${esc(r.title_ar)}, ${esc(r.title_en)}, ${esc(r.desc_ar)}, ${esc(r.desc_en)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_TESTIMONIALS) {
  lines.push(
    `INSERT INTO public.testimonials (id, client_name_ar, client_name_en, client_role_ar, client_role_en, quote_ar, quote_en, source_label, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.client_name_ar)}, ${esc(r.client_name_en)}, ${esc(r.client_role_ar)}, ${esc(r.client_role_en)}, ${esc(r.quote_ar)}, ${esc(r.quote_en)}, ${esc(r.source_label)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_SERVICES) {
  lines.push(
    `INSERT INTO public.services (id, title_ar, title_en, desc_ar, desc_en, features_ar, features_en, badge_ar, badge_en, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.title_ar)}, ${esc(r.title_en)}, ${esc(r.desc_ar)}, ${esc(r.desc_en)}, ${json(r.features_ar)}, ${json(r.features_en)}, ${esc(r.badge_ar)}, ${esc(r.badge_en)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_EQUIPMENT) {
  lines.push(
    `INSERT INTO public.equipment (id, category_ar, category_en, name, specs_ar, specs_en, icon_name, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.category_ar)}, ${esc(r.category_en)}, ${esc(r.name)}, ${esc(r.specs_ar)}, ${esc(r.specs_en)}, ${esc(r.icon_name)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}
lines.push('');

for (const r of SEED_CLIENT_LOGOS) {
  lines.push(
    `INSERT INTO public.client_logos (id, name_ar, name_en, logo_url, website_url, sort_order, is_visible) VALUES (${esc(r.id)}, ${esc(r.name_ar)}, ${esc(r.name_en)}, ${esc(r.logo_url)}, ${esc(r.website_url)}, ${r.sort_order}, ${bool(r.is_visible)}) ON CONFLICT (id) DO NOTHING;`
  );
}

fs.writeFileSync('./supabase/seed.sql', lines.join('\n'), 'utf8');
console.log('Generated supabase/seed.sql with', lines.length, 'lines');
