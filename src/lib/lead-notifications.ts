export interface LeadNotificationPayload {
  clientName: string;
  whatsappPhone: string;
  projectType: string;
  industryField: string | null;
  budgetRange: string | null;
  projectDetails: string | null;
}

export interface LeadNotificationSummary {
  configured: string[];
  delivered: string[];
  failed: string[];
}

const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_NOTIFY_EMAIL = 'mandogemy56@gmail.com';
const DEFAULT_SITE_URL = 'https://mohamedgamalpro.com';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && raw.startsWith('https://')) {
    return raw.replace(/\/+$/, '');
  }
  return DEFAULT_SITE_URL;
}

function buildWhatsappReplyUrl(payload: LeadNotificationPayload): string | null {
  const digits = payload.whatsappPhone.replace(/\D/g, '');
  if (digits.length < 7) {
    return null;
  }
  const msg = `أهلاً ${payload.clientName}، معاك محمد جمال بخصوص طلبك (${payload.projectType}). يسعدني نتكلم في التفاصيل!`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

function buildPlainTextBody(payload: LeadNotificationPayload, waUrl: string | null): string {
  const lines = [
    `طلب حجز مشروع جديد على الموقع`,
    `العميل: ${payload.clientName}`,
    `الواتساب: ${payload.whatsappPhone}`,
    `نوع المشروع: ${payload.projectType}`,
  ];

  if (payload.industryField) lines.push(`المجال: ${payload.industryField}`);
  if (payload.budgetRange) lines.push(`الميزانية: ${payload.budgetRange}`);
  if (payload.projectDetails) lines.push(`التفاصيل: ${payload.projectDetails}`);
  if (waUrl) lines.push(`رد واتساب سريع: ${waUrl}`);
  lines.push(`لوحة التحكم: ${getSiteBaseUrl()}/admin`);

  return lines.join('\n');
}

async function sendEmailViaResend(payload: LeadNotificationPayload, waUrl: string | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const toEmail =
    process.env.LEAD_NOTIFY_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim() ||
    DEFAULT_NOTIFY_EMAIL;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Mohamed Gamal Portfolio <onboarding@resend.dev>';

  const adminUrl = `${getSiteBaseUrl()}/admin`;
  const subject = `طلب مشروع جديد: ${payload.clientName} — ${payload.projectType}`;

  const rows = [
    ['العميل', payload.clientName],
    ['رقم الواتساب', payload.whatsappPhone],
    ['نوع المشروع', payload.projectType],
    ['المجال', payload.industryField || 'غير محدد'],
    ['الميزانية', payload.budgetRange || 'غير محددة'],
    ['التفاصيل', payload.projectDetails || 'لا توجد تفاصيل إضافية'],
  ];

  const tableRowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #16302a;color:#94a3b8;font-size:13px;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #16302a;color:#f5fbf9;font-size:14px;font-weight:600;white-space:pre-line;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;background:#040908;color:#f5fbf9;padding:24px;border-radius:16px;border:1px solid #16302a;max-width:600px;margin:0 auto;">
      <div style="font-size:12px;letter-spacing:1.5px;color:#20d8bd;font-weight:700;margin-bottom:6px;">MOHAMED GAMAL PORTFOLIO</div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#ffffff;">وصل طلب مشروع جديد</h2>
      <table style="width:100%;border-collapse:collapse;background:#071411;border-radius:12px;overflow:hidden;">
        ${tableRowsHtml}
      </table>
      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
        ${
          waUrl
            ? `<a href="${escapeHtml(waUrl)}" style="display:inline-block;background:#20d8bd;color:#040908;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;">تواصل واتساب مع العميل</a>`
            : ''
        }
        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;border:1px solid #20d8bd;color:#20d8bd;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;">فتح لوحة التحكم</a>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text: buildPlainTextBody(payload, waUrl),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Resend HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
}

async function sendPushViaNtfy(payload: LeadNotificationPayload, waUrl: string | null): Promise<void> {
  const rawTopicUrl = process.env.NTFY_TOPIC_URL?.trim();
  const rawTopic = process.env.NTFY_TOPIC?.trim();

  const endpoint = rawTopicUrl
    ? rawTopicUrl
    : rawTopic
      ? `https://ntfy.sh/${rawTopic.replace(/^\/+/, '')}`
      : '';

  if (!endpoint) return;

  const adminUrl = `${getSiteBaseUrl()}/admin`;
  // HTTP header values in Node fetch must stay strictly ASCII
  const actions = [
    ...(waUrl ? [`view, Open WhatsApp, ${waUrl}`] : []),
    `view, Open Admin, ${adminUrl}`,
  ].join('; ');

  const headers: Record<string, string> = {
    Title: 'New Portfolio Project Request',
    Priority: 'high',
    Tags: 'clapper,briefcase',
    Actions: actions,
    'Content-Type': 'text/plain; charset=utf-8',
  };

  const token = process.env.NTFY_ACCESS_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: buildPlainTextBody(payload, waUrl),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`ntfy HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
}

async function sendTelegramNotification(
  payload: LeadNotificationPayload,
  waUrl: string | null
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const adminUrl = `${getSiteBaseUrl()}/admin`;
  const lines = [
    `<b>طلب مشروع جديد على البورتفوليو</b>`,
    `<b>العميل:</b> ${escapeHtml(payload.clientName)}`,
    `<b>الواتساب:</b> <code>${escapeHtml(payload.whatsappPhone)}</code>`,
    `<b>النوع:</b> ${escapeHtml(payload.projectType)}`,
  ];

  if (payload.industryField) lines.push(`<b>المجال:</b> ${escapeHtml(payload.industryField)}`);
  if (payload.budgetRange) lines.push(`<b>الميزانية:</b> ${escapeHtml(payload.budgetRange)}`);
  if (payload.projectDetails) lines.push(`<b>التفاصيل:</b>\n${escapeHtml(payload.projectDetails)}`);

  const buttons = [
    ...(waUrl ? [[{ text: 'تواصل واتساب مع العميل', url: waUrl }]] : []),
    [[{ text: 'فتح لوحة التحكم', url: adminUrl }]],
  ];

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Telegram HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
}

export async function notifyNewLead(
  payload: LeadNotificationPayload
): Promise<LeadNotificationSummary> {
  const waUrl = buildWhatsappReplyUrl(payload);
  const channels: Array<{ name: string; run: () => Promise<void> }> = [];

  if (process.env.RESEND_API_KEY?.trim()) {
    channels.push({ name: 'email', run: () => sendEmailViaResend(payload, waUrl) });
  }
  if (process.env.NTFY_TOPIC_URL?.trim() || process.env.NTFY_TOPIC?.trim()) {
    channels.push({ name: 'ntfy', run: () => sendPushViaNtfy(payload, waUrl) });
  }
  if (process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim()) {
    channels.push({ name: 'telegram', run: () => sendTelegramNotification(payload, waUrl) });
  }

  const configured = channels.map((c) => c.name);
  if (channels.length === 0) {
    return { configured, delivered: [], failed: [] };
  }

  const results = await Promise.allSettled(channels.map((c) => c.run()));
  const delivered: string[] = [];
  const failed: string[] = [];

  results.forEach((result, idx) => {
    const channelName = channels[idx].name;
    if (result.status === 'fulfilled') {
      delivered.push(channelName);
    } else {
      failed.push(channelName);
      console.error(`[lead-notifications] ${channelName} failed:`, result.reason);
    }
  });

  return { configured, delivered, failed };
}
