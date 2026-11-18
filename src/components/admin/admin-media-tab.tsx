'use client';

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { revalidatePortfolio } from '@/app/actions';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import {
  extractYouTubeId,
  getYouTubeThumbUrl,
  isYouTubeShortsInput,
} from '@/lib/utils';
import type {
  AspectRatio,
  MediaItem,
  MediaType,
  PortfolioFolder,
  PortfolioSection,
} from '@/types/portfolio';
import { slugifyId, swapSortOrder, uploadPortfolioFile } from './admin-helpers';

export function AdminMediaTab({
  sections,
  folders,
  mediaItems,
  onMediaChange,
  onNotify,
}: {
  sections: PortfolioSection[];
  folders: PortfolioFolder[];
  mediaItems: MediaItem[];
  onMediaChange: (next: MediaItem[]) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  const [filterSection, setFilterSection] = useState<string>('all');

  // Add / Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState(sections[0]?.id || 'social');
  const [folderId, setFolderId] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>('youtube');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customThumbUrl, setCustomThumbUrl] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [groupLabelAr, setGroupLabelAr] = useState('');
  const [roleTagsAr, setRoleTagsAr] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sectionFolders = useMemo(
    () => folders.filter((f) => f.section_id === sectionId),
    [folders, sectionId]
  );

  const filteredItems = useMemo(
    () =>
      filterSection === 'all'
        ? mediaItems
        : mediaItems.filter((m) => m.section_id === filterSection),
    [mediaItems, filterSection]
  );

  const handleYoutubeInputChange = (val: string) => {
    setYoutubeInput(val);
    if (!editingId && isYouTubeShortsInput(val)) {
      setAspectRatio('9:16');
    } else if (!editingId && val.includes('watch?v=')) {
      setAspectRatio('16:9');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setYoutubeInput('');
    setImageUrl('');
    setCustomThumbUrl('');
    setTitleAr('');
    setTitleEn('');
    setGroupLabelAr('');
    setRoleTagsAr('');
    setIsFeatured(false);
  };

  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setSectionId(item.section_id);
    setFolderId(item.folder_id || '');
    setMediaType(item.media_type);
    setAspectRatio(item.aspect_ratio);
    setYoutubeInput(item.youtube_id || '');
    setImageUrl(item.image_url || '');
    setCustomThumbUrl(item.custom_thumb_url || '');
    setTitleAr(item.title_ar || '');
    setTitleEn(item.title_en || '');
    setGroupLabelAr(item.group_label_ar || '');
    setRoleTagsAr(item.role_tags_ar || '');
    setIsFeatured(item.is_featured);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadThumbOrImage = async (
    target: 'thumb' | 'image',
    file: File | undefined
  ) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPortfolioFile(file, target === 'thumb' ? 'thumbs' : 'results');
      if (target === 'thumb') setCustomThumbUrl(url);
      else setImageUrl(url);
      onNotify('تم رفع الصورة بنجاح');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'فشل رفع الصورة', true);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedYtId = mediaType === 'youtube' ? extractYouTubeId(youtubeInput) : null;
      if (mediaType === 'youtube' && !parsedYtId) {
        onNotify('رابط أو ID اليوتيوب غير صحيح — تأكد من لصق رابط فيديو يوتيوب صحيح.', true);
        setSaving(false);
        return;
      }

      const existing = editingId ? mediaItems.find((m) => m.id === editingId) : null;
      const item: MediaItem = {
        id: editingId || slugifyId(titleEn || titleAr || parsedYtId || 'media', 'vid'),
        section_id: sectionId,
        folder_id: folderId || null,
        media_type: mediaType,
        aspect_ratio: aspectRatio,
        youtube_id: parsedYtId,
        image_url: mediaType === 'image' ? imageUrl.trim() || null : null,
        custom_thumb_url: customThumbUrl.trim() || null,
        title_ar: titleAr.trim() || null,
        title_en: (titleEn || titleAr).trim() || null,
        group_label_ar: groupLabelAr.trim() || null,
        group_label_en: groupLabelAr.trim() || null,
        role_tags_ar: roleTagsAr.trim() || null,
        role_tags_en: roleTagsAr.trim() || null,
        is_featured: isFeatured,
        sort_order: existing ? existing.sort_order : mediaItems.length + 1,
        is_visible: existing ? existing.is_visible : true,
      };

      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase
          .from('media_items')
          .upsert(item, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        await revalidatePortfolio();
      }

      const nextList = editingId
        ? mediaItems.map((m) => (m.id === editingId ? item : m))
        : [item, ...mediaItems];
      onMediaChange(nextList);
      resetForm();
      onNotify(editingId ? 'تم تحديث العمل بنجاح' : 'تمت إضافة العمل الجديد للموقع بنجاح!');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذر الحفظ', true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProp = async (
    item: MediaItem,
    prop: 'is_visible' | 'is_featured'
  ) => {
    const nextVal = !item[prop];
    onMediaChange(
      mediaItems.map((m) => (m.id === item.id ? { ...m, [prop]: nextVal } : m))
    );
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('media_items').update({ [prop]: nextVal }).eq('id', item.id);
      await revalidatePortfolio();
    }
    onNotify('تم التحديث');
  };

  const handleMove = async (item: MediaItem, dir: 'up' | 'down') => {
    const idx = mediaItems.findIndex((m) => m.id === item.id);
    const reordered = (await swapSortOrder(
      'media_items',
      mediaItems,
      idx,
      dir
    )) as MediaItem[];
    onMediaChange(reordered);
    onNotify('تم تعديل الترتيب');
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`حذف "${item.title_ar || item.youtube_id}"؟`)) return;
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('media_items').delete().eq('id', item.id);
      await revalidatePortfolio();
    }
    onMediaChange(mediaItems.filter((m) => m.id !== item.id));
    onNotify('تم حذف العنصر');
  };

  const previewYt = extractYouTubeId(youtubeInput);

  return (
    <div className="space-y-8">
      {/* Add / Edit Form */}
      <form onSubmit={handleSaveItem} className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white">
            {editingId ? 'تعديل العمل المحدد' : '+ إضافة فيديو أو صورة جديدة'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">القسم الرئيسي</label>
            <select
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value);
                setFolderId('');
              }}
              className="w-full rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">المجلد الفرعي (اختياري)</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              <option value="">بدون مجلد (مباشر في القسم)</option>
              {sectionFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">النوع</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              className="w-full rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              <option value="youtube">فيديو يوتيوب (Reel / Full)</option>
              <option value="image">صورة / نتيجة إحصائيات</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">مقاس العرض</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
            >
              <option value="9:16">طولي 9:16 (Reels / Shorts)</option>
              <option value="16:9">عريض 16:9 (Podcast / Commercial)</option>
              <option value="16:10">16:10 (صور وإحصائيات)</option>
            </select>
          </div>
        </div>

        {mediaType === 'youtube' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                رابط فيديو اليوتيوب (Watch / Shorts / ID) *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={youtubeInput}
                onChange={(e) => handleYoutubeInputChange(e.target.value)}
                placeholder="https://youtube.com/shorts/... أو ID"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              {previewYt && (
                <p className="mt-1 text-[11px] text-tealAccent">
                  تم استخراج ID تلقائياً: <code>{previewYt}</code>
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">
                صورة غلاف مخصصة Thumbnail (اختياري — يُستخدم غلاف يوتيوب افتراضياً)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={customThumbUrl}
                  onChange={(e) => setCustomThumbUrl(e.target.value)}
                  placeholder="رابط الصورة أو ارفعها"
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
                />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3 py-2 text-xs font-bold text-tealAccent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>رفع</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadThumbOrImage('thumb', e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs text-slate-300">رابط الصورة أو رفعها *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                dir="ltr"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... أو ارفع صورة من جهازك"
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3.5 py-2 text-xs font-bold text-tealAccent">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>رفع صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadThumbOrImage('image', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="عنوان العمل (عربي)"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            dir="ltr"
            placeholder="Title (English)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="عنوان المجموعة (مثال: الحلقة الكاملة)"
            value={groupLabelAr}
            onChange={(e) => setGroupLabelAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="دورك (مثال: تصوير · مونتاج)"
            value={roleTagsAr}
            onChange={(e) => setRoleTagsAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded accent-[#20d8bd]"
            />
            <span>تمييز هذا العمل في قسم &quot;مختارات سريعة&quot; بالصفحة الرئيسية</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-tealAccent px-6 py-2.5 text-xs font-extrabold text-obsidian"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{editingId ? 'حفظ التعديلات' : 'إضافة العمل'}</span>
          </button>
        </div>
      </form>

      {/* Existing Media List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-white">
            جميع الفيديوهات والصور ({filteredItems.length})
          </h3>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#081310] px-3 py-2 text-xs text-white"
          >
            <option value="all">كل الأقسام ({mediaItems.length})</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title_ar}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const sec = sections.find((s) => s.id === item.section_id);
            const fol = folders.find((f) => f.id === item.folder_id);
            const thumb =
              item.custom_thumb_url ||
              item.image_url ||
              (item.youtube_id ? getYouTubeThumbUrl(item.youtube_id) : null);

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/35 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-12 w-16 shrink-0 rounded-lg object-cover bg-black"
                    />
                  ) : (
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] text-slate-400">
                      {item.media_type}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="rounded bg-tealAccent/15 px-1.5 py-0.5 font-bold text-tealAccent">
                        {sec?.title_ar || item.section_id}
                      </span>
                      {fol && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-slate-300">
                          {fol.title_ar}
                        </span>
                      )}
                      <span className="rounded border border-white/15 px-1.5 py-0.5 text-slate-400">
                        {item.aspect_ratio}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-white">
                      {item.title_ar || item.youtube_id || 'بدون عنوان'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMove(item, 'up')}
                    className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:border-tealAccent"
                    title="أعلى"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(item, 'down')}
                    className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:border-tealAccent"
                    title="أسفل"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleProp(item, 'is_featured')}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold ${
                      item.is_featured
                        ? 'border-amberAccent/50 bg-amberAccent/15 text-amberAccent'
                        : 'border-white/15 text-slate-400'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>مختار</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleProp(item, 'is_visible')}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold ${
                      item.is_visible
                        ? 'border-tealAccent/40 text-tealAccent'
                        : 'border-white/15 text-slate-400'
                    }`}
                  >
                    {item.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    <span>{item.is_visible ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-tealAccent"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
