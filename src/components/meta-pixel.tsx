'use client';

import { track as vercelTrack } from '@vercel/analytics';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import React, { useEffect, useRef } from 'react';

const RAW_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';
const META_PIXEL_ID = /^\d{8,24}$/.test(RAW_PIXEL_ID) ? RAW_PIXEL_ID : '';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: 'Lead' | 'Contact',
  params?: Record<string, string>
) {
  try {
    vercelTrack(eventName === 'Lead' ? 'booking_lead' : 'whatsapp_click', params);
  } catch {
    // Ignore client analytics errors
  }

  if (typeof window !== 'undefined' && typeof window.fbq === 'function' && META_PIXEL_ID) {
    window.fbq('track', eventName, params);
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName === 'Lead' ? 'generate_lead' : 'contact', params);
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const initialMount = useRef(true);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  if (!META_PIXEL_ID) {
    return null;
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
      }}
    />
  );
}
