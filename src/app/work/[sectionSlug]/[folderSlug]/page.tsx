import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { FolderViewClient } from '@/components/folder-view-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionSlug: string; folderSlug: string }>;
}): Promise<Metadata> {
  const { sectionSlug, folderSlug } = await params;
  const bundle = await getPortfolioBundle();
  const section = bundle.sections.find((s) => s.id === sectionSlug);
  const folder = bundle.folders.find(
    (f) => f.id === folderSlug && f.section_id === sectionSlug
  );
  if (!section || !folder) return {};

  return {
    title: `${folder.title_ar} | ${section.title_ar} — ${bundle.settings.brand_name_ar}`,
    description: folder.subtitle_ar || section.description_ar,
  };
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ sectionSlug: string; folderSlug: string }>;
}) {
  const { sectionSlug, folderSlug } = await params;
  const bundle = await getPortfolioBundle();
  const section = bundle.sections.find((s) => s.id === sectionSlug);
  const folder = bundle.folders.find(
    (f) => f.id === folderSlug && f.section_id === sectionSlug
  );

  if (!section || !folder) {
    notFound();
  }

  const items = bundle.mediaItems.filter(
    (m) => m.section_id === section.id && m.folder_id === folder.id
  );

  return (
    <FolderViewClient
      settings={bundle.settings}
      allSections={bundle.sections}
      section={section}
      folder={folder}
      items={items}
    />
  );
}
