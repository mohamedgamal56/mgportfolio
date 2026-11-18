'use client';

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Film,
  FolderKanban,
  Inbox,
  LayoutGrid,
  Loader2,
  LogOut,
  RefreshCw,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ContactLead, PortfolioDataBundle } from '@/types/portfolio';
import { AdminExtrasTab } from './admin-extras-tab';
import { syncSeedToSupabase } from './admin-helpers';
import { AdminLeadsTab } from './admin-leads-tab';
import { AdminMediaTab } from './admin-media-tab';
import { AdminSectionsTab } from './admin-sections-tab';
import { AdminSettingsTab } from './admin-settings-tab';

type AdminTab =
  | 'overview'
  | 'sections'
  | 'media'
  | 'settings'
  | 'extras'
  | 'leads';

export function AdminDashboard({
  initialBundle,
  initialLeads,
  supabaseConfigured,
  adminEmail,
  fullSetupSql = '',
}: {
  initialBundle: PortfolioDataBundle;
  initialLeads: ContactLead[];
  supabaseConfigured: boolean;
  adminEmail: string | null;
  fullSetupSql?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [bundle, setBundle] = useState<PortfolioDataBundle>(initialBundle);
  const [leads, setLeads] = useState<ContactLead[]>(initialLeads);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  const notify = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4500);
  };

  const handleSeedSync = async () => {
    setSyncing(true);
    try {
      await syncSeedToSupabase();
      notify('تم رفع ومزامنة جميع البيانات الأولية إلى Supabase بنجاح!');
      router.refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'فشلت المزامنة', true);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (!supabaseConfigured) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const tabs: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'overview', label: 'نظرة عامة والربط', icon: LayoutGrid },
    { id: 'sections', label: 'الأقسام والإخفاء/الإظهار', icon: FolderKanban },
    { id: 'media', label: 'الفيديوهات والصور', icon: Film },
    { id: 'settings', label: 'النصوص والهوية والصور', icon: Settings },
    { id: 'extras', label: 'آراء العملاء والخدمات والمعدات', icon: SlidersHorizontal },
    { id: 'leads', label: `طلبات الحجز (${leads.length})`, icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-[#030706] text-slate-100" dir="rtl">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#040908]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-tealAccent/40 bg-tealAccent/10 text-xs font-black text-tealAccent">
              MG
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white sm:text-base">
                لوحة تحكم البورتفوليو (CMS)
              </h1>
              <p className="text-[11px] text-slate-400">
                {supabaseConfigured
                  ? `متصل بـ Supabase${adminEmail ? ` · ${adminEmail}` : ''}`
                  : 'وضع المعاينة المحلي (بانتظار ربط Supabase)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-tealAccent/40 bg-tealAccent/10 px-4 py-1.5 text-xs font-bold text-tealAccent hover:bg-tealAccent hover:text-obsidian"
            >
              <span>معاينة الموقع</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {supabaseConfigured && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-red-400 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>خروج</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2.5 sm:px-6 lg:px-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-tealAccent text-obsidian'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-xl ${
            toast.isError
              ? 'border-red-500/40 bg-red-950/90 text-red-100'
              : 'border-tealAccent/50 bg-[#061a16]/95 text-tealAccent'
          }`}
        >
          {toast.isError ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!supabaseConfigured && (
          <div className="mb-6 rounded-2xl border border-amberAccent/40 bg-amberAccent/10 p-5 text-xs leading-relaxed text-amber-100">
            <div className="flex items-center gap-2 font-extrabold text-amberAccent text-sm mb-1.5">
              <AlertTriangle className="h-5 w-5" />
              <span>تنبيه: الموقع يعمل الآن ببيانات البداية المحلية (قبل ربط Supabase)</span>
            </div>
            لتمكين حفظ التعديلات بشكل دائم وتسجيل الدخول الآمن: أنشئ مشروعاً مجانياً على{' '}
            <strong>Supabase</strong>، نفّذ ملفي <code>supabase/schema.sql</code> و{' '}
            <code>supabase/seed.sql</code>، ثم أضف <code>NEXT_PUBLIC_SUPABASE_URL</code> و{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> في <code>.env.local</code> وفي إعدادات Vercel.
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-panel rounded-2xl p-5">
                <span className="text-xs text-slate-400">الأقسام الرئيسية</span>
                <p className="mt-1 text-3xl font-black text-white">{bundle.sections.length}</p>
                <span className="text-[11px] text-tealAccent">
                  {bundle.sections.filter((s) => s.is_visible).length} ظاهر للزوار
                </span>
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <span className="text-xs text-slate-400">المجلدات الفرعية</span>
                <p className="mt-1 text-3xl font-black text-white">{bundle.folders.length}</p>
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <span className="text-xs text-slate-400">الفيديوهات والصور</span>
                <p className="mt-1 text-3xl font-black text-white">{bundle.mediaItems.length}</p>
                <span className="text-[11px] text-amberAccent">
                  {bundle.mediaItems.filter((m) => m.is_featured).length} عمل مختار في الرئيسية
                </span>
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <span className="text-xs text-slate-400">طلبات الحجز</span>
                <p className="mt-1 text-3xl font-black text-white">{leads.length}</p>
                <span className="text-[11px] text-tealAccent">
                  {leads.filter((l) => l.status === 'new').length} طلب جديد
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                    <Database className="h-5 w-5 text-tealAccent" />
                    <span>مزامنة البيانات الأولية مع Supabase</span>
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    مصدر البيانات الحالي:{' '}
                    <strong className="text-tealAccent">
                      {bundle.source === 'supabase' ? 'قاعدة بيانات Supabase الحية' : 'ملف Seed المحلي'}
                    </strong>
                    . اضغط هذا الزر لرفع كل أعمالك الحالية الـ 32 فيديو والصور والنصوص إلى Supabase بضغطة واحدة.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!supabaseConfigured || syncing}
                  onClick={handleSeedSync}
                  className="inline-flex items-center gap-2 rounded-full bg-tealAccent px-5 py-2.5 text-xs font-extrabold text-obsidian transition hover:brightness-110 disabled:opacity-45"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>رفع ومزامنة البيانات لـ Supabase</span>
                </button>
              </div>

              {bundle.source === 'seed' && (
                <div className="rounded-xl border border-amberAccent/35 bg-amberAccent/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amberAccent">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>مطلوب تشغيل كود إنشاء الجداول (SQL) مرة واحدة فقط داخل Supabase</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    تم ربط حسابك وتخزين الصور بنجاح، لكن جداول قاعدة البيانات لم تُنشأ في PostgreSQL بعد.
                    اضغط زر النسخ أدناه، ثم افتح محرر SQL في Supabase والصقه واضغط <strong>Run</strong> مرة واحدة فقط ليتم حفظ التعديلات دائماً.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {fullSetupSql && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(fullSetupSql);
                          setCopiedSql(true);
                          notify('تم نسخ كود تهيئة الجداول والبيانات (SQL) بالكامل!');
                          setTimeout(() => setCopiedSql(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amberAccent px-4 py-2 text-xs font-extrabold text-obsidian hover:brightness-110"
                      >
                        {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>
                          {copiedSql
                            ? 'تم النسخ!'
                            : 'نسخ كود تهيئة الجداول والبيانات (SQL) لـ Supabase'}
                        </span>
                      </button>
                    )}
                    <a
                      href="https://supabase.com/dashboard/project/xfuczpeigrzcnddvimcu/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:border-tealAccent hover:text-tealAccent"
                    >
                      <span>فتح Supabase SQL Editor</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <AdminSectionsTab
            settings={bundle.settings}
            sections={bundle.sections}
            folders={bundle.folders}
            onSettingsChange={(settings) => setBundle({ ...bundle, settings })}
            onSectionsChange={(sections) => setBundle({ ...bundle, sections })}
            onFoldersChange={(folders) => setBundle({ ...bundle, folders })}
            onNotify={notify}
          />
        )}

        {activeTab === 'media' && (
          <AdminMediaTab
            sections={bundle.sections}
            folders={bundle.folders}
            mediaItems={bundle.mediaItems}
            onMediaChange={(mediaItems) => setBundle({ ...bundle, mediaItems })}
            onNotify={notify}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            settings={bundle.settings}
            onChange={(settings) => setBundle({ ...bundle, settings })}
            onNotify={notify}
          />
        )}

        {activeTab === 'extras' && (
          <AdminExtrasTab
            testimonials={bundle.testimonials}
            processSteps={bundle.processSteps}
            services={bundle.services}
            equipment={bundle.equipment}
            clientLogos={bundle.clientLogos}
            onTestimonialsChange={(testimonials) =>
              setBundle({ ...bundle, testimonials })
            }
            onProcessStepsChange={(processSteps) =>
              setBundle({ ...bundle, processSteps })
            }
            onServicesChange={(services) => setBundle({ ...bundle, services })}
            onEquipmentChange={(equipment) => setBundle({ ...bundle, equipment })}
            onLogosChange={(clientLogos) => setBundle({ ...bundle, clientLogos })}
            onNotify={notify}
          />
        )}

        {activeTab === 'leads' && (
          <AdminLeadsTab
            leads={leads}
            onLeadsChange={setLeads}
            onNotify={notify}
          />
        )}
      </main>
    </div>
  );
}
