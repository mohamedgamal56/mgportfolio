import type { MetadataRoute } from 'next';
import { DEFAULT_SEO_DESCRIPTION_AR } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'محمد جمال — Mohamed Gamal',
    short_name: 'محمد جمال',
    description: DEFAULT_SEO_DESCRIPTION_AR,
    start_url: '/',
    display: 'standalone',
    background_color: '#040908',
    theme_color: '#040908',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
