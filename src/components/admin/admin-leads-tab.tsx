'use client';

import { MessageCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import type { ContactLead, LeadStatus } from '@/types/portfolio';

export function AdminLeadsTab({
  leads,
  onLeadsChange,
  onNotify,
}: {
  leads: ContactLead[];
  onLeadsChange: (next: ContactLead[]) => void;
  onNotify: (msg: string, isError?: boolean) => void;
}) {
  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('contact_leads')
        .update({ status })
        .eq('id', leadId);
      if (error) return onNotify(error.message, true);
    }
    onLeadsChange(leads.map((l) => (l.id === leadId ? { ...l, status } : l)));
    onNotify('تم تحديث حالة الطلب');
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('حذف هذا الطلب؟')) return;
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('contact_leads').delete().eq('id', leadId);
      if (error) return onNotify(error.message, true);
    }
    onLeadsChange(leads.filter((l) => l.id !== leadId));
    onNotify('تم حذف الطلب');
  };

  const formatWhatsappReply = (lead: ContactLead) => {
    const clean = lead.whatsapp_phone.replace(/\D/g, '');
    const msg = `أهلاً ${lead.client_name}، معاك محمد جمال بخصوص طلبك (${lead.project_type}). يسعدني نتكلم في التفاصيل!`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="text-lg font-extrabold text-white">
          طلبات الحجز والتواصل ({leads.length})
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          جميع العملاء الذين أرسلوا بيانات مشاريعهم عبر نموذج الحجز بالموقع.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">
          لا توجد طلبات حجز واردة حتى الآن.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-white/10 bg-black/35 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-white">{lead.client_name}</h4>
                    <span className="rounded-full bg-tealAccent/15 px-2.5 py-0.5 text-[11px] font-bold text-tealAccent">
                      {lead.project_type}
                    </span>
                    {lead.industry_field && (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-slate-300">
                        {lead.industry_field}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400" dir="ltr">
                    {lead.whatsapp_phone} {lead.budget_range ? `· ${lead.budget_range}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      handleStatusChange(lead.id, e.target.value as LeadStatus)
                    }
                    className="rounded-lg border border-white/15 bg-[#081310] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="new">جديد</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="closed">مغلق</option>
                  </select>

                  <a
                    href={formatWhatsappReply(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-tealAccent px-3 py-1.5 text-xs font-extrabold text-obsidian"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>رد واتساب</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(lead.id)}
                    className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {lead.project_details && (
                <p className="rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-200">
                  {lead.project_details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
