export type Language = 'ar' | 'en';

export type AspectRatio = '9:16' | '16:9' | '16:10';
export type MediaType = 'youtube' | 'image' | 'placeholder';
export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface SectionVisibility {
  explore_work: boolean;
  featured_work: boolean;
  results_showcase: boolean;
  how_we_work: boolean;
  testimonials: boolean;
  services: boolean;
  equipment: boolean;
  client_logos: boolean;
  booking_form: boolean;
}

export interface SiteSettings {
  id: string;
  brand_name_ar: string;
  brand_name_en: string;
  logo_text: string;
  logo_url: string | null;
  hero_eyebrow: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_role_ar: string;
  hero_role_en: string;
  hero_desc_ar: string;
  hero_desc_en: string;
  hero_bg_image_url: string;
  showreel_youtube_id: string | null;
  hww_eyebrow: string;
  hww_title_ar: string;
  hww_title_en: string;
  hww_desc_ar: string;
  hww_desc_en: string;
  cta_eyebrow: string;
  cta_title_ar: string;
  cta_title_en: string;
  whatsapp_number: string;
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
  cv_url?: string | null;
  seo_description_ar: string;
  seo_description_en: string;
  section_visibility: SectionVisibility;
}

export interface PortfolioSection {
  id: string;
  title_ar: string;
  title_en: string;
  short_ar: string;
  short_en: string;
  description_ar: string;
  description_en: string;
  icon_name: string;
  accent_color: 'teal' | 'violet' | 'amber';
  sort_order: number;
  is_visible: boolean;
  show_in_nav: boolean;
}

export interface PortfolioFolder {
  id: string;
  section_id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  icon_name: string;
  note_ar: string | null;
  note_en: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface MediaItem {
  id: string;
  section_id: string;
  folder_id: string | null;
  media_type: MediaType;
  aspect_ratio: AspectRatio;
  youtube_id: string | null;
  image_url: string | null;
  custom_thumb_url: string | null;
  title_ar: string | null;
  title_en: string | null;
  group_label_ar: string | null;
  group_label_en: string | null;
  role_tags_ar: string | null;
  role_tags_en: string | null;
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
}

export interface ProcessStep {
  id: string;
  step_number: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  sort_order: number;
  is_visible: boolean;
}

export interface Testimonial {
  id: string;
  client_name_ar: string;
  client_name_en: string;
  client_role_ar: string | null;
  client_role_en: string | null;
  quote_ar: string;
  quote_en: string;
  source_label: string;
  sort_order: number;
  is_visible: boolean;
}

export interface ServiceItem {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  features_ar: string[];
  features_en: string[];
  badge_ar: string | null;
  badge_en: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface EquipmentItem {
  id: string;
  category_ar: string;
  category_en: string;
  name: string;
  specs_ar: string;
  specs_en: string;
  icon_name: string;
  sort_order: number;
  is_visible: boolean;
}

export interface ClientLogo {
  id: string;
  name_ar: string;
  name_en: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface ContactLead {
  id: string;
  client_name: string;
  whatsapp_phone: string;
  project_type: string;
  industry_field: string | null;
  budget_range: string | null;
  project_details: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface PortfolioDataBundle {
  settings: SiteSettings;
  sections: PortfolioSection[];
  folders: PortfolioFolder[];
  mediaItems: MediaItem[];
  processSteps: ProcessStep[];
  testimonials: Testimonial[];
  services: ServiceItem[];
  equipment: EquipmentItem[];
  clientLogos: ClientLogo[];
  source: 'supabase' | 'seed';
}
