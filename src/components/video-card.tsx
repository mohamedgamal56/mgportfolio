'use client';

import { Film, ImageIcon, Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import type { MediaItem } from '@/types/portfolio';
import { cn, getYouTubeThumbUrl, isOptimizableImageUrl } from '@/lib/utils';
import { useLanguage } from './language-provider';
import { VideoLightbox } from './video-modal';

export function MediaCard({ item }: { item: MediaItem }) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const title = t(item.title_ar, item.title_en);
  const roleTags = t(item.role_tags_ar, item.role_tags_en);
  const isVertical = item.aspect_ratio === '9:16';
  const brandLabel = lang === 'ar' ? 'محمد جمال' : 'Mohamed Gamal';

  const handleActivateKey = (
    e: React.KeyboardEvent<HTMLElement>,
    activate: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  };

  if (item.media_type === 'placeholder') {
    return (
      <div className="glass-panel flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-tealAccent/35 p-6 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-tealAccent/10 text-tealAccent">
          <ImageIcon className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">
          {title ||
            (lang === 'ar'
              ? 'صورة إضافية قابلة للرفع من لوحة التحكم'
              : 'Additional screenshot uploadable via Admin')}
        </p>
      </div>
    );
  }

  if (item.media_type === 'image' && item.image_url) {
    const imageAlt = title
      ? `${title} — ${brandLabel}`
      : lang === 'ar'
        ? 'نتائج أعمال محمد جمال'
        : 'Mohamed Gamal portfolio work';
    return (
      <>
        <figure
          role="button"
          tabIndex={0}
          aria-label={
            title
              ? `${title} — ${lang === 'ar' ? 'عرض الصورة' : 'View image'}`
              : lang === 'ar'
                ? 'عرض الصورة'
                : 'View image'
          }
          onClick={() => setOpen(true)}
          onKeyDown={(e) => handleActivateKey(e, () => setOpen(true))}
          className="group glass-panel cursor-pointer overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-tealAccent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tealAccent"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
            {isOptimizableImageUrl(item.image_url) ? (
              <Image
                src={item.image_url}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={imageAlt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
          {(title || roleTags) && (
            <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
              <div>
                {title && (
                  <h3 className="text-sm font-bold text-slate-100">{title}</h3>
                )}
                {roleTags && (
                  <p className="mt-0.5 text-xs text-slate-400">{roleTags}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-tealAccent/25 bg-tealAccent/10 px-2.5 py-0.5 text-[11px] font-medium text-tealAccent">
                {lang === 'ar' ? 'تكبير' : 'Zoom'}
              </span>
            </figcaption>
          )}
        </figure>
        <VideoLightbox
          isOpen={open}
          onClose={() => setOpen(false)}
          imageUrl={item.image_url}
          title={title}
        />
      </>
    );
  }

  // YouTube Facade Card (Zero iframe cost until user clicks!)
  const thumbUrl =
    item.custom_thumb_url ||
    (item.youtube_id ? getYouTubeThumbUrl(item.youtube_id) : null);
  const videoAlt = title
    ? `${title}${roleTags ? ` (${roleTags})` : ''} — ${brandLabel}`
    : lang === 'ar'
      ? 'أعمال محمد جمال في التصوير والمونتاج'
      : 'Mohamed Gamal video production work';
  const ratioBadge = isVertical
    ? lang === 'ar'
      ? 'ريل 9:16'
      : '9:16 REEL'
    : lang === 'ar'
      ? 'فيديو 16:9'
      : '16:9 VIDEO';

  return (
    <>
      <article
        role={item.youtube_id ? 'button' : undefined}
        tabIndex={item.youtube_id ? 0 : undefined}
        aria-label={
          item.youtube_id
            ? `${title || brandLabel} — ${lang === 'ar' ? 'تشغيل الفيديو' : 'Play video'}`
            : undefined
        }
        onClick={() => item.youtube_id && setOpen(true)}
        onKeyDown={(e) => {
          if (item.youtube_id) {
            handleActivateKey(e, () => setOpen(true));
          }
        }}
        className={cn(
          'group glass-panel relative overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1.5 hover:border-tealAccent/70 hover:shadow-[0_14px_38px_-10px_rgba(32,216,189,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tealAccent',
          item.youtube_id && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden bg-black',
            isVertical ? 'aspect-[9/16]' : 'aspect-video'
          )}
        >
          {thumbUrl ? (
            isOptimizableImageUrl(thumbUrl) ? (
              <Image
                src={thumbUrl}
                alt={videoAlt}
                fill
                sizes={
                  isVertical
                    ? '(max-width: 1024px) 50vw, 25vw'
                    : '(max-width: 768px) 100vw, 50vw'
                }
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl}
                alt={videoAlt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-tealAccent">
              <Film className="h-10 w-10" />
            </div>
          )}

          {/* Cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 transition group-hover:via-black/15" />

          {/* Top badges */}
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span
              className={cn(
                'rounded-full border border-white/15 bg-black/55 px-2.5 py-0.5 text-[10px] font-bold text-slate-200 backdrop-blur-md',
                lang === 'en' && 'uppercase tracking-wider'
              )}
            >
              {ratioBadge}
            </span>
            {item.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amberAccent/40 bg-amberAccent/15 px-2 py-0.5 text-[10px] font-bold text-amberAccent backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                {lang === 'ar' ? 'مختار' : 'Featured'}
              </span>
            )}
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-tealAccent/50 bg-black/55 text-tealAccent backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-tealAccent group-hover:text-obsidian">
              <Play className="h-6 w-6 fill-current ms-0.5" />
            </div>
          </div>

          {/* Bottom title overlay on clean cards without separate info box if minimal */}
          {(title || roleTags) && (
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              {title && (
                <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow sm:text-sm">
                  {title}
                </h3>
              )}
              {roleTags && (
                <p className="mt-1 line-clamp-1 text-[11px] text-tealAccent/90 sm:text-xs">
                  {roleTags}
                </p>
              )}
            </div>
          )}
        </div>
      </article>

      <VideoLightbox
        isOpen={open}
        onClose={() => setOpen(false)}
        youtubeId={item.youtube_id}
        title={title}
        aspectRatio={item.aspect_ratio}
      />
    </>
  );
}
