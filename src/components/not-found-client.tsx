'use client';

import { ArrowLeft, ArrowRight, Film, Home } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import type { PortfolioSection, SiteSettings } from '@/types/portfolio';
import { useLanguage } from './language-provider';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

export function NotFoundClient({
  settings,
  sections,
}: {
  settings: SiteSettings;
  sections: PortfolioSection[];
}) {
  const { lang } = useLanguage();
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    document.title =
      lang === 'ar'
        ? `الصفحة غير موجودة — ${settings.brand_name_ar}`
        : `Page Not Found — ${settings.brand_name_en}`;
  }, [lang, settings.brand_name_ar, settings.brand_name_en]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader settings={settings} sections={sections} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl border border-tealAccent/25 p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-tealAccent/35 bg-tealAccent/10 font-latin text-lg font-black text-tealAccent">
            404
          </div>
          <h1 className="text-2xl font-black text-white sm:text-4xl">
            {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
            {lang === 'ar'
              ? 'الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله. يمكنك العودة للصفحة الرئيسية أو استكشاف الأعمال.'
              : 'The page you are looking for does not exist or has been moved. Return home or browse the portfolio.'}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-tealAccent px-6 py-3 text-sm font-extrabold text-obsidian transition hover:brightness-110"
            >
              <Home className="h-4 w-4" />
              <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </Link>
            <Link
              href="/work/social"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-tealAccent hover:text-tealAccent"
            >
              <Film className="h-4 w-4" />
              <span>{lang === 'ar' ? 'استكشف الأعمال' : 'Explore Work'}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}
