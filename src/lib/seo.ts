import type { Metadata } from 'next';
import type { PortfolioDataBundle, SiteSettings } from '@/types/portfolio';
import { getYouTubeThumbUrl } from './utils';

const DEFAULT_SITE_URL = 'https://mohamedgamalpro.com';
const OLD_SHORT_SEO_AR =
  'محمد جمال — مخرج ومصور وصانع محتوى ريلز وإعلانات وبودكاست بهوية بصرية سينمائية ونتائج حقيقية للبراندات والعيادات.';

export const DEFAULT_SEO_DESCRIPTION_AR =
  'محمد جمال — مخرج ومصور ومونتير لصناعة الريلز والإعلانات التجارية، تصوير البودكاست، والمحتوى الطبي للعيادات والبراندات في مصر. شاهد الأعمال واحجز مشروعك.';

export const DEFAULT_SEO_DESCRIPTION_EN =
  'Mohamed Gamal — Commercial Filmmaker, Video Editor & Reel Creator crafting high-impact Reels, ads, podcasts, and medical content for clinics and brands.';

export const DEFAULT_SEO_KEYWORDS = [
  'محمد جمال',
  'مصور ومونتير',
  'مخرج إعلانات',
  'صانع ريلز',
  'تصوير ريلز',
  'مونتاج فيديو',
  'تصوير محتوى طبي',
  'تصوير عيادات',
  'تصوير بودكاست',
  'إنتاج فيديو تجاري',
  'Mohamed Gamal',
  'Commercial Filmmaker',
  'Reel Creator',
  'Video Editor Egypt',
  'Videographer Egypt',
];

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && (raw.startsWith('https://') || raw.startsWith('http://'))) {
    return raw.replace(/\/+$/, '');
  }
  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(urlOrPath: string | null | undefined, siteUrl = getSiteUrl()): string {
  if (!urlOrPath) return `${siteUrl}/images/hero-portrait.webp`;
  if (urlOrPath.startsWith('https://') || urlOrPath.startsWith('http://')) {
    return urlOrPath;
  }
  return `${siteUrl}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
}

export function resolveSeoDescriptionAr(settings: SiteSettings): string {
  const raw = settings.seo_description_ar?.trim();
  if (!raw || raw === OLD_SHORT_SEO_AR) {
    return DEFAULT_SEO_DESCRIPTION_AR;
  }
  return raw;
}

export function buildOgMetadata({
  title,
  description,
  path,
  imageUrl,
  alt,
  siteName,
}: {
  title: string;
  description: string;
  path: string;
  imageUrl: string;
  alt: string;
  siteName: string;
}): Pick<Metadata, 'alternates' | 'openGraph' | 'twitter'> {
  const siteUrl = getSiteUrl();
  const fullUrl = `${siteUrl}${path === '/' ? '' : path}`;
  const absoluteImage = toAbsoluteUrl(imageUrl, siteUrl);

  return {
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      type: 'website',
      locale: 'ar_EG',
      alternateLocale: ['en_US'],
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImage],
    },
  };
}

export function pickCollectionOgImage(bundle: PortfolioDataBundle, sectionId: string, folderId?: string): string {
  const match = bundle.mediaItems.find(
    (m) =>
      m.section_id === sectionId &&
      (!folderId || m.folder_id === folderId) &&
      (m.custom_thumb_url || m.image_url || m.youtube_id)
  );
  if (match?.custom_thumb_url) return match.custom_thumb_url;
  if (match?.image_url) return match.image_url;
  if (match?.youtube_id) return getYouTubeThumbUrl(match.youtube_id);
  return bundle.settings.hero_bg_image_url || '/images/hero-portrait.webp';
}

export function buildPortfolioJsonLd(bundle: PortfolioDataBundle) {
  const siteUrl = getSiteUrl();
  const { settings, sections, folders, mediaItems } = bundle;
  const description = resolveSeoDescriptionAr(settings);
  const sectionMap = new Map(sections.map((s) => [s.id, s]));
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  const sameAs = [settings.instagram_url, settings.facebook_url].filter(
    (u): u is string => Boolean(u && u.startsWith('http'))
  );

  const videoNodes = mediaItems
    .filter((m) => m.media_type === 'youtube' && m.youtube_id)
    .slice(0, 12)
    .map((m, index) => {
      const sec = sectionMap.get(m.section_id);
      const fld = m.folder_id ? folderMap.get(m.folder_id) : undefined;
      const name =
        m.title_ar ||
        m.title_en ||
        `${sec?.title_ar || 'فيديو'} — ${settings.brand_name_ar}`;
      const videoDesc = [
        sec?.title_ar,
        fld?.subtitle_ar || fld?.title_ar,
        m.role_tags_ar,
        settings.brand_name_ar,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VideoObject',
          name,
          description: videoDesc || description,
          thumbnailUrl: toAbsoluteUrl(
            m.custom_thumb_url || getYouTubeThumbUrl(m.youtube_id as string),
            siteUrl
          ),
          embedUrl: `https://www.youtube.com/embed/${m.youtube_id}`,
          contentUrl: `https://www.youtube.com/watch?v=${m.youtube_id}`,
          author: {
            '@type': 'Person',
            name: settings.brand_name_ar,
          },
        },
      };
    });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: `${settings.brand_name_ar} | ${settings.brand_name_en}`,
        description,
        inLanguage: ['ar', 'en'],
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: settings.brand_name_ar,
        alternateName: settings.brand_name_en,
        url: siteUrl,
        image: toAbsoluteUrl(settings.hero_bg_image_url, siteUrl),
        jobTitle: 'Commercial Filmmaker, Video Editor & Reel Creator',
        description,
        sameAs,
        knowsAbout: [
          'Commercial Video Production',
          'Reels Creation',
          'Medical Video Content',
          'Podcast Production',
          'Video Editing and Color Grading',
        ],
      },
      ...(videoNodes.length > 0
        ? [
            {
              '@type': 'ItemList',
              '@id': `${siteUrl}/#portfolio-videos`,
              name: `أعمال ${settings.brand_name_ar} — Portfolio Reels & Videos`,
              itemListElement: videoNodes,
            },
          ]
        : []),
    ],
  };
}
