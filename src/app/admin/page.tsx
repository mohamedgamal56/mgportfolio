import React from 'react';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getPortfolioBundle } from '@/lib/portfolio-service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { ContactLead } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const bundle = await getPortfolioBundle({ includeHidden: true });
  const supabaseReady = isSupabaseConfigured();

  let leads: ContactLead[] = [];
  let adminEmail: string | null = null;

  if (supabaseReady) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      adminEmail = user?.email || null;

      const { data } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (Array.isArray(data)) {
        leads = data;
      }
    }
  }

  return (
    <AdminDashboard
      initialBundle={bundle}
      initialLeads={leads}
      supabaseConfigured={supabaseReady}
      adminEmail={adminEmail}
    />
  );
}
