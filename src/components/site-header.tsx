'use client';

import { Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navSections = sections.filter((s) => s.is_visible && s.show_in_nav);
  const isHomeActive = pathname === '/';

  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

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
              <span
                className={cn(
                  'block text-[10px] text-slate-400',
                  lang === 'en' && 'tracking-[0.2em]'
                )}
              >
                {lang === 'ar' ? 'مخرج ومصور · صانع ريلز' : 'FILMMAKER · REEL CREATOR'}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              aria-current={isHomeActive ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                isHomeActive
                  ? 'bg-tealAccent/15 text-tealAccent'
                  : 'text-slate-300 hover:bg-tealAccent/10 hover:text-tealAccent'
              )}
            >
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            {navSections.map((sec) => {
              const secHref = `/work/${sec.id}`;
              const isActive =
                pathname === secHref || pathname.startsWith(`${secHref}/`);
              return (
                <Link
                  key={sec.id}
                  href={secHref}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    isActive
                      ? 'bg-tealAccent/15 text-tealAccent'
                      : 'text-slate-300 hover:bg-tealAccent/10 hover:text-tealAccent'
                  )}
                >
                  {t(sec.title_ar, sec.title_en)}
                </Link>
              );
            })}
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
              aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="h-3.5 w-3.5 text-tealAccent" />
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 lg:hidden"
              aria-label={lang === 'ar' ? 'فتح القائمة' : 'Open menu'}
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
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Navigation menu'}
            className={cn(
              'fixed top-0 bottom-0 w-72 max-w-[85vw] border-tealAccent/25 bg-[#06110e] p-6 shadow-2xl overflow-y-auto',
              lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span
                className={cn(
                  'text-xs font-bold text-tealAccent',
                  lang === 'en' && 'uppercase tracking-widest'
                )}
              >
                {lang === 'ar' ? 'الأقسام' : 'Navigation'}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-white/10">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                aria-current={isHomeActive ? 'page' : undefined}
                className={cn(
                  'py-3.5 text-sm font-semibold hover:text-tealAccent',
                  isHomeActive ? 'text-tealAccent' : 'text-slate-100'
                )}
              >
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              {navSections.map((sec) => {
                const secHref = `/work/${sec.id}`;
                const isActive =
                  pathname === secHref || pathname.startsWith(`${secHref}/`);
                return (
                  <Link
                    key={sec.id}
                    href={secHref}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'py-3.5 text-sm font-semibold hover:text-tealAccent',
                      isActive ? 'text-tealAccent' : 'text-slate-200'
                    )}
                  >
                    {t(sec.title_ar, sec.title_en)}
                  </Link>
                );
              })}
              <Link
                href="/#booking"
                onClick={() => setDrawerOpen(false)}
                className="py-3.5 text-sm font-bold text-tealAccent"
              >
                {lang === 'ar' ? 'احجز مشروعك الآن' : 'Book a Project'}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
