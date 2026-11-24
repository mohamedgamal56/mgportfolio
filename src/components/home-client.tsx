'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  ExternalLink,
  Instagram,
  MessageCircle,
  Play,
  Quote,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import type { PortfolioDataBundle } from '@/types/portfolio';
import { cn, isOptimizableImageUrl } from '@/lib/utils';
import { BookingForm } from './booking-form';
import { PortfolioIcon } from './icon-mapper';
import { useLanguage } from './language-provider';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { MediaCard } from './video-card';
import { VideoLightbox } from './video-modal';

export function HomeClient({ bundle }: { bundle: PortfolioDataBundle }) {
  const { lang, t } = useLanguage();
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<string | undefined>(
    undefined
  );

  const {
    settings,
    sections,
    mediaItems,
    processSteps,
    testimonials,
    services,
    equipment,
    clientLogos,
  } = bundle;

  useEffect(() => {
    document.title =
      lang === 'ar'
        ? `${settings.brand_name_ar} — مخرج ومصور ومونتير وصانع ريلز | ${settings.brand_name_en}`
        : `${settings.brand_name_en} — Commercial Filmmaker, Video Editor & Reel Creator`;
  }, [lang, settings.brand_name_ar, settings.brand_name_en]);

  const vis = settings.section_visibility;
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const heroBgSrc = settings.hero_bg_image_url || '/images/hero-portrait.webp';

  const heroEyebrow =
    lang === 'ar' && settings.hero_eyebrow === 'COMMERCIAL FILMMAKER · REEL CREATOR'
      ? 'مخرج إعلانات · صانع ريلز'
      : settings.hero_eyebrow;
  const hwwEyebrow =
    lang === 'ar' && settings.hww_eyebrow === 'HOW WE WORK'
      ? 'كيف نعمل'
      : settings.hww_eyebrow;
  const ctaEyebrow =
    lang === 'ar' && settings.cta_eyebrow === "LET'S CREATE"
      ? 'لنبدأ مشروعك'
      : settings.cta_eyebrow;

  const mapServiceToProjectType = (serviceId: string): string => {
    if (serviceId === 'srv-podcast') return 'Podcast Production';
    if (serviceId === 'srv-commercial') return 'Commercial Ad';
    return 'Reels Package';
  };

  const featuredVideos = mediaItems.filter(
    (m) => m.is_featured && m.media_type === 'youtube' && m.is_visible
  );
  const resultImages = mediaItems.filter(
    (m) => m.section_id === 'results' && m.media_type === 'image' && m.is_visible
  );

  const accentBorderClass = (accent: 'teal' | 'violet' | 'amber') => {
    if (accent === 'violet') return 'glass-card-violet';
    if (accent === 'amber') return 'glass-card-amber';
    return 'glass-card-teal';
  };

  const accentTextClass = (accent: 'teal' | 'violet' | 'amber') => {
    if (accent === 'violet') return 'text-violetAccent';
    if (accent === 'amber') return 'text-amberAccent';
    return 'text-tealAccent';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader settings={settings} sections={sections} />

      <main className="flex-1">
        {/* ================= HERO SECTION (Cinematic Merged Identity) ================= */}
        <section className="relative overflow-hidden border-b border-white/10">
          {/* Optimized WebP Portrait Background */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {isOptimizableImageUrl(heroBgSrc) ? (
              <Image
                src={heroBgSrc}
                alt={t(settings.hero_title_ar, settings.hero_title_en)}
                fill
                priority
                sizes="100vw"
                className="object-cover object-[center_20%] opacity-45 sm:opacity-55"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroBgSrc}
                alt={t(settings.hero_title_ar, settings.hero_title_en)}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover object-[center_20%] opacity-45 sm:opacity-55"
              />
            )}
            <div
              className={cn(
                'absolute inset-0',
                lang === 'ar'
                  ? 'bg-gradient-to-l from-[#030807]/95 via-[#040908]/75 to-[#040908]/90'
                  : 'bg-gradient-to-r from-[#030807]/95 via-[#040908]/75 to-[#040908]/90'
              )}
            />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#040908] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              {/* Left/Start: Hero Identity + CTAs */}
              <div className="lg:col-span-6">
                <div
                  className={cn(
                    'inline-flex max-w-full items-center gap-2 rounded-full border border-tealAccent/30 bg-tealAccent/10 px-3 py-1 text-[10px] font-bold text-tealAccent backdrop-blur-md sm:px-3.5 sm:text-[11px]',
                    !/[\u0600-\u06FF]/.test(heroEyebrow) &&
                      'uppercase tracking-[0.12em] sm:tracking-[0.22em]'
                  )}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tealAccent animate-pulse" />
                  <span>{heroEyebrow}</span>
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.08] text-white sm:text-6xl lg:text-7xl">
                  {t(settings.hero_title_ar, settings.hero_title_en)}
                </h1>

                <p className="mt-3 text-xl font-extrabold text-tealAccent/95 sm:text-2xl lg:text-3xl">
                  {t(settings.hero_role_ar, settings.hero_role_en)}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t(settings.hero_desc_ar, settings.hero_desc_en)}
                </p>

                {/* Primary Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {settings.showreel_youtube_id && (
                    <button
                      type="button"
                      onClick={() => setShowreelOpen(true)}
                      className="inline-flex items-center gap-2.5 rounded-full bg-tealAccent px-6 py-3.5 text-sm font-extrabold text-obsidian shadow-[0_0_28px_rgba(32,216,189,0.35)] transition hover:scale-[1.02] hover:brightness-110"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>
                        {lang === 'ar' ? 'شاهد الـ Showreel' : 'Watch Showreel'}
                      </span>
                    </button>
                  )}

                  <a
                    href="#booking"
                    className="inline-flex items-center gap-2 rounded-full border border-amberAccent/50 bg-amberAccent/15 px-5 py-3.5 text-sm font-bold text-amberAccent backdrop-blur-md transition hover:bg-amberAccent hover:text-obsidian"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'احجز مشروعك' : 'Book a Project'}</span>
                  </a>
                </div>
              </div>

              {/* Right/End: Interactive Explore My Work Grid */}
              {vis.explore_work && sections.length > 0 && (
                <div className="lg:col-span-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                      {lang === 'ar' ? 'استكشف أعمالي' : 'Explore My Work'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                      {lang === 'ar'
                        ? 'اختار المجال اللي يهمك واستكشف مجموعة من الأعمال والمشاريع اللي اشتغلت عليها.'
                        : 'Pick the field you’re interested in and explore projects tailored to your industry.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sections.map((sec) => (
                      <Link
                        key={sec.id}
                        href={`/work/${sec.id}`}
                        className={cn(
                          'group glass-panel relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition duration-300 hover:-translate-y-1',
                          accentBorderClass(sec.accent_color)
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10',
                              accentTextClass(sec.accent_color)
                            )}
                          >
                            <PortfolioIcon name={sec.icon_name} className="h-5 w-5" />
                          </div>
                          <ArrowIcon
                            className={cn(
                              'h-4 w-4 opacity-60 transition group-hover:opacity-100',
                              accentTextClass(sec.accent_color)
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <h3 className="text-base font-extrabold text-white">
                            {t(sec.title_ar, sec.title_en)}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                            {t(sec.short_ar, sec.short_en)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= FEATURED REELS & PODCASTS ================= */}
        {vis.featured_work && featuredVideos.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span
                  className={cn(
                    'text-[11px] font-bold text-tealAccent',
                    lang === 'en' && 'uppercase tracking-[0.22em]'
                  )}
                >
                  {lang === 'ar' ? 'أعمال مختارة' : 'SELECTED REELS & FILMS'}
                </span>
                <h2 className="mt-1.5 text-2xl font-extrabold text-white sm:text-4xl">
                  {lang === 'ar' ? 'مختارات سريعة من أعمالي' : 'Featured Highlights'}
                </h2>
              </div>
              <Link
                href="/work/social"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-tealAccent hover:underline"
              >
                <span>{lang === 'ar' ? 'عرض جميع الـ Reels' : 'Explore all Reels'}</span>
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Separate 16:9 Featured from 9:16 Featured cleanly */}
            {featuredVideos.some((v) => v.aspect_ratio === '9:16') && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {featuredVideos
                  .filter((v) => v.aspect_ratio === '9:16')
                  .slice(0, 4)
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
            )}

            {featuredVideos.some((v) => v.aspect_ratio === '16:9') && (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {featuredVideos
                  .filter((v) => v.aspect_ratio === '16:9')
                  .slice(0, 2)
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
            )}
          </section>
        )}

        {/* ================= CLIENT LOGOS (Hidden by Default, Admin Toggleable) ================= */}
        {vis.client_logos && clientLogos.length > 0 && (
          <section className="border-y border-white/10 bg-white/[0.015] py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p
                className={cn(
                  'mb-6 text-center text-xs font-bold text-slate-400',
                  lang === 'en' && 'uppercase tracking-[0.22em]'
                )}
              >
                {lang === 'ar' ? 'شركاء وعملاء تشرفت بالعمل معهم' : 'TRUSTED BY BRANDS & DOCTORS'}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {clientLogos.map((logo) => (
                  <div
                    key={logo.id}
                    className="glass-panel flex items-center justify-center rounded-xl px-4 py-4 text-center"
                  >
                    {logo.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.logo_url}
                        alt={t(logo.name_ar, logo.name_en)}
                        className="max-h-10 w-auto object-contain opacity-85"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-200">
                        {t(logo.name_ar, logo.name_en)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= PARTNER RESULTS SHOWCASE ================= */}
        {vis.results_showcase && resultImages.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="glass-panel rounded-3xl p-6 sm:p-10">
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <span
                    className={cn(
                      'text-[11px] font-bold text-amberAccent',
                      lang === 'en' && 'uppercase tracking-[0.22em]'
                    )}
                  >
                    {lang === 'ar' ? 'نتائج موثقة' : 'REAL RESULTS'}
                  </span>
                  <h2 className="mt-1.5 text-2xl font-extrabold text-white sm:text-3xl">
                    {lang === 'ar'
                      ? 'نتائج حقيقية حققناها مع شركائنا'
                      : 'Proven Impact With Partners'}
                  </h2>
                </div>
                <Link
                  href="/work/results"
                  className="inline-flex items-center gap-2 rounded-full border border-amberAccent/40 bg-amberAccent/10 px-4 py-2 text-xs font-bold text-amberAccent transition hover:bg-amberAccent hover:text-obsidian"
                >
                  <span>{lang === 'ar' ? 'مشاهدة الأعمال والحملات' : 'View Partner Campaigns'}</span>
                  <ArrowIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {resultImages.map((imgItem) => (
                  <MediaCard key={imgItem.id} item={imgItem} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= SERVICES & PACKAGES (Hidden by Default, Admin Toggleable) ================= */}
        {vis.services && services.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span
                className={cn(
                  'text-[11px] font-bold text-tealAccent',
                  lang === 'en' && 'uppercase tracking-[0.22em]'
                )}
              >
                {lang === 'ar' ? 'الخدمات والباقات' : 'SERVICES & PACKAGES'}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">
                {lang === 'ar'
                  ? 'حلول إنتاج متكاملة لصناع المحتوى والبراندات'
                  : 'Tailored Production Packages'}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="glass-panel flex flex-col justify-between rounded-2xl p-6 transition hover:-translate-y-1 hover:border-tealAccent/50"
                >
                  <div>
                    {(srv.badge_ar || srv.badge_en) && (
                      <span className="inline-block rounded-full border border-tealAccent/35 bg-tealAccent/10 px-3 py-0.5 text-[11px] font-bold text-tealAccent">
                        {t(srv.badge_ar, srv.badge_en)}
                      </span>
                    )}
                    <h3 className="mt-3 text-xl font-extrabold text-white">
                      {t(srv.title_ar, srv.title_en)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {t(srv.desc_ar, srv.desc_en)}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {(lang === 'ar' ? srv.features_ar : srv.features_en).map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-200"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-tealAccent" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#booking"
                    onClick={() =>
                      setSelectedProjectType(mapServiceToProjectType(srv.id))
                    }
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:border-tealAccent hover:text-tealAccent"
                  >
                    <span>{lang === 'ar' ? 'اطلب هذه الباقة' : 'Request This Package'}</span>
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= EQUIPMENT & GEAR (Hidden by Default, Admin Toggleable) ================= */}
        {vis.equipment && equipment.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span
                className={cn(
                  'text-[11px] font-bold text-violetAccent',
                  lang === 'en' && 'uppercase tracking-[0.22em]'
                )}
              >
                {lang === 'ar' ? 'المعدات والبرامج' : 'GEAR & WORKFLOW'}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                {lang === 'ar' ? 'أدوات الإنتاج التي أعمل بها' : 'Production Gear & Software'}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {equipment.map((eq) => (
                <div key={eq.id} className="glass-panel rounded-2xl p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violetAccent/15 text-violetAccent">
                    <PortfolioIcon name={eq.icon_name} className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-bold text-violetAccent">
                    {t(eq.category_ar, eq.category_en)}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-white">{eq.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {t(eq.specs_ar, eq.specs_en)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= HOW WE WORK ================= */}
        {vis.how_we_work && processSteps.length > 0 && (
          <section id="process" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="glass-panel flex flex-col justify-center rounded-3xl bg-gradient-to-br from-tealAccent/10 via-transparent to-violetAccent/10 p-7 sm:p-10 lg:col-span-5">
                <span
                  className={cn(
                    'text-[11px] font-bold text-tealAccent',
                    !/[\u0600-\u06FF]/.test(hwwEyebrow) && 'uppercase tracking-[0.22em]'
                  )}
                >
                  {hwwEyebrow}
                </span>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  {t(settings.hww_title_ar, settings.hww_title_en)}
                </h2>
                <p className="mt-4 text-sm leading-loose text-slate-300 sm:text-base">
                  {t(settings.hww_desc_ar, settings.hww_desc_en)}
                </p>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:col-span-7">
                {processSteps.map((step) => (
                  <div
                    key={step.id}
                    className="glass-panel rounded-2xl p-5 transition hover:border-tealAccent/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-white">
                        {t(step.title_ar, step.title_en)}
                      </h3>
                      <span className="font-latin text-sm font-black text-tealAccent">
                        {step.step_number}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {t(step.desc_ar, step.desc_en)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= TESTIMONIALS ================= */}
        {vis.testimonials && testimonials.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span
                className={cn(
                  'text-[11px] font-bold text-tealAccent',
                  lang === 'en' && 'uppercase tracking-[0.22em]'
                )}
              >
                {lang === 'ar' ? 'شهادات موثقة' : 'CLIENTS'}
              </span>
              <h2 className="mt-1.5 text-2xl font-extrabold text-white sm:text-4xl">
                {lang === 'ar' ? 'آراء العملاء' : 'Client Feedback'}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {testimonials.map((item) => (
                <blockquote
                  key={item.id}
                  className="glass-panel flex flex-col justify-between rounded-2xl p-6 sm:p-7"
                >
                  <div>
                    <Quote className="mb-3 h-7 w-7 text-tealAccent/40" />
                    <p className="text-base leading-relaxed text-slate-100 sm:text-lg">
                      {t(item.quote_ar, item.quote_en)}
                    </p>
                  </div>

                  <footer className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                    <div>
                      <span className="block font-bold text-white">
                        {t(item.client_name_ar, item.client_name_en)}
                      </span>
                      {(item.client_role_ar || item.client_role_en) && (
                        <span className="text-slate-400">
                          {t(item.client_role_ar, item.client_role_en)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full border border-tealAccent/25 bg-tealAccent/10 px-2.5 py-0.5 text-[11px] font-semibold text-tealAccent">
                      {item.source_label}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* ================= BOOKING FORM & SOCIAL CTA ================= */}
        <section id="booking" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="glass-panel rounded-3xl bg-[radial-gradient(circle_at_top,rgba(32,216,189,0.14),transparent_60%)] p-7 sm:p-10 lg:col-span-5">
              <span
                className={cn(
                  'text-[11px] font-bold text-tealAccent',
                  !/[\u0600-\u06FF]/.test(ctaEyebrow) && 'uppercase tracking-[0.22em]'
                )}
              >
                {ctaEyebrow}
              </span>
              <h2 className="mt-2 text-2xl font-black leading-snug text-white sm:text-4xl">
                {t(settings.cta_title_ar, settings.cta_title_en)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {lang === 'ar'
                  ? 'تقدر تملى نموذج الحجز السريع أو تتواصل معي مباشرة على الواتساب أو منصات التواصل.'
                  : 'Fill out the quick brief or reach out directly via WhatsApp, Instagram, or Facebook.'}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={settings.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-tealAccent/40 bg-tealAccent/10 px-5 py-3.5 text-sm font-bold text-tealAccent transition hover:bg-tealAccent hover:text-obsidian"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageCircle className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-violetAccent/40 bg-violetAccent/10 px-5 py-3.5 text-sm font-bold text-violetAccent transition hover:bg-violetAccent hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <Instagram className="h-5 w-5" />
                    <span>Instagram</span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-amberAccent/40 bg-amberAccent/10 px-5 py-3.5 text-sm font-bold text-amberAccent transition hover:bg-amberAccent hover:text-obsidian"
                >
                  <span className="flex items-center gap-2.5">
                    <Share2 className="h-5 w-5" />
                    <span>Facebook</span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {vis.booking_form && (
              <div className="lg:col-span-7">
                <BookingForm
                  settings={settings}
                  selectedProjectType={selectedProjectType}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} />

      <VideoLightbox
        isOpen={showreelOpen}
        onClose={() => setShowreelOpen(false)}
        youtubeId={settings.showreel_youtube_id}
        title={lang === 'ar' ? 'Showreel — محمد جمال' : 'Showreel — Mohamed Gamal'}
        aspectRatio="9:16"
      />
    </div>
  );
}
