import React from 'react';
import { HomeClient } from '@/components/home-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import { buildPortfolioJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const bundle = await getPortfolioBundle();
  const jsonLd = buildPortfolioJsonLd(bundle);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <HomeClient bundle={bundle} />
    </>
  );
}
