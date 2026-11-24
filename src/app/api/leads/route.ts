import { NextResponse } from 'next/server';
import { notifyNewLead } from '@/lib/lead-notifications';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const MAX_TRACKED_IPS = 500;
const ipTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipTimestamps.get(ip) || []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    ipTimestamps.set(ip, recent);
    return true;
  }
  if (!ipTimestamps.has(ip) && ipTimestamps.size >= MAX_TRACKED_IPS) {
    const oldestKey = ipTimestamps.keys().next().value;
    if (oldestKey) {
      ipTimestamps.delete(oldestKey);
    }
  }
  recent.push(now);
  ipTimestamps.set(ip, recent);
  return false;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        errorCode: 'RATE_LIMITED',
        error: 'Too many requests. Please try again later.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Honeypot field: silently acknowledge without persisting or notifying
    if (typeof body?.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true, persisted: false });
    }

    const clientName = String(body?.client_name || '').trim();
    const whatsappPhone = String(body?.whatsapp_phone || '').trim();
    const projectType = String(body?.project_type || '').trim();
    const industryField = body?.industry_field ? String(body.industry_field).trim() : null;
    const budgetRange = body?.budget_range ? String(body.budget_range).trim() : null;
    const projectDetails = body?.project_details ? String(body.project_details).trim() : null;

    if (
      !clientName ||
      !whatsappPhone ||
      !projectType ||
      clientName.length < 2 ||
      projectType.length < 2
    ) {
      return NextResponse.json(
        {
          errorCode: 'MISSING_FIELDS',
          error: 'Please fill in your name, WhatsApp phone, and project type.',
        },
        { status: 400 }
      );
    }

    if (
      clientName.length > 120 ||
      projectType.length > 100 ||
      (industryField && industryField.length > 100) ||
      (budgetRange && budgetRange.length > 120) ||
      (projectDetails && projectDetails.length > 2000)
    ) {
      return NextResponse.json(
        {
          errorCode: 'FIELD_TOO_LONG',
          error: 'One or more fields exceed the maximum allowed length.',
        },
        { status: 400 }
      );
    }

    const digitsCount = whatsappPhone.replace(/\D/g, '').length;
    if (!/^[+\d\s\-()]{7,25}$/.test(whatsappPhone) || digitsCount < 7 || digitsCount > 20) {
      return NextResponse.json(
        {
          errorCode: 'INVALID_PHONE',
          error: 'Please provide a valid WhatsApp phone number.',
        },
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
        console.error('[api/leads] Supabase insert failed:', error.message);
        return NextResponse.json(
          { errorCode: 'SERVER_ERROR', error: 'Unable to save request.' },
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
    return NextResponse.json(
      { errorCode: 'INVALID_PAYLOAD', error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}
