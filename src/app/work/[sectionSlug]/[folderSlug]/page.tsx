import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { FolderViewClient } from '@/components/folder-view-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import { buildOgMetadata, pickCollectionOgImage } from '@/lib/seo';

export const revalidate = 300;

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

  const folderTitleAr =
    /^[A-Za-z0-9\s&.-]+$/.test(folder.title_ar) && folder.subtitle_ar
      ? folder.subtitle_ar
      : folder.title_ar;
  const title = `${folderTitleAr} | ${section.title_ar}`;
  const description = [folder.subtitle_ar, section.description_ar]
    .filter(Boolean)
    .join(' — ');
  const siteName = bundle.settings.brand_name_ar;

  return {
    title,
    description,
    ...buildOgMetadata({
      title: `${title} — ${bundle.settings.brand_name_ar}`,
      description,
      path: `/work/${section.id}/${folder.id}`,
      imageUrl: pickCollectionOgImage(bundle, section.id, folder.id),
      alt: `${folder.title_ar} — ${bundle.settings.brand_name_en}`,
      siteName,
    }),
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
