'use client';

import { Loader2, Save, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { revalidatePortfolio } from '@/app/actions';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import { extractYouTubeId } from '@/lib/utils';
import type { SiteSettings } from '@/types/portfolio';
import { uploadPortfolioFile } from './admin-helpers';

export function AdminSettingsTab({
  settings,
  onChange,
  onNotify,
}: {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleField = (key: keyof SiteSettings, val: string | null) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = async (
    field: 'hero_bg_image_url' | 'logo_url' | 'cv_url',
    file: File | undefined,
    folder: string
  ) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const url = await uploadPortfolioFile(file, folder);
      const next = { ...form, [field]: url };
      setForm(next);
      onNotify('تم رفع الملف بنجاح — اضغط "حفظ الإعدادات" لتأكيد النشر.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'فشل رفع الملف', true);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const normalizedShowreel = form.showreel_youtube_id
        ? extractYouTubeId(form.showreel_youtube_id) || form.showreel_youtube_id
        : null;
      const payload = {
        ...form,
        showreel_youtube_id: normalizedShowreel,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase
          .from('site_settings')
          .upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        await revalidatePortfolio();
      }
      onChange(payload);
      onNotify('تم حفظ جميع نصوص وصور الموقع وتحديثه بنجاح!');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذر حفظ الإعدادات', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Brand & Images */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-extrabold text-white">الهوية والصور الأساسية</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-300">الاسم (عربي)</label>
            <input
              type="text"
              value={form.brand_name_ar}
              onChange={(e) => handleField('brand_name_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">الاسم (English)</label>
            <input
              type="text"
              dir="ltr"
              value={form.brand_name_en}
              onChange={(e) => handleField('brand_name_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">نص اللوجو (إذا لم تُرفع صورة)</label>
            <input
              type="text"
              dir="ltr"
              value={form.logo_text}
              onChange={(e) => handleField('logo_text', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">صورة الخلفية الشخصية (Hero Image)</label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={form.hero_bg_image_url}
                onChange={(e) => handleField('hero_bg_image_url', e.target.value)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3 py-2 text-xs font-bold text-tealAccent hover:bg-tealAccent/20">
                {uploadingField === 'hero_bg_image_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>رفع</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload('hero_bg_image_url', e.target.files?.[0], 'hero')
                  }
                />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">رابط أو ملف اللوجو (اختياري)</label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={form.logo_url || ''}
                onChange={(e) => handleField('logo_url', e.target.value || null)}
                placeholder="اتركه فارغاً لاستخدام MG"
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3 py-2 text-xs font-bold text-tealAccent hover:bg-tealAccent/20">
                {uploadingField === 'logo_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>رفع</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload('logo_url', e.target.files?.[0], 'brand')}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              رابط أو ID فيديو الـ Showreel (يوتيوب)
            </label>
            <input
              type="text"
              dir="ltr"
              value={form.showreel_youtube_id || ''}
              onChange={(e) => handleField('showreel_youtube_id', e.target.value || null)}
              placeholder="مثال: https://youtube.com/shorts/..."
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-300">ملف السيرة الذاتية (CV PDF)</label>
            <div className="flex gap-2">
              <input
                type="text"
                dir="ltr"
                value={form.cv_url}
                onChange={(e) => handleField('cv_url', e.target.value)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3 py-2 text-xs font-bold text-tealAccent hover:bg-tealAccent/20">
                {uploadingField === 'cv_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>رفع PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload('cv_url', e.target.files?.[0], 'cv')}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Texts */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">نصوص الواجهة الأولى (Hero)</h3>
        <div>
          <label className="mb-1 block text-xs text-slate-300">الشريط العلوي (Eyebrow)</label>
          <input
            type="text"
            dir="ltr"
            value={form.hero_eyebrow}
            onChange={(e) => handleField('hero_eyebrow', e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">العنوان الرئيسي (عربي)</label>
            <input
              type="text"
              value={form.hero_title_ar}
              onChange={(e) => handleField('hero_title_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">العنوان الرئيسي (English)</label>
            <input
              type="text"
              dir="ltr"
              value={form.hero_title_en}
              onChange={(e) => handleField('hero_title_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">المسمى الوظيفي (عربي)</label>
            <input
              type="text"
              value={form.hero_role_ar}
              onChange={(e) => handleField('hero_role_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">المسمى الوظيفي (English)</label>
            <input
              type="text"
              dir="ltr"
              value={form.hero_role_en}
              onChange={(e) => handleField('hero_role_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">النبذة التعريفية (عربي)</label>
            <textarea
              rows={2}
              value={form.hero_desc_ar}
              onChange={(e) => handleField('hero_desc_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">النبذة التعريفية (English)</label>
            <textarea
              rows={2}
              dir="ltr"
              value={form.hero_desc_en}
              onChange={(e) => handleField('hero_desc_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* How We Work & CTA & Socials */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">قسم "كيف نعمل" وبيانات التواصل</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">عنوان كيف نعمل (عربي)</label>
            <input
              type="text"
              value={form.hww_title_ar}
              onChange={(e) => handleField('hww_title_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">عنوان كيف نعمل (English)</label>
            <input
              type="text"
              dir="ltr"
              value={form.hww_title_en}
              onChange={(e) => handleField('hww_title_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">نص كيف نعمل (عربي)</label>
            <textarea
              rows={3}
              value={form.hww_desc_ar}
              onChange={(e) => handleField('hww_desc_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">نص كيف نعمل (English)</label>
            <textarea
              rows={3}
              dir="ltr"
              value={form.hww_desc_en}
              onChange={(e) => handleField('hww_desc_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">عنوان CTA التواصل (عربي)</label>
            <input
              type="text"
              value={form.cta_title_ar}
              onChange={(e) => handleField('cta_title_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">عنوان CTA التواصل (English)</label>
            <input
              type="text"
              dir="ltr"
              value={form.cta_title_en}
              onChange={(e) => handleField('cta_title_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-sm text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">رقم الواتساب (دولي)</label>
            <input
              type="text"
              dir="ltr"
              value={form.whatsapp_number}
              onChange={(e) => handleField('whatsapp_number', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">رابط واتساب</label>
            <input
              type="text"
              dir="ltr"
              value={form.whatsapp_url}
              onChange={(e) => handleField('whatsapp_url', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">رابط Instagram</label>
            <input
              type="text"
              dir="ltr"
              value={form.instagram_url}
              onChange={(e) => handleField('instagram_url', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">رابط Facebook</label>
            <input
              type="text"
              dir="ltr"
              value={form.facebook_url}
              onChange={(e) => handleField('facebook_url', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* SEO Descriptions */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">وصف محركات البحث ومعاينة الروابط (SEO)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-300">وصف SEO (عربي)</label>
            <textarea
              rows={2}
              value={form.seo_description_ar}
              onChange={(e) => handleField('seo_description_ar', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">وصف SEO (English)</label>
            <textarea
              rows={2}
              dir="ltr"
              value={form.seo_description_en}
              onChange={(e) => handleField('seo_description_en', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-tealAccent px-7 py-3 text-sm font-extrabold text-obsidian transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        <span>{saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات والنصوص'}</span>
      </button>
    </form>
  );
}
