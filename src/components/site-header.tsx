'use client';

import { Globe, Lock, Menu, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import type { PortfolioSection, SiteSettings } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { useLanguage } from './language-provider';

export function SiteHeader({
  settings,
  sections,
}: {
  settings: SiteSettings;
  sections: PortfolioSection[];
}) {
  const { lang, toggleLang, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navSections = sections.filter((s) => s.is_visible && s.show_in_nav);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#040908]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo_url}
                alt={t(settings.brand_name_ar, settings.brand_name_en)}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-tealAccent/40 bg-tealAccent/10 text-sm font-black tracking-wider text-tealAccent">
                {settings.logo_text || 'MG'}
              </div>
            )}
            <div className="hidden sm:block">
              <span className="block text-sm font-bold text-white">
                {t(settings.brand_name_ar, settings.brand_name_en)}
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-slate-400">
                FILMMAKER · REEL CREATOR
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-tealAccent/10 hover:text-tealAccent"
            >
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            {navSections.map((sec) => (
              <Link
                key={sec.id}
                href={`/work/${sec.id}`}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-tealAccent/10 hover:text-tealAccent"
              >
                {t(sec.title_ar, sec.title_en)}
              </Link>
            ))}
            <Link
              href="/#booking"
              className="ms-1 whitespace-nowrap rounded-full border border-tealAccent/40 bg-tealAccent/10 px-3.5 py-1.5 text-xs font-bold text-tealAccent transition hover:bg-tealAccent hover:text-obsidian"
            >
              {lang === 'ar' ? 'احجز مشروعك' : 'Book Project'}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-tealAccent/60 hover:text-tealAccent"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-tealAccent" />
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className={cn(
              'fixed top-0 bottom-0 w-72 max-w-[85vw] border-tealAccent/25 bg-[#06110e] p-6 shadow-2xl overflow-y-auto',
              lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-tealAccent">
                {lang === 'ar' ? 'الأقسام' : 'Navigation'}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/10">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="py-3.5 text-sm font-semibold text-slate-100 hover:text-tealAccent"
              >
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              {navSections.map((sec) => (
                <Link
                  key={sec.id}
                  href={`/work/${sec.id}`}
                  onClick={() => setDrawerOpen(false)}
                  className="py-3.5 text-sm font-semibold text-slate-200 hover:text-tealAccent"
                >
                  {t(sec.title_ar, sec.title_en)}
                </Link>
              ))}
              <Link
                href="/#booking"
                onClick={() => setDrawerOpen(false)}
                className="py-3.5 text-sm font-bold text-tealAccent"
              >
                {lang === 'ar' ? 'احجز مشروعك الآن' : 'Book a Project'}
              </Link>
              <Link
                href="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 py-3.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
