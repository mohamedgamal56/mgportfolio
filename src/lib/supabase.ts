import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://xfuczpeigrzcnddvimcu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_H1X9zDfoT-gTjW-utLXcCQ_yAGDhjwg';

export function getSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    envUrl && envUrl.startsWith('https://') && !envUrl.includes('your-project-id')
      ? envUrl
      : DEFAULT_SUPABASE_URL;

  const anonKey =
    envKey && !envKey.includes('your-supabase-anon-key')
      ? envKey
      : DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('https://'));
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
