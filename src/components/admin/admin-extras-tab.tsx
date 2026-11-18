'use client';

import { Eye, EyeOff, Plus, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { revalidatePortfolio } from '@/app/actions';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import type {
  ClientLogo,
  EquipmentItem,
  ProcessStep,
  ServiceItem,
  Testimonial,
} from '@/types/portfolio';
import { slugifyId, uploadPortfolioFile } from './admin-helpers';

export function AdminExtrasTab({
  testimonials,
  processSteps,
  services,
  equipment,
  clientLogos,
  onTestimonialsChange,
  onProcessStepsChange,
  onServicesChange,
  onEquipmentChange,
  onLogosChange,
  onNotify,
}: {
  testimonials: Testimonial[];
  processSteps: ProcessStep[];
  services: ServiceItem[];
  equipment: EquipmentItem[];
  clientLogos: ClientLogo[];
  onTestimonialsChange: (next: Testimonial[]) => void;
  onProcessStepsChange: (next: ProcessStep[]) => void;
  onServicesChange: (next: ServiceItem[]) => void;
  onEquipmentChange: (next: EquipmentItem[]) => void;
  onLogosChange: (next: ClientLogo[]) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  // Testimonial form
  const [tNameAr, setTNameAr] = useState('');
  const [tNameEn, setTNameEn] = useState('');
  const [tQuoteAr, setTQuoteAr] = useState('');
  const [tQuoteEn, setTQuoteEn] = useState('');
  const [tSource, setTSource] = useState('WhatsApp');

  // Service form
  const [srvTitleAr, setSrvTitleAr] = useState('');
  const [srvTitleEn, setSrvTitleEn] = useState('');
  const [srvDescAr, setSrvDescAr] = useState('');
  const [srvFeaturesAr, setSrvFeaturesAr] = useState('');

  // Equipment form
  const [eqCatAr, setEqCatAr] = useState('');
  const [eqName, setEqName] = useState('');
  const [eqSpecsAr, setEqSpecsAr] = useState('');

  // Client logo form
  const [logoNameAr, setLogoNameAr] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const persistToggle = async (
    table: string,
    id: string,
    nextVisible: boolean
  ) => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from(table)
        .update({ is_visible: nextVisible })
        .eq('id', id);
      if (error) {
        onNotify(error.message, true);
        return;
      }
      await revalidatePortfolio();
    }
    onNotify('تم تحديث الظهور بنجاح');
  };

  const persistDelete = async (table: string, id: string) => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        onNotify(error.message, true);
        return false;
      }
      await revalidatePortfolio();
    }
    return true;
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: Testimonial = {
      id: slugifyId(tNameEn || tNameAr, 'test'),
      client_name_ar: tNameAr.trim(),
      client_name_en: (tNameEn || tNameAr).trim(),
      client_role_ar: null,
      client_role_en: null,
      quote_ar: tQuoteAr.trim(),
      quote_en: (tQuoteEn || tQuoteAr).trim(),
      source_label: tSource.trim() || 'WhatsApp',
      sort_order: testimonials.length + 1,
      is_visible: true,
    };
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('testimonials').insert(item);
      if (error) return onNotify(error.message, true);
      await revalidatePortfolio();
    }
    onTestimonialsChange([...testimonials, item]);
    setTNameAr('');
    setTNameEn('');
    setTQuoteAr('');
    setTQuoteEn('');
    onNotify('تمت إضافة رأي العميل');
  };

  const handleSaveStep = async (step: ProcessStep) => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('process_steps')
        .upsert(step, { onConflict: 'id' });
      if (error) return onNotify(error.message, true);
      await revalidatePortfolio();
    }
    onNotify(`تم تحديث خطوة "${step.title_ar}"`);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = srvFeaturesAr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const item: ServiceItem = {
      id: slugifyId(srvTitleEn || srvTitleAr, 'srv'),
      title_ar: srvTitleAr.trim(),
      title_en: (srvTitleEn || srvTitleAr).trim(),
      desc_ar: srvDescAr.trim(),
      desc_en: srvDescAr.trim(),
      features_ar: features,
      features_en: features,
      badge_ar: null,
      badge_en: null,
      sort_order: services.length + 1,
      is_visible: true,
    };
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('services').insert(item);
      if (error) return onNotify(error.message, true);
      await revalidatePortfolio();
    }
    onServicesChange([...services, item]);
    setSrvTitleAr('');
    setSrvTitleEn('');
    setSrvDescAr('');
    setSrvFeaturesAr('');
    onNotify('تمت إضافة الباقة/الخدمة');
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: EquipmentItem = {
      id: slugifyId(eqName, 'eq'),
      category_ar: eqCatAr.trim(),
      category_en: eqCatAr.trim(),
      name: eqName.trim(),
      specs_ar: eqSpecsAr.trim(),
      specs_en: eqSpecsAr.trim(),
      icon_name: 'camera',
      sort_order: equipment.length + 1,
      is_visible: true,
    };
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('equipment').insert(item);
      if (error) return onNotify(error.message, true);
      await revalidatePortfolio();
    }
    onEquipmentChange([...equipment, item]);
    setEqCatAr('');
    setEqName('');
    setEqSpecsAr('');
    onNotify('تمت إضافة المعدة/البرنامج');
  };

  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: ClientLogo = {
      id: slugifyId(logoNameAr, 'logo'),
      name_ar: logoNameAr.trim(),
      name_en: logoNameAr.trim(),
      logo_url: logoUrl.trim() || null,
      website_url: null,
      sort_order: clientLogos.length + 1,
      is_visible: true,
    };
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('client_logos').insert(item);
      if (error) return onNotify(error.message, true);
      await revalidatePortfolio();
    }
    onLogosChange([...clientLogos, item]);
    setLogoNameAr('');
    setLogoUrl('');
    onNotify('تمت إضافة شعار العميل');
  };

  return (
    <div className="space-y-8">
      {/* 1. Testimonials */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">آراء العملاء (Testimonials)</h3>
        <div className="space-y-2.5">
          {testimonials.map((tItem) => (
            <div
              key={tItem.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/35 p-3.5"
            >
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-white">{tItem.client_name_ar}</p>
                <p className="mt-0.5 text-xs text-slate-300">{tItem.quote_ar}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = testimonials.map((x) =>
                      x.id === tItem.id ? { ...x, is_visible: !x.is_visible } : x
                    );
                    onTestimonialsChange(next);
                    persistToggle('testimonials', tItem.id, !tItem.is_visible);
                  }}
                  className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-tealAccent"
                >
                  {tItem.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (await persistDelete('testimonials', tItem.id)) {
                      onTestimonialsChange(testimonials.filter((x) => x.id !== tItem.id));
                      onNotify('تم الحذف');
                    }
                  }}
                  className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddTestimonial} className="grid gap-3 sm:grid-cols-2 pt-2">
          <input
            required
            placeholder="اسم العميل (عربي) *"
            value={tNameAr}
            onChange={(e) => setTNameAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            placeholder="Client Name (EN)"
            dir="ltr"
            value={tNameEn}
            onChange={(e) => setTNameEn(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            required
            placeholder="رأي العميل (عربي) *"
            value={tQuoteAr}
            onChange={(e) => setTQuoteAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <div className="flex gap-2">
            <input
              placeholder="المصدر (WhatsApp)"
              value={tSource}
              onChange={(e) => setTSource(e.target.value)}
              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Process Steps */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">خطوات العمل (How We Work Steps)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {processSteps.map((step) => (
            <div key={step.id} className="rounded-xl border border-white/10 bg-black/35 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-tealAccent">خطوة {step.step_number}</span>
                <button
                  type="button"
                  onClick={() => handleSaveStep(step)}
                  className="rounded-full bg-tealAccent/15 px-3 py-1 text-[11px] font-bold text-tealAccent hover:bg-tealAccent hover:text-obsidian"
                >
                  حفظ الخطوة
                </button>
              </div>
              <input
                type="text"
                value={step.title_ar}
                onChange={(e) =>
                  onProcessStepsChange(
                    processSteps.map((s) =>
                      s.id === step.id ? { ...s, title_ar: e.target.value } : s
                    )
                  )
                }
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white"
              />
              <textarea
                rows={2}
                value={step.desc_ar}
                onChange={(e) =>
                  onProcessStepsChange(
                    processSteps.map((s) =>
                      s.id === step.id ? { ...s, desc_ar: e.target.value } : s
                    )
                  )
                }
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Services */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">الخدمات والباقات (اختياري)</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/35 p-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{srv.title_ar}</h4>
                <p className="mt-1 text-xs text-slate-400">{srv.desc_ar}</p>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (await persistDelete('services', srv.id)) {
                      onServicesChange(services.filter((s) => s.id !== srv.id));
                    }
                  }}
                  className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddService} className="grid gap-3 sm:grid-cols-2 pt-2">
          <input
            required
            placeholder="عنوان الباقة (عربي) *"
            value={srvTitleAr}
            onChange={(e) => setSrvTitleAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            placeholder="Package Title (EN)"
            dir="ltr"
            value={srvTitleEn}
            onChange={(e) => setSrvTitleEn(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <input
            required
            placeholder="وصف مختصر للباقة *"
            value={srvDescAr}
            onChange={(e) => setSrvDescAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <textarea
            rows={2}
            placeholder="المميزات (ميزة في كل سطر)"
            value={srvFeaturesAr}
            onChange={(e) => setSrvFeaturesAr(e.target.value)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
          />
          <button
            type="submit"
            className="inline-flex w-fit items-center gap-1 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة باقة</span>
          </button>
        </form>
      </div>

      {/* 4. Equipment & Client Logos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-white">المعدات والبرامج</h3>
          <div className="space-y-2">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/35 p-3"
              >
                <div>
                  <p className="text-xs font-bold text-white">{eq.name}</p>
                  <p className="text-[11px] text-slate-400">{eq.category_ar}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (await persistDelete('equipment', eq.id)) {
                      onEquipmentChange(equipment.filter((x) => x.id !== eq.id));
                    }
                  }}
                  className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddEquipment} className="space-y-2.5 pt-2">
            <input
              required
              placeholder="الفئة (مثال: الكاميرا)"
              value={eqCatAr}
              onChange={(e) => setEqCatAr(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              required
              placeholder="اسم المعدة / البرنامج"
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <input
              required
              placeholder="المواصفات باختصار"
              value={eqSpecsAr}
              onChange={(e) => setEqSpecsAr(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة</span>
            </button>
          </form>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-white">شعارات العملاء (Client Logos)</h3>
          <div className="space-y-2">
            {clientLogos.map((logo) => (
              <div
                key={logo.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/35 p-3"
              >
                <span className="text-xs font-bold text-white">{logo.name_ar}</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (await persistDelete('client_logos', logo.id)) {
                      onLogosChange(clientLogos.filter((x) => x.id !== logo.id));
                    }
                  }}
                  className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddLogo} className="space-y-2.5 pt-2">
            <input
              required
              placeholder="اسم العميل / الشركة"
              value={logoNameAr}
              onChange={(e) => setLogoNameAr(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <input
                placeholder="رابط اللوجو (اختياري)"
                dir="ltr"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-tealAccent/40 bg-tealAccent/10 px-3 py-2 text-xs font-bold text-tealAccent">
                <Upload className="h-3.5 w-3.5" />
                <span>رفع</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const url = await uploadPortfolioFile(f, 'logos');
                      setLogoUrl(url);
                      onNotify('تم رفع اللوجو');
                    } catch (err) {
                      onNotify(err instanceof Error ? err.message : 'فشل الرفع', true);
                    }
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-tealAccent px-4 py-2 text-xs font-extrabold text-obsidian"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة شعار</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
