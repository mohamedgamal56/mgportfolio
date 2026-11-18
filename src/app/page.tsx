import React from 'react';
import { HomeClient } from '@/components/home-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const bundle = await getPortfolioBundle();
  return <HomeClient bundle={bundle} />;
}
