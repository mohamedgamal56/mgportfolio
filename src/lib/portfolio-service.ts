import {
  SEED_BUNDLE,
  SEED_CLIENT_LOGOS,
  SEED_EQUIPMENT,
  SEED_FOLDERS,
  SEED_MEDIA_ITEMS,
  SEED_PROCESS_STEPS,
  SEED_SECTIONS,
  SEED_SERVICES,
  SEED_SETTINGS,
  SEED_TESTIMONIALS,
} from '@/data/seed-data';
import type { PortfolioDataBundle, SiteSettings } from '@/types/portfolio';
import { createSupabaseServerClient } from './supabase-server';

function filterVisibleBundle(bundle: PortfolioDataBundle): PortfolioDataBundle {
  const visibleSections = bundle.sections.filter((s) => s.is_visible);
  const visibleSectionIds = new Set(visibleSections.map((s) => s.id));
  const visibleFolders = bundle.folders.filter(
    (f) => f.is_visible && visibleSectionIds.has(f.section_id)
  );
  const visibleFolderIds = new Set(visibleFolders.map((f) => f.id));

  return {
    ...bundle,
    sections: visibleSections,
    folders: visibleFolders,
    mediaItems: bundle.mediaItems.filter(
      (m) =>
        m.is_visible &&
        visibleSectionIds.has(m.section_id) &&
        (!m.folder_id || visibleFolderIds.has(m.folder_id))
    ),
    processSteps: bundle.processSteps.filter((p) => p.is_visible),
    testimonials: bundle.testimonials.filter((t) => t.is_visible),
    services: bundle.services.filter((s) => s.is_visible),
    equipment: bundle.equipment.filter((e) => e.is_visible),
    clientLogos: bundle.clientLogos.filter((c) => c.is_visible),
  };
}

export async function getPortfolioBundle(options?: {
  includeHidden?: boolean;
}): Promise<PortfolioDataBundle> {
  const includeHidden = options?.includeHidden ?? false;

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return includeHidden ? SEED_BUNDLE : filterVisibleBundle(SEED_BUNDLE);
    }

    const [
      settingsRes,
      sectionsRes,
      foldersRes,
      mediaRes,
      stepsRes,
      testimonialsRes,
      servicesRes,
      equipmentRes,
      logosRes,
    ] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 'main').maybeSingle(),
      supabase.from('sections').select('*').order('sort_order', { ascending: true }),
      supabase.from('folders').select('*').order('sort_order', { ascending: true }),
      supabase.from('media_items').select('*').order('sort_order', { ascending: true }),
      supabase.from('process_steps').select('*').order('sort_order', { ascending: true }),
      supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
      supabase.from('services').select('*').order('sort_order', { ascending: true }),
      supabase.from('equipment').select('*').order('sort_order', { ascending: true }),
      supabase.from('client_logos').select('*').order('sort_order', { ascending: true }),
    ]);

    // If database hasn't been seeded yet, seamlessly fall back to seed data
    const hasSeededSections =
      !sectionsRes.error && Array.isArray(sectionsRes.data) && sectionsRes.data.length > 0;

    if (!hasSeededSections || settingsRes.error) {
      return includeHidden ? SEED_BUNDLE : filterVisibleBundle(SEED_BUNDLE);
    }

    const mergedSettings: SiteSettings = {
      ...SEED_SETTINGS,
      ...(settingsRes.data || {}),
      section_visibility: {
        ...SEED_SETTINGS.section_visibility,
        ...((settingsRes.data?.section_visibility as Record<string, boolean>) || {}),
      },
    };

    const bundle: PortfolioDataBundle = {
      settings: mergedSettings,
      sections: sectionsRes.data?.length ? sectionsRes.data : SEED_SECTIONS,
      folders: foldersRes.data ?? SEED_FOLDERS,
      mediaItems: mediaRes.data ?? SEED_MEDIA_ITEMS,
      processSteps: stepsRes.data?.length ? stepsRes.data : SEED_PROCESS_STEPS,
      testimonials: testimonialsRes.data?.length ? testimonialsRes.data : SEED_TESTIMONIALS,
      services: servicesRes.data ?? SEED_SERVICES,
      equipment: equipmentRes.data ?? SEED_EQUIPMENT,
      clientLogos: logosRes.data ?? SEED_CLIENT_LOGOS,
      source: 'supabase',
    };

    return includeHidden ? bundle : filterVisibleBundle(bundle);
  } catch {
    return includeHidden ? SEED_BUNDLE : filterVisibleBundle(SEED_BUNDLE);
  }
}
