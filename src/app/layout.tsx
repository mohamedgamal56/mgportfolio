import type { Metadata, Viewport } from 'next';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import React from 'react';
import { LanguageProvider } from '@/components/language-provider';
import { getPortfolioBundle } from '@/lib/portfolio-service';
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
  const title = `${settings.brand_name_ar} — ${settings.hero_role_en}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mgportfolio-five.vercel.app';

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: settings.seo_description_ar,
    openGraph: {
      title,
      description: settings.seo_description_ar,
      type: 'website',
      locale: 'ar_EG',
      images: [
        {
          url: settings.hero_bg_image_url || '/images/hero-portrait.webp',
          width: 1163,
          height: 1352,
          alt: settings.brand_name_en,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: settings.seo_description_ar,
      images: [settings.hero_bg_image_url || '/images/hero-portrait.webp'],
    },
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
      </body>
    </html>
  );
}
