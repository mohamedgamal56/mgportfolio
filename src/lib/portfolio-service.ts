import type { SupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
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
import { createSupabasePublicClient, createSupabaseServerClient } from './supabase-server';
import { normalizeArabicCopy } from './utils';

function normalizePublicBundle(bundle: PortfolioDataBundle): PortfolioDataBundle {
  const othmanAfterSeed = SEED_MEDIA_ITEMS.find((m) => m.id === 'pod-othman-timeline');
  const othmanBeforeSeed = SEED_MEDIA_ITEMS.find((m) => m.id === 'pod-othman-timeline-2');
  const hasOthmanSecond = bundle.mediaItems.some((m) => m.id === 'pod-othman-timeline-2');
  let upgradedOthmanTimeline = false;

  const mediaItems = bundle.mediaItems.map((m) => {
    if (
      m.id === 'pod-othman-timeline' &&
      m.media_type === 'placeholder' &&
      !m.image_url &&
      othmanAfterSeed
    ) {
      upgradedOthmanTimeline = true;
      return {
        ...m,
        ...othmanAfterSeed,
        is_visible: m.is_visible,
      };
    }
    return m;
  });

  if (upgradedOthmanTimeline && !hasOthmanSecond && othmanBeforeSeed) {
    const idx = mediaItems.findIndex((m) => m.id === 'pod-othman-timeline');
    if (idx !== -1) {
      mediaItems.splice(idx + 1, 0, othmanBeforeSeed);
    } else {
      mediaItems.push(othmanBeforeSeed);
    }
  }

  return {
    ...bundle,
    sections: bundle.sections.map((s) => ({
      ...s,
      short_ar: normalizeArabicCopy(s.short_ar),
      description_ar: normalizeArabicCopy(s.description_ar),
    })),
    folders: bundle.folders.map((f) => {
      if (upgradedOthmanTimeline && f.id === 'othman') {
        return {
          ...f,
          subtitle_ar: 'الحلقة الكاملة + صور من الإيديتنج',
          subtitle_en: 'Full Episode + Editing Screenshots',
        };
      }
      return {
        ...f,
        subtitle_ar: normalizeArabicCopy(f.subtitle_ar),
      };
    }),
    mediaItems,
    processSteps: bundle.processSteps.map((p) => ({
      ...p,
      desc_ar: normalizeArabicCopy(p.desc_ar),
    })),
    testimonials: bundle.testimonials.map((t) => ({
      ...t,
      quote_ar: normalizeArabicCopy(t.quote_ar),
    })),
    services: bundle.services.map((s) => ({
      ...s,
      desc_ar: normalizeArabicCopy(s.desc_ar),
      features_ar: s.features_ar.map(normalizeArabicCopy),
    })),
  };
}

function filterVisibleBundle(bundle: PortfolioDataBundle): PortfolioDataBundle {
  const normalized = normalizePublicBundle(bundle);
  const visibleSections = normalized.sections.filter((s) => s.is_visible);
  const visibleSectionIds = new Set(visibleSections.map((s) => s.id));
  const visibleFolders = normalized.folders.filter(
    (f) => f.is_visible && visibleSectionIds.has(f.section_id)
  );
  const visibleFolderIds = new Set(visibleFolders.map((f) => f.id));

  return {
    ...normalized,
    sections: visibleSections,
    folders: visibleFolders,
    mediaItems: normalized.mediaItems.filter(
      (m) =>
        m.is_visible &&
        m.media_type !== 'placeholder' &&
        visibleSectionIds.has(m.section_id) &&
        (!m.folder_id || visibleFolderIds.has(m.folder_id))
    ),
    processSteps: normalized.processSteps.filter((p) => p.is_visible),
    testimonials: normalized.testimonials.filter((t) => t.is_visible),
    services: normalized.services.filter((s) => s.is_visible),
    equipment: normalized.equipment.filter((e) => e.is_visible),
    clientLogos: normalized.clientLogos.filter((c) => c.is_visible),
  };
}

async function fetchPortfolioBundleFromClient(
  supabase: SupabaseClient | null
): Promise<PortfolioDataBundle> {
  if (!supabase) {
    return SEED_BUNDLE;
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
    return SEED_BUNDLE;
  }

  const mergedSettings: SiteSettings = {
    ...SEED_SETTINGS,
    ...(settingsRes.data || {}),
    section_visibility: {
      ...SEED_SETTINGS.section_visibility,
      ...((settingsRes.data?.section_visibility as Record<string, boolean>) || {}),
    },
  };

  return {
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
}

const getCachedRawPortfolioBundle = unstable_cache(
  async () => {
    try {
      const supabase = createSupabasePublicClient();
      return await fetchPortfolioBundleFromClient(supabase);
    } catch {
      return SEED_BUNDLE;
    }
  },
  ['portfolio-bundle-v2'],
  { revalidate: 300, tags: ['portfolio'] }
);

const getCachedPublicPortfolioBundle = cache(async () => {
  const raw = await getCachedRawPortfolioBundle();
  return filterVisibleBundle(raw);
});

export async function getPortfolioBundle(options?: {
  includeHidden?: boolean;
}): Promise<PortfolioDataBundle> {
  if (options?.includeHidden) {
    try {
      const supabase = await createSupabaseServerClient();
      return await fetchPortfolioBundleFromClient(supabase);
    } catch {
      return SEED_BUNDLE;
    }
  }

  return getCachedPublicPortfolioBundle();
}
