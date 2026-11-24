'use client';

import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import type { AspectRatio } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeId?: string | null;
  imageUrl?: string | null;
  title?: string;
  aspectRatio?: AspectRatio;
}

export function VideoLightbox({
  isOpen,
  onClose,
  youtubeId,
  imageUrl,
  title,
  aspectRatio = '9:16',
}: VideoLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Completely unmount iframe when closed so audio never persists in background
  if (!isOpen) return null;

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Media viewer'}
    >
      <div
        className={cn(
          'relative w-full rounded-2xl border border-tealAccent/30 bg-[#050d0b] p-3 sm:p-4 shadow-2xl',
          imageUrl
            ? 'max-w-4xl'
            : isVertical
              ? 'max-w-[400px]'
              : 'max-w-4xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <p className="truncate text-sm font-semibold text-slate-200">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-tealAccent hover:text-tealAccent"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {youtubeId ? (
          <div
            className={cn(
              'relative overflow-hidden rounded-xl bg-black',
              isVertical ? 'aspect-[9/16] mx-auto' : 'aspect-video w-full'
            )}
            style={
              isVertical ? { width: 'min(100%, calc(78vh * 9 / 16))' } : undefined
            }
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
              title={title || 'YouTube Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : imageUrl ? (
          <div className="overflow-hidden rounded-xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title || 'Preview'}
              className="max-h-[78vh] w-full object-contain mx-auto"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
