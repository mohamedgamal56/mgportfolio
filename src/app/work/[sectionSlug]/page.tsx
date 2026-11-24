import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { SectionViewClient } from '@/components/section-view-client';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import { buildOgMetadata, pickCollectionOgImage } from '@/lib/seo';
import { getYouTubeThumbUrl } from '@/lib/utils';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}): Promise<Metadata> {
  const { sectionSlug } = await params;
  const bundle = await getPortfolioBundle();
  const section = bundle.sections.find((s) => s.id === sectionSlug);
  if (!section) return {};

  const title = `${section.title_ar} — أعمال ${bundle.settings.brand_name_ar}`;
  const description =
    section.description_ar ||
    `${section.title_ar} — ${bundle.settings.seo_description_ar}`;
  const siteName = `${bundle.settings.brand_name_ar} | ${bundle.settings.brand_name_en}`;

  return {
    title,
    description,
    ...buildOgMetadata({
      title,
      description,
      path: `/work/${section.id}`,
      imageUrl: pickCollectionOgImage(bundle, section.id),
      alt: `${section.title_ar} — ${bundle.settings.brand_name_en}`,
      siteName,
    }),
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

  const folderPreviews: Record<string, { thumbUrl: string | null; count: number }> = {};
  for (const folder of folders) {
    const folderItems = bundle.mediaItems.filter(
      (m) => m.section_id === section.id && m.folder_id === folder.id
    );
    const firstWithThumb = folderItems.find(
      (m) => m.custom_thumb_url || m.image_url || m.youtube_id
    );
    const thumbUrl =
      firstWithThumb?.custom_thumb_url ||
      firstWithThumb?.image_url ||
      (firstWithThumb?.youtube_id
        ? getYouTubeThumbUrl(firstWithThumb.youtube_id)
        : null);
    folderPreviews[folder.id] = {
      thumbUrl,
      count: folderItems.length,
    };
  }

  return (
    <SectionViewClient
      settings={bundle.settings}
      allSections={bundle.sections}
      section={section}
      folders={folders}
      directMedia={directMedia}
      folderPreviews={folderPreviews}
    />
  );
}
