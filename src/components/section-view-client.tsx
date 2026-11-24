'use client';

import { ArrowLeft, ArrowRight, Check, Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import type {
  MediaItem,
  PortfolioFolder,
  PortfolioSection,
  SiteSettings,
} from '@/types/portfolio';
import { isOptimizableImageUrl } from '@/lib/utils';
import { useLanguage } from './language-provider';
import { PortfolioIcon } from './icon-mapper';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { MediaCard } from './video-card';

export function SectionViewClient({
  settings,
  allSections,
  section,
  folders,
  directMedia,
  folderPreviews = {},
}: {
  settings: SiteSettings;
  allSections: PortfolioSection[];
  section: PortfolioSection;
  folders: PortfolioFolder[];
  directMedia: MediaItem[];
  folderPreviews?: Record<string, { thumbUrl: string | null; count: number }>;
}) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title =
      lang === 'ar'
        ? `${section.title_ar} — أعمال ${settings.brand_name_ar} | ${settings.brand_name_ar}`
        : `${section.title_en} — ${settings.brand_name_en}`;
  }, [
    lang,
    section.title_ar,
    section.title_en,
    settings.brand_name_ar,
    settings.brand_name_en,
  ]);

  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;
  const ForwardIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const images = directMedia.filter((m) => m.media_type === 'image');
  const reels = directMedia.filter(
    (m) => m.media_type === 'youtube' && m.aspect_ratio === '9:16'
  );
  const wideVideos = directMedia.filter(
    (m) => m.media_type === 'youtube' && m.aspect_ratio !== '9:16'
  );

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader settings={settings} sections={allSections} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Top bar: Back + Share URL */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-tealAccent hover:text-tealAccent"
          >
            <BackIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-2 rounded-full border border-tealAccent/35 bg-tealAccent/10 px-4 py-2 text-xs font-bold text-tealAccent transition hover:bg-tealAccent/20"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>
              {copied
                ? lang === 'ar'
                  ? 'تم نسخ رابط القسم'
                  : 'Section link copied'
                : lang === 'ar'
                  ? 'نسخ رابط هذا القسم'
                  : 'Copy section link'}
            </span>
          </button>
        </div>

        {/* Section Header */}
        <div className="glass-panel mb-10 rounded-3xl p-6 sm:p-9">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-tealAccent/30 bg-tealAccent/10 text-tealAccent">
              <PortfolioIcon name={section.icon_name} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white sm:text-4xl">
                {t(section.title_ar, section.title_en)}
              </h1>
              <p className="mt-1 text-xs text-tealAccent/90">
                {t(section.short_ar, section.short_en)}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {t(section.description_ar, section.description_en)}
          </p>
        </div>

        {/* Direct Images (e.g. Results Analytics) */}
        {images.length > 0 && (
          <div className="mb-12 grid gap-5 md:grid-cols-2">
            {images.map((im) => (
              <MediaCard key={im.id} item={im} />
            ))}
          </div>
        )}

        {/* Sub-Folders Grid */}
        {folders.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-5 text-lg font-extrabold text-white sm:text-xl">
              {lang === 'ar' ? 'التصنيفات والمجلدات' : 'Collections & Folders'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => {
                const folderTitle = t(folder.title_ar, folder.title_en);
                const rawSubtitle = t(folder.subtitle_ar, folder.subtitle_en);
                const showSubtitle =
                  Boolean(rawSubtitle) &&
                  rawSubtitle.trim().toLowerCase() !== folderTitle.trim().toLowerCase();
                const preview = folderPreviews[folder.id];
                const itemCount = preview?.count ?? 0;
                const countLabel =
                  lang === 'ar'
                    ? itemCount === 1
                      ? 'عمل واحد'
                      : `${itemCount} أعمال`
                    : itemCount === 1
                      ? '1 item'
                      : `${itemCount} items`;

                return (
                  <Link
                    key={folder.id}
                    href={`/work/${section.id}/${folder.id}`}
                    className="group glass-panel flex flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-tealAccent/60"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[#061210]">
                      {preview?.thumbUrl ? (
                        isOptimizableImageUrl(preview.thumbUrl) ? (
                          <Image
                            src={preview.thumbUrl}
                            alt={folderTitle}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview.thumbUrl}
                            alt={folderTitle}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tealAccent/10 via-transparent to-violetAccent/10 text-tealAccent">
                          <PortfolioIcon name={folder.icon_name} className="h-10 w-10 opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      {itemCount > 0 && (
                        <span className="absolute end-3 top-3 rounded-full border border-white/15 bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-slate-100 backdrop-blur-md">
                          {countLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-tealAccent/25 bg-tealAccent/10 text-tealAccent">
                          <PortfolioIcon name={folder.icon_name} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold text-white">
                            {folderTitle}
                          </h3>
                          {showSubtitle && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {rawSubtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <ForwardIcon className="h-5 w-5 shrink-0 text-tealAccent opacity-60 transition group-hover:opacity-100" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Wide 16:9 Direct Videos */}
        {wideVideos.length > 0 && (
          <div className="mb-10 grid gap-6 md:grid-cols-2">
            {wideVideos.map((v) => (
              <MediaCard key={v.id} item={v} />
            ))}
          </div>
        )}

        {/* Vertical 9:16 Reels */}
        {reels.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {reels.map((v) => (
              <MediaCard key={v.id} item={v} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}
