import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import React from 'react';
import { LanguageProvider } from '@/components/language-provider';
import { MetaPixel } from '@/components/meta-pixel';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import {
  buildOgMetadata,
  DEFAULT_SEO_KEYWORDS,
  getSiteUrl,
  resolveSeoDescriptionAr,
} from '@/lib/seo';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolioBundle();
  const siteUrl = getSiteUrl();
  const title = `${settings.brand_name_ar} — مخرج ومصور ومونتير وصانع ريلز | ${settings.brand_name_en}`;
  const description = resolveSeoDescriptionAr(settings);
  const siteName = `${settings.brand_name_ar} | ${settings.brand_name_en}`;
  const ogImage = settings.hero_bg_image_url || '/images/hero-portrait.webp';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${settings.brand_name_ar}`,
    },
    description,
    keywords: DEFAULT_SEO_KEYWORDS,
    authors: [{ name: settings.brand_name_en, url: siteUrl }],
    creator: settings.brand_name_en,
    publisher: settings.brand_name_en,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    ...buildOgMetadata({
      title,
      description,
      path: '/',
      imageUrl: ogImage,
      alt: `${settings.brand_name_ar} — ${settings.brand_name_en}`,
      siteName,
    }),
  };
}

export const viewport: Viewport = {
  themeColor: '#040908',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable} ${jakarta.variable}`}>
      <body className="studio-grid-bg antialiased selection:bg-tealAccent/30 selection:text-white">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
