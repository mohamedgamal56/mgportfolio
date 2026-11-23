import type { MetadataRoute } from 'next';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const bundle = await getPortfolioBundle();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const section of bundle.sections) {
    entries.push({
      url: `${siteUrl}/work/${section.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  for (const folder of bundle.folders) {
    entries.push({
      url: `${siteUrl}/work/${folder.section_id}/${folder.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  return entries;
}
