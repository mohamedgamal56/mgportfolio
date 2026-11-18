import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { SectionViewClient } from '@/components/section-view-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}): Promise<Metadata> {
  const { sectionSlug } = await params;
  const bundle = await getPortfolioBundle();
  const section = bundle.sections.find((s) => s.id === sectionSlug);
  if (!section) return {};

  return {
    title: `${section.title_ar} — ${bundle.settings.brand_name_ar}`,
    description: section.description_ar,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}) {
  const { sectionSlug } = await params;
  const bundle = await getPortfolioBundle();
  const section = bundle.sections.find((s) => s.id === sectionSlug);

  if (!section) {
    notFound();
  }

  const folders = bundle.folders.filter((f) => f.section_id === section.id);
  const directMedia = bundle.mediaItems.filter(
    (m) => m.section_id === section.id && !m.folder_id
  );

  return (
    <SectionViewClient
      settings={bundle.settings}
      allSections={bundle.sections}
      section={section}
      folders={folders}
      directMedia={directMedia}
    />
  );
}
