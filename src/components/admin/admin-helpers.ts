import { revalidatePortfolio } from '@/app/actions';
import { SEED_BUNDLE } from '@/data/seed-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

export function slugifyId(text: string, prefix = 'item'): string {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const rand = Math.random().toString(36).slice(2, 6);
  return clean ? `${clean}-${rand}` : `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export async function uploadPortfolioFile(file: File, folder = 'uploads'): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('يجب ربط Supabase أولاً لرفع الملفات والصور.');
  }
  const supabase = createSupabaseBrowserClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from('portfolio-media')
    .upload(filePath, file, { upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function syncSeedToSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('يرجى إعداد مفاتيح Supabase أولاً.');
  }
  const supabase = createSupabaseBrowserClient();

  const ops = [
    supabase.from('site_settings').upsert(SEED_BUNDLE.settings, { onConflict: 'id' }),
    supabase.from('sections').upsert(SEED_BUNDLE.sections, { onConflict: 'id' }),
    supabase.from('folders').upsert(SEED_BUNDLE.folders, { onConflict: 'id' }),
    supabase.from('media_items').upsert(SEED_BUNDLE.mediaItems, { onConflict: 'id' }),
    supabase.from('process_steps').upsert(SEED_BUNDLE.processSteps, { onConflict: 'id' }),
    supabase.from('testimonials').upsert(SEED_BUNDLE.testimonials, { onConflict: 'id' }),
    supabase.from('services').upsert(SEED_BUNDLE.services, { onConflict: 'id' }),
    supabase.from('equipment').upsert(SEED_BUNDLE.equipment, { onConflict: 'id' }),
    supabase.from('client_logos').upsert(SEED_BUNDLE.clientLogos, { onConflict: 'id' }),
  ];

  const results = await Promise.all(ops);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  await revalidatePortfolio();
}

export async function swapSortOrder(
  table: string,
  items: Array<{ id: string; sort_order: number }>,
  index: number,
  direction: 'up' | 'down'
) {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const copy = [...items];
  const current = copy[index];
  const neighbor = copy[targetIndex];

  // Swap items in array and re-normalize sort_order cleanly
  copy[index] = neighbor;
  copy[targetIndex] = current;

  const updated = copy.map((item, idx) => ({ ...item, sort_order: idx + 1 }));

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseBrowserClient();
    await Promise.all([
      supabase.from(table).update({ sort_order: index + 1 }).eq('id', neighbor.id),
      supabase.from(table).update({ sort_order: targetIndex + 1 }).eq('id', current.id),
    ]);
    await revalidatePortfolio();
  }

  return updated;
}
