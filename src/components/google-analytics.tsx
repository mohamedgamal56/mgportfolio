'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import React, { useEffect, useRef } from 'react';

const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{6,20}$/i.test(RAW_GA_ID) ? RAW_GA_ID : '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const initialMount = useRef(true);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: pathname });
    }
  }, [pathname]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
        }}
      />
    </>
  );
}
