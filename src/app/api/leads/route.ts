import { NextResponse } from 'next/server';
import { notifyNewLead } from '@/lib/lead-notifications';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientName = String(body.client_name || '').trim();
    const whatsappPhone = String(body.whatsapp_phone || '').trim();
    const projectType = String(body.project_type || '').trim();
    const industryField = body.industry_field ? String(body.industry_field).trim() : null;
    const budgetRange = body.budget_range ? String(body.budget_range).trim() : null;
    const projectDetails = body.project_details ? String(body.project_details).trim() : null;

    if (!clientName || !whatsappPhone || !projectType) {
      return NextResponse.json(
        { error: 'Please fill in your name, WhatsApp phone, and project type.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from('contact_leads').insert({
        client_name: clientName,
        whatsapp_phone: whatsappPhone,
        project_type: projectType,
        industry_field: industryField,
        budget_range: budgetRange,
        project_details: projectDetails,
        status: 'new',
      });

      if (error) {
        return NextResponse.json(
          { error: error.message || 'Database error saving lead.' },
          { status: 500 }
        );
      }
    }

    await notifyNewLead({
      clientName,
      whatsappPhone,
      projectType,
      industryField,
      budgetRange,
      projectDetails,
    });

    return NextResponse.json({
      ok: true,
      persisted: Boolean(supabase),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
