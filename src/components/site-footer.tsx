'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { SiteSettings } from '@/types/portfolio';
import { useLanguage } from './language-provider';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#030706]/90 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <span className="text-tealAccent">{settings.logo_text || 'MG'}</span>
          <span>·</span>
          <span>{t(settings.brand_name_ar, settings.brand_name_en)}</span>
          <span className="hidden sm:inline text-slate-500">
            | {t(settings.hero_role_ar, settings.hero_role_en)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {lang === 'ar'
              ? `جميع الحقوق محفوظة © ${new Date().getFullYear()}`
              : `© ${new Date().getFullYear()} ${settings.brand_name_en}. All rights reserved.`}
          </span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-400 transition hover:border-tealAccent/50 hover:text-tealAccent"
          >
            <Lock className="h-3 w-3" />
            <span>{lang === 'ar' ? 'الإدارة' : 'Admin'}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
