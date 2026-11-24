import type { Metadata } from 'next';
import React from 'react';
import { NotFoundClient } from '@/components/not-found-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة — 404',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const bundle = await getPortfolioBundle();
  return <NotFoundClient settings={bundle.settings} sections={bundle.sections} />;
}
