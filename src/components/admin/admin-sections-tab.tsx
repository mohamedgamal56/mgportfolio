'use client';

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FolderPlus,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { revalidatePortfolio } from '@/app/actions';
import { AVAILABLE_ICON_NAMES, PortfolioIcon } from '@/components/icon-mapper';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import type {
  PortfolioFolder,
  PortfolioSection,
  SectionVisibility,
  SiteSettings,
} from '@/types/portfolio';
import { slugifyId, swapSortOrder } from './admin-helpers';

const VISIBILITY_LABELS: Array<{
  key: keyof SectionVisibility;
  label: string;
  desc: string;
}> = [
  { key: 'explore_work', label: 'شبكة استكشف أعمالي (Hero Grid)', desc: 'بطاقات المجالات في الواجهة الأولى' },
  { key: 'featured_work', label: 'أعمال مختارة (Featured)', desc: 'أبرز الريلز والبودكاست في الرئيسية' },
  { key: 'results_showcase', label: 'قسم النتائج الموثقة', desc: 'صور إحصائيات فيسبوك وإنستجرام' },
  { key: 'how_we_work', label: 'قسم كيف نعمل (How We Work)', desc: 'خطوات العمل الـ 4 وشريك النجاح' },
  { key: 'testimonials', label: 'آراء العملاء', desc: 'اقتباسات وشهادات العملاء' },
  { key: 'booking_form', label: 'نموذج حجز المشاريع', desc: 'فورم استلام طلبات العملاء' },
  { key: 'services', label: 'الخدمات والباقات (قسم جديد)', desc: 'مخفي افتراضياً — فعّله عند تجهيز باقاتك' },
  { key: 'equipment', label: 'المعدات والبرامج (قسم جديد)', desc: 'مخفي افتراضياً — فعّله لعرض الكاميرات والبرامج' },
  { key: 'client_logos', label: 'شعارات العملاء (قسم جديد)', desc: 'مخفي افتراضياً — فعّله لعرض شعارات الشركاء' },
];

export function AdminSectionsTab({
  settings,
  sections,
  folders,
  onSettingsChange,
  onSectionsChange,
  onFoldersChange,
  onNotify,
}: {
  settings: SiteSettings;
  sections: PortfolioSection[];
  folders: PortfolioFolder[];
  onSettingsChange: (next: SiteSettings) => void;
  onSectionsChange: (next: PortfolioSection[]) => void;
  onFoldersChange: (next: PortfolioFolder[]) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  const [newSecTitleAr, setNewSecTitleAr] = useState('');
  const [newSecTitleEn, setNewSecTitleEn] = useState('');
  const [newSecShortAr, setNewSecShortAr] = useState('');
  const [newSecDescAr, setNewSecDescAr] = useState('');
  const [newSecIcon, setNewSecIcon] = useState('film');
  const [newSecAccent, setNewSecAccent] = useState<'teal' | 'violet' | 'amber'>('teal');

  const [newFolSection, setNewFolSection] = useState(sections[0]?.id || 'medical');
  const [newFolTitleAr, setNewFolTitleAr] = useState('');
  const [newFolTitleEn, setNewFolTitleEn] = useState('');
  const [newFolSubAr, setNewFolSubAr] = useState('');

  const toggleHomepageVisibility = async (key: keyof SectionVisibility) => {
    const nextVis = {
      ...settings.section_visibility,
      [key]: !settings.section_visibility[key],
    };
    const nextSettings = { ...settings, section_visibility: nextVis };
    onSettingsChange(nextSettings);

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('site_settings')
        .update({ section_visibility: nextVis })
        .eq('id', 'main');
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }
    onNotify('تم تحديث حالة ظهور القسم على الموقع بنجاح');
  };

  const handleToggleSectionVisible = async (sec: PortfolioSection) => {
    const updated = sections.map((s) =>
      s.id === sec.id ? { ...s, is_visible: !s.is_visible } : s
    );
    onSectionsChange(updated);

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('sections')
        .update({ is_visible: !sec.is_visible })
        .eq('id', sec.id);
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }
    onNotify(`تم ${sec.is_visible ? 'إخفاء' : 'إظهار'} قسم "${sec.title_ar}"`);
  };

  const handleMoveSection = async (idx: number, dir: 'up' | 'down') => {
    const reordered = (await swapSortOrder(
      'sections',
      sections,
      idx,
      dir
    )) as PortfolioSection[];
    onSectionsChange(reordered);
    onNotify('تم إعادة ترتيب الأقسام');
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecTitleAr.trim()) return;

    const item: PortfolioSection = {
      id: slugifyId(newSecTitleEn || newSecTitleAr, 'sec'),
      title_ar: newSecTitleAr.trim(),
      title_en: (newSecTitleEn || newSecTitleAr).trim(),
      short_ar: newSecShortAr.trim() || newSecTitleAr.trim(),
      short_en: newSecShortAr.trim() || (newSecTitleEn || newSecTitleAr).trim(),
      description_ar: newSecDescAr.trim() || newSecTitleAr.trim(),
      description_en: newSecDescAr.trim() || (newSecTitleEn || newSecTitleAr).trim(),
      icon_name: newSecIcon,
      accent_color: newSecAccent,
      sort_order: sections.length + 1,
      is_visible: true,
      show_in_nav: true,
    };

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('sections').insert(item);
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }

    onSectionsChange([...sections, item]);
    setNewSecTitleAr('');
    setNewSecTitleEn('');
    setNewSecShortAr('');
    setNewSecDescAr('');
    onNotify('تمت إضافة القسم الجديد بنجاح');
  };

  const handleDeleteSection = async (sec: PortfolioSection) => {
    if (!window.confirm(`هل أنت متأكد من حذف قسم "${sec.title_ar}" بكل ما بداخله؟`)) return;
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('sections').delete().eq('id', sec.id);
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }
    onSectionsChange(sections.filter((s) => s.id !== sec.id));
    onFoldersChange(folders.filter((f) => f.section_id !== sec.id));
    onNotify('تم حذف القسم');
  };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolTitleAr.trim() || !newFolSection) return;
    const item: PortfolioFolder = {
      id: slugifyId(newFolTitleEn || newFolTitleAr, 'folder'),
      section_id: newFolSection,
      title_ar: newFolTitleAr.trim(),
      title_en: (newFolTitleEn || newFolTitleAr).trim(),
      subtitle_ar: newFolSubAr.trim(),
      subtitle_en: newFolSubAr.trim(),
      icon_name: 'folder',
      note_ar: null,
      note_en: null,
      sort_order: folders.filter((f) => f.section_id === newFolSection).length + 1,
      is_visible: true,
    };

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('folders').insert(item);
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }
    onFoldersChange([...folders, item]);
    setNewFolTitleAr('');
    setNewFolTitleEn('');
    setNewFolSubAr('');
    onNotify('تمت إضافة المجلد الجديد');
  };

  const handleToggleFolderVisible = async (folder: PortfolioFolder) => {
    const updated = folders.map((f) =>
      f.id === folder.id ? { ...f, is_visible: !f.is_visible } : f
    );
    onFoldersChange(updated);

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from('folders')
        .update({ is_visible: !folder.is_visible })
        .eq('id', folder.id);
      await revalidatePortfolio();
    }
    onNotify(`تم ${folder.is_visible ? 'إخفاء' : 'إظهار'} مجلد "${folder.title_ar}"`);
  };

  const handleDeleteFolder = async (folder: PortfolioFolder) => {
    if (!window.confirm(`حذف مجلد "${folder.title_ar}"؟`)) return;
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('folders').delete().eq('id', folder.id);
      await revalidatePortfolio();
    }
    onFoldersChange(folders.filter((f) => f.id !== folder.id));
    onNotify('تم حذف المجلد');
  };

  return (
    <div className="space-y-8">
      {/* 1. Homepage Visibility Switches */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-extrabold text-white">
          إظهار وإخفاء أقسام الصفحة الرئيسية بضغطة زر
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          الأقسام الجديدة (الخدمات، المعدات، شعارات العملاء) مخفية افتراضياً ويمكنك تفعيلها هنا فور تجهيز بياناتها.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VISIBILITY_LABELS.map((item) => {
            const active = settings.section_visibility[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleHomepageVisibility(item.key)}
                className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-start transition ${
                  active
                    ? 'border-tealAccent/50 bg-tealAccent/10'
                    : 'border-white/10 bg-black/30 opacity-75'
                }`}
              >
                <div>
                  <span className="block text-xs font-bold text-white">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">{item.desc}</span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                    active ? 'bg-tealAccent text-obsidian' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {active ? 'ظاهر' : 'مخفي'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Work Categories (Sections) */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-extrabold text-white">تصنيفات الأعمال الرئيسية (Sections)</h3>

        <div className="space-y-2.5">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/35 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tealAccent/10 text-tealAccent">
                  <PortfolioIcon name={sec.icon_name} className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{sec.title_ar}</span>
                    <span className="text-xs text-slate-400">({sec.title_en})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">/{`work/${sec.id}`}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSection(idx, 'up')}
                  className="rounded-lg border border-white/10 p-2 text-slate-300 hover:border-tealAccent disabled:opacity-30"
                  title="أعلى"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMoveSection(idx, 'down')}
                  className="rounded-lg border border-white/10 p-2 text-slate-300 hover:border-tealAccent disabled:opacity-30"
                  title="أسفل"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSectionVisible(sec)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                    sec.is_visible
                      ? 'border-tealAccent/40 bg-tealAccent/10 text-tealAccent'
                      : 'border-white/15 bg-white/5 text-slate-400'
                  }`}
                >
                  {sec.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{sec.is_visible ? 'ظاهر' : 'مخفي'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sec)}
                  className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/15"
                  title="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSection} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-bold text-tealAccent">+ إضافة قسم أعمال جديد</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              required
              placeholder="اسم القسم (عربي) *"
              value={newSecTitleAr}
              onChange={(e) => setNewSecTitleAr(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Section Title (EN)"
              dir="ltr"
              value={newSecTitleEn}
              onChange={(e) => setNewSecTitleEn(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <select
              value={newSecIcon}
              onChange={(e) => setNewSecIcon(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              {AVAILABLE_ICON_NAMES.map((ic) => (
                <option key={ic} value={ic}>
                  أيقونة: {ic}
                </option>
              ))}
            </select>
            <select
              value={newSecAccent}
              onChange={(e) => setNewSecAccent(e.target.value as 'teal' | 'violet' | 'amber')}
              className="rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              <option value="teal">لون التوهج: Teal</option>
              <option value="violet">لون التوهج: Violet</option>
              <option value="amber">لون التوهج: Amber</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="وصف مختصر على البطاقة"
              value={newSecShortAr}
              onChange={(e) => setNewSecShortAr(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="الوصف الكامل داخل صفحة القسم"
              value={newSecDescAr}
              onChange={(e) => setNewSecDescAr(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة القسم</span>
          </button>
        </form>
      </div>

      {/* 3. Subfolders */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-extrabold text-white">المجلدات الفرعية داخل الأقسام (Folders)</h3>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {folders.map((folder) => {
            const parentSec = sections.find((s) => s.id === folder.section_id);
            return (
              <div
                key={folder.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/35 p-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-tealAccent">
                    {parentSec?.title_ar || folder.section_id}
                  </span>
                  <p className="text-sm font-bold text-white">{folder.title_ar}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleFolderVisible(folder)}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${
                      folder.is_visible
                        ? 'border-tealAccent/40 text-tealAccent'
                        : 'border-white/15 text-slate-400'
                    }`}
                  >
                    {folder.is_visible ? 'ظاهر' : 'مخفي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder)}
                    className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddFolder} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-bold text-tealAccent">+ إضافة مجلد فرعي</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              value={newFolSection}
              onChange={(e) => setNewFolSection(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  القسم: {s.title_ar}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="اسم المجلد (عربي) *"
              value={newFolTitleAr}
              onChange={(e) => setNewFolTitleAr(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Folder Title (EN)"
              dir="ltr"
              value={newFolTitleEn}
              onChange={(e) => setNewFolTitleEn(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="وصف فرعي"
              value={newFolSubAr}
              onChange={(e) => setNewFolSubAr(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>إضافة المجلد</span>
          </button>
        </form>
      </div>
    </div>
  );
}
