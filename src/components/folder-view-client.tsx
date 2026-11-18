'use client';

import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import type {
  MediaItem,
  PortfolioFolder,
  PortfolioSection,
  SiteSettings,
} from '@/types/portfolio';
import { useLanguage } from './language-provider';
import { PortfolioIcon } from './icon-mapper';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { MediaCard } from './video-card';

export function FolderViewClient({
  settings,
  allSections,
  section,
  folder,
  items,
}: {
  settings: SiteSettings;
  allSections: PortfolioSection[];
  section: PortfolioSection;
  folder: PortfolioFolder;
  items: MediaItem[];
}) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;

  // Group items sequentially by group_label (so Podcast shows Full Episode 16:9 then BTS 9:16!)
  const groups: Array<{ label: string; list: MediaItem[] }> = [];
  for (const item of items) {
    const label = t(item.group_label_ar, item.group_label_en) || '__default__';
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.list.push(item);
    } else {
      groups.push({ label, list: [item] });
    }
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader settings={settings} sections={allSections} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/work/${section.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-tealAccent hover:text-tealAccent"
            >
              <BackIcon className="h-4 w-4" />
              <span>{t(section.title_ar, section.title_en)}</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-full border border-tealAccent/35 bg-tealAccent/10 px-4 py-2 text-xs font-bold text-tealAccent transition hover:bg-tealAccent/20"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>
              {copied
                ? lang === 'ar'
                  ? 'تم نسخ الرابط'
                  : 'Link copied'
                : lang === 'ar'
                  ? 'مشاركة الرابط'
                  : 'Share folder link'}
            </span>
          </button>
        </div>

        <div className="glass-panel mb-10 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-tealAccent/30 bg-tealAccent/10 text-tealAccent">
              <PortfolioIcon name={folder.icon_name} className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-tealAccent">
                {t(section.title_ar, section.title_en)}
              </span>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                {t(folder.title_ar, folder.title_en)}
              </h1>
              {(folder.subtitle_ar || folder.subtitle_en) && (
                <p className="mt-1 text-xs text-slate-400">
                  {t(folder.subtitle_ar, folder.subtitle_en)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {groups.map((grp, idx) => {
            const hasOnlyReels = grp.list.every((m) => m.aspect_ratio === '9:16');
            const hasWideOrImages = grp.list.some(
              (m) => m.aspect_ratio !== '9:16' || m.media_type !== 'youtube'
            );

            return (
              <div key={`${grp.label}-${idx}`}>
                {grp.label !== '__default__' && (
                  <h2 className="mb-4 border-s-4 border-tealAccent ps-3 text-lg font-bold text-slate-100">
                    {grp.label}
                  </h2>
                )}

                {hasOnlyReels ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {grp.list.map((m) => (
                      <MediaCard key={m.id} item={m} />
                    ))}
                  </div>
                ) : hasWideOrImages ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {grp.list.map((m) => (
                      <MediaCard key={m.id} item={m} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="glass-panel rounded-2xl p-10 text-center text-sm text-slate-400">
              {lang === 'ar'
                ? 'لا توجد أعمال مضافة في هذا المجلد حالياً.'
                : 'No media items in this folder yet.'}
            </div>
          )}
        </div>
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}
