'use client';

import { AlertTriangle, ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabaseReady = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('error') === 'unauthorized'
      ? 'هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.'
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg('بيانات الدخول غير صحيحة أو الحساب غير موجود في Supabase.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMsg('حدث خطأ أثناء الاتصال بخدمة المصادقة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-tealAccent/25 p-7 sm:p-9 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-tealAccent/40 bg-tealAccent/10 text-tealAccent">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">لوحة تحكم البورتفوليو</h1>
              <p className="text-xs text-slate-400">دخول المالك فقط — Mohamed Gamal CMS</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-tealAccent hover:text-tealAccent"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>الموقع</span>
          </Link>
        </div>

        {!supabaseReady ? (
          <div className="space-y-4 rounded-2xl border border-amberAccent/40 bg-amberAccent/10 p-5 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-bold text-amberAccent">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>بانتظار ربط مفاتيح Supabase</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">
              لم يتم إضافة متغيرات البيئة <code>NEXT_PUBLIC_SUPABASE_URL</code> و{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> بعد. يمكنك معاينة شكل لوحة التحكم
              مباشرة من الزر أدناه، وبعد ربط Supabase سيصبح الدخول محمياً بكلمة مرورك.
            </p>
            <Link
              href="/admin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tealAccent px-5 py-2.5 text-xs font-extrabold text-obsidian transition hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>فتح معاينة لوحة التحكم ودليل الإعداد</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                البريد الإلكتروني (Admin Email)
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mohamed@example.com"
                className="w-full rounded-xl border border-white/15 bg-black/45 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-black/45 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-tealAccent focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tealAccent px-6 py-3 text-sm font-extrabold text-obsidian transition hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
