import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const v = url.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split('/').filter(Boolean);
      const markerIdx = parts.findIndex((p) => p === 'shorts' || p === 'embed' || p === 'live' || p === 'v');
      if (markerIdx !== -1 && parts[markerIdx + 1]) {
        const candidate = parts[markerIdx + 1];
        return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
      }
    }
  } catch {
    // Fallback regex for partial URLs
    const match = trimmed.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function isYouTubeShortsInput(input: string): boolean {
  return /\/shorts\//i.test(input);
}

export function getYouTubeThumbUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}
