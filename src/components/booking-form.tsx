'use client';

import { CheckCircle2, Loader2, MessageSquare, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { SiteSettings } from '@/types/portfolio';
import { useLanguage } from './language-provider';
import { trackAnalyticsEvent } from './meta-pixel';

export function BookingForm({
  settings,
  selectedProjectType,
}: {
  settings: SiteSettings;
  selectedProjectType?: string;
}) {
  const { lang } = useLanguage();
  const [clientName, setClientName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [projectType, setProjectType] = useState(selectedProjectType || 'Reels Package');
  const [industryField, setIndustryField] = useState('Medical / Clinic');
  const [budgetRange, setBudgetRange] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProjectType) {
      setProjectType(selectedProjectType);
    }
  }, [selectedProjectType]);

  const projectTypes = [
    { value: 'Reels Package', ar: 'باقة فيديوهات Reels', en: 'Reels Package' },
    { value: 'Podcast Production', ar: 'إنتاج وتصوير بودكاست', en: 'Podcast Production' },
    { value: 'Commercial Ad', ar: 'إعلان تجاري متكامل', en: 'Commercial Ad' },
    { value: 'Editing Only', ar: 'مونتاج وتلوين فقط', en: 'Editing & Color Only' },
    { value: 'Motion Graphics', ar: 'موشن جرافيك', en: 'Motion Graphics' },
  ];

  const industries = [
    { value: 'Medical / Clinic', ar: 'طبي / عيادات وتجميل', en: 'Medical / Clinic' },
    { value: 'Marketing Agency', ar: 'شركة تسويق', en: 'Marketing Agency' },
    { value: 'Real Estate', ar: 'عقارات', en: 'Real Estate' },
    { value: 'Brand / E-Commerce', ar: 'براند / منتجات', en: 'Brand / E-Commerce' },
    { value: 'Content Creator', ar: 'صانع محتوى', en: 'Content Creator' },
    { value: 'Other', ar: 'مجال آخر', en: 'Other' },
  ];

  const getLocalizedError = (errorCode?: string): string => {
    switch (errorCode) {
      case 'RATE_LIMITED':
        return lang === 'ar'
          ? 'تم إرسال عدة طلبات في وقت قصير. يرجى المحاولة بعد قليل أو التواصل عبر واتساب مباشرة.'
          : 'Too many requests sent. Please try again shortly or message via WhatsApp.';
      case 'MISSING_FIELDS':
        return lang === 'ar'
          ? 'يرجى إدخال الاسم ورقم الواتساب ونوع المشروع بشكل صحيح.'
          : 'Please enter your name, WhatsApp number, and project type.';
      case 'INVALID_PHONE':
        return lang === 'ar'
          ? 'رقم الواتساب غير صالح — يرجى إدخال رقم صحيح مع رمز الدولة.'
          : 'Invalid WhatsApp number — please enter a valid phone number.';
      case 'FIELD_TOO_LONG':
        return lang === 'ar'
          ? 'أحد الحقول يتجاوز الحد المسموح للطول.'
          : 'One of the fields exceeds the maximum allowed length.';
      default:
        return lang === 'ar'
          ? 'حدث خطأ أثناء حفظ الطلب، يمكنك التواصل مباشرة عبر واتساب.'
          : 'Unable to save your request right now. Please message directly on WhatsApp.';
    }
  };

  const buildWhatsappDirectUrl = () => {
    const cleanNum = settings.whatsapp_number.replace(/\D/g, '') || '201007176105';
    const projectTypeLabel =
      projectTypes.find((opt) => opt.value === projectType)?.[lang] || projectType;
    const industryLabel =
      industries.find((opt) => opt.value === industryField)?.[lang] || industryField;
    const trimmedName = clientName.trim();
    const greeting =
      lang === 'ar'
        ? trimmedName
          ? `أهلاً يا محمد، اسمي ${trimmedName}.`
          : 'أهلاً يا محمد، حابب أستفسر عن مشروع جديد.'
        : trimmedName
          ? `Hi Mohamed, I'm ${trimmedName}.`
          : "Hi Mohamed, I'd like to inquire about a new project.";

    const text =
      lang === 'ar'
        ? `${greeting}\nنوع المشروع: ${projectTypeLabel}\nالمجال: ${industryLabel}${budgetRange.trim() ? `\nالميزانية: ${budgetRange.trim()}` : ''}${projectDetails.trim() ? `\nالتفاصيل: ${projectDetails.trim()}` : ''}`
        : `${greeting}\nProject Type: ${projectTypeLabel}\nIndustry: ${industryLabel}${budgetRange.trim() ? `\nBudget: ${budgetRange.trim()}` : ''}${projectDetails.trim() ? `\nDetails: ${projectDetails.trim()}` : ''}`;
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          whatsapp_phone: whatsappPhone,
          project_type: projectType,
          industry_field: industryField,
          budget_range: budgetRange || null,
          project_details: projectDetails || null,
          website,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(getLocalizedError(data?.errorCode));
        return;
      }
      trackAnalyticsEvent('Lead', {
        project_type: projectType,
        industry: industryField,
      });
      setSubmitted(true);
    } catch {
      setErrorMsg(getLocalizedError());
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel rounded-2xl border border-tealAccent/40 p-6 sm:p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tealAccent/15 text-tealAccent">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white">
          {lang === 'ar'
            ? 'تم استلام تفاصيل مشروعك بنجاح!'
            : 'Your project brief has been received!'}
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          {lang === 'ar'
            ? 'شكراً لتواصلك يا فندم — تم حفظ طلبك وسأتواصل معك على الواتساب في أقرب وقت.'
            : 'Thank you! Your request is saved and I will reach out via WhatsApp shortly.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={buildWhatsappDirectUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-tealAccent px-5 py-2.5 text-sm font-bold text-obsidian transition hover:brightness-110"
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {lang === 'ar'
                ? 'أرسل نفس التفاصيل على واتساب الآن'
                : 'Send brief via WhatsApp now'}
            </span>
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setClientName('');
              setWhatsappPhone('');
              setProjectDetails('');
            }}
            className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-tealAccent/50 hover:text-white"
          >
            {lang === 'ar' ? 'إرسال طلب آخر' : 'Submit another'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-2xl border border-tealAccent/25 p-5 sm:p-7 text-start"
    >
      <div className="mb-5">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-tealAccent">
          {lang === 'ar' ? 'نموذج الحجز السريع' : 'QUICK PROJECT BRIEF'}
        </span>
        <h3 className="mt-1 text-xl font-extrabold text-white">
          {lang === 'ar' ? 'احجز مشروعك الآن' : 'Book Your Project'}
        </h3>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          name="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="booking-client-name"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            {lang === 'ar' ? 'الاسم أو اسم العيادة / الشركة *' : 'Your Name / Brand *'}
          </label>
          <input
            id="booking-client-name"
            name="client_name"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={lang === 'ar' ? 'مثال: د. أحمد / عيادة كذا' : 'e.g. Dr. Ahmed / Studio X'}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="booking-whatsapp-phone"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            {lang === 'ar' ? 'رقم الواتساب للتواصل *' : 'WhatsApp Number *'}
          </label>
          <input
            id="booking-whatsapp-phone"
            name="whatsapp_phone"
            type="tel"
            required
            autoComplete="tel"
            maxLength={25}
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="+20 10..."
            dir="ltr"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="booking-project-type"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            {lang === 'ar' ? 'نوع المحتوى المطلوب' : 'Project Type'}
          </label>
          <select
            id="booking-project-type"
            name="project_type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#081310] px-3.5 py-2.5 text-sm text-white focus:border-tealAccent focus:outline-none"
          >
            {projectTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'ar' ? opt.ar : opt.en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="booking-industry-field"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            {lang === 'ar' ? 'المجال / التخصص' : 'Industry / Field'}
          </label>
          <select
            id="booking-industry-field"
            name="industry_field"
            value={industryField}
            onChange={(e) => setIndustryField(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#081310] px-3.5 py-2.5 text-sm text-white focus:border-tealAccent focus:outline-none"
          >
            {industries.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'ar' ? opt.ar : opt.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="booking-project-details"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          {lang === 'ar' ? 'تفاصيل الفكرة أو عدد الفيديوهات (اختياري)' : 'Project Details (Optional)'}
        </label>
        <textarea
          id="booking-project-details"
          name="project_details"
          rows={3}
          maxLength={2000}
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          placeholder={
            lang === 'ar'
              ? 'اكتب فكرة مبدئية، عدد الريلز المطلوبة شهرياً، أو الموعد المقترح...'
              : 'Tell me about your timeline, number of videos, or goals...'
          }
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="booking-budget-range"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          {lang === 'ar' ? 'الميزانية التقديرية (اختياري)' : 'Estimated Budget (Optional)'}
        </label>
        <input
          id="booking-budget-range"
          name="budget_range"
          type="text"
          maxLength={120}
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value)}
          placeholder={lang === 'ar' ? 'مثال: باقة شهرية / مشروع واحد' : 'e.g. Monthly retainer / One-off'}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
        />
      </div>

      {errorMsg && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {errorMsg}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-tealAccent px-6 py-3 text-sm font-extrabold text-obsidian transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>
            {submitting
              ? lang === 'ar'
                ? 'جاري الإرسال...'
                : 'Sending...'
              : lang === 'ar'
                ? 'إرسال طلب الحجز'
                : 'Send Project Request'}
          </span>
        </button>

        <a
          href={buildWhatsappDirectUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAnalyticsEvent('Contact', { channel: 'whatsapp_direct' })}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-tealAccent/40 bg-tealAccent/10 px-5 py-3 text-xs font-bold text-tealAccent transition hover:bg-tealAccent/20"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{lang === 'ar' ? 'واتساب مباشر' : 'WhatsApp Direct'}</span>
        </a>
      </div>
    </form>
  );
}
