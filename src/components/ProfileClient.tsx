"use client";

import { useState, useEffect, useRef, useActionState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCredentialsPasswordFromProfile } from "@/app/actions/password";
import { logout } from "@/app/actions/auth";
import { DEFAULT_CATEGORIES } from "@/data/categories";

const STORAGE_KEY = "nucleuxx_categories";
const CHANNELS_KEY = "nucleuxx_channels";

interface Props {
  name: string;
  email: string;
  image: string | null;
  linked: { email: boolean; google: boolean; twitter: boolean };
  createdAt: string;
}

const AVATAR_COLORS = [
  ["#8b5cf6", "#7e22ce"],
  ["#3b82f6", "#0891b2"],
  ["#f97316", "#ca8a04"],
  ["#22c55e", "#047857"],
  ["#ec4899", "#a21caf"],
  ["#14b8a6", "#0284c7"],
];

function avatarGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const [from, to] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { from, to };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  });
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconGoogle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.715-6.231-5.4 6.231H2.155l7.73-8.835L1.254 2.25H8.08l4.13 5.527 4.414-5.527h1.62zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

function MethodStatusRow({
  icon,
  title,
  subtitle,
  active,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          active
            ? "border-white/15 bg-white/[0.07] text-white/90"
            : "border-white/[0.06] bg-white/[0.03] text-white/35"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/90 tracking-tight">{title}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-white/35">{subtitle}</p>
      </div>
      <div className="shrink-0">
        {active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-400/95 ring-1 ring-inset ring-emerald-500/20">
            <span className="h-1 w-1 rounded-full bg-emerald-400" aria-hidden />
            Bağlı
          </span>
        ) : (
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/30 ring-1 ring-inset ring-white/[0.08]">
            Yok
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfileClient({
  name,
  email,
  image,
  linked,
  createdAt,
}: Props) {
  const router = useRouter();
  const [pwState, pwAction, pwPending] = useActionState(setCredentialsPasswordFromProfile, undefined);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.slice(0, 4));
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedChannels = localStorage.getItem(CHANNELS_KEY);

    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        const cats = DEFAULT_CATEGORIES.filter((c) => ids.includes(c.id));
        if (cats.length > 0) setCategories(cats);
      } catch {}
    }

    if (storedChannels) {
      try {
        const ch: Record<string, string[]> = JSON.parse(storedChannels);
        const counts: Record<string, number> = {};
        Object.entries(ch).forEach(([k, v]) => { counts[k] = v.length; });
        setChannelCounts(counts);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (pwState?.ok) router.refresh();
  }, [pwState?.ok, router]);

  const grad = avatarGradient(email || name);
  const firstLetter = (name || email || "?")[0].toUpperCase();
  const linkedCount = [linked.email, linked.google, linked.twitter].filter(Boolean).length;

  // Drag handlers
  const onDragStart = (i: number) => {
    dragItem.current = i;
    setDragIdx(i);
  };
  const onDragEnter = (i: number) => setOverIdx(i);
  const onDragEnd = () => {
    if (dragItem.current !== null && overIdx !== null && dragItem.current !== overIdx) {
      const next = [...categories];
      const [moved] = next.splice(dragItem.current, 1);
      next.splice(overIdx, 0, moved);
      setCategories(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((c) => c.id)));
    }
    dragItem.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-8">
        {/* Üst satır: ana sayfa + çıkış (profilde Navbar olmadığı için burada) */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 shadow-sm transition hover:border-white/25 hover:bg-white/[0.1]"
            >
              Çıkış
            </button>
          </form>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}
            >
              {firstLetter}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{name || email}</h1>
            <p className="text-white/40 text-sm">{email}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="space-y-3 mb-8">
          {/* Bağlı giriş yöntemleri — ayarlar paneli stili */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.06] via-[#0d0d14] to-[#08080d] shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-24px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" aria-hidden />
            <div className="relative px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-white/95">Bağlı giriş yöntemleri</h2>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
                    {linkedCount} / 3 bağlantı
                  </p>
                </div>
                <p
                  className="max-w-[22rem] text-[13px] leading-relaxed text-white/42 sm:text-right"
                  suppressHydrationWarning
                >
                  Başka hesapla giriş için sayfanın üstündeki veya alttaki{" "}
                  <span className="text-white/65">Çıkış</span> ile oturumu kapat; ana ekranda da aynı düğme var. Bu
                  blok yalnızca bilgi gösterir.
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07] bg-black/25">
                <MethodStatusRow
                  icon={<IconMail className="h-[18px] w-[18px]" />}
                  title="E-posta ve şifre"
                  subtitle="Giriş sayfasında e-posta ile oturum"
                  active={linked.email}
                />
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <MethodStatusRow
                  icon={<IconGoogle className="h-[18px] w-[18px]" />}
                  title="Google"
                  subtitle="Google hesabınla oturum"
                  active={linked.google}
                />
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <MethodStatusRow
                  icon={<IconX className="h-[15px] w-[15px]" />}
                  title="X"
                  subtitle="X (Twitter) hesabınla oturum"
                  active={linked.twitter}
                />
              </div>

              {!linked.email && (
                <form action={pwAction} className="mt-5 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div>
                    <p className="text-[13px] font-medium text-white/75">E-posta ile giriş için şifre oluştur</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-white/38">
                      OAuth ile açılan hesaplarda şifre yoktur; buradan ekleyebilirsin.
                    </p>
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="Yeni şifre (en az 8 karakter)"
                    minLength={8}
                    maxLength={128}
                    required
                    className="w-full rounded-lg border border-white/[0.1] bg-[#0a0a0f]/80 px-3 py-2.5 text-sm text-white shadow-inner placeholder:text-white/22 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/15"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Şifre tekrar"
                    minLength={8}
                    maxLength={128}
                    required
                    className="w-full rounded-lg border border-white/[0.1] bg-[#0a0a0f]/80 px-3 py-2.5 text-sm text-white shadow-inner placeholder:text-white/22 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/15"
                  />
                  {pwState?.error ? <p className="text-[13px] text-red-400/90">{pwState.error}</p> : null}
                  {pwState?.ok ? (
                    <p className="text-[13px] leading-relaxed text-emerald-400/90">
                      Şifre kaydedildi. Çıkış yapıp giriş sayfasından e-posta ve şifre ile girebilirsin.
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={pwPending}
                    className="w-full rounded-lg bg-white/[0.09] py-2.5 text-sm font-medium text-white/90 ring-1 ring-inset ring-white/[0.12] transition hover:bg-white/[0.12] disabled:opacity-45"
                  >
                    {pwPending ? "Kaydediliyor…" : "Şifreyi kaydet"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Üyelik tarihi */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-white/50 text-sm">Üyelik tarihi</span>
            <span className="text-white/80 text-sm" suppressHydrationWarning>
              {formatDate(createdAt)}
            </span>
          </div>
        </div>

        {/* Kategori sıralaması */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/70 text-sm font-medium">Kategori Sıralaması</h2>
            <span className="text-white/30 text-xs">Sürükle & bırak</span>
          </div>
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 bg-white/5 border rounded-2xl px-4 py-3 cursor-grab active:cursor-grabbing transition-all select-none ${
                  dragIdx === i
                    ? "opacity-40 border-white/20"
                    : overIdx === i
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Drag handle */}
                <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm8-16a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>

                {/* Gradient dot */}
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0"
                  style={{ backgroundImage: `linear-gradient(135deg, ${cat.gradient.from}, ${cat.gradient.to})` }}
                />

                <span className="text-white text-sm font-medium flex-1">{cat.name}</span>

                <span className="text-white/30 text-xs">
                  {channelCounts[cat.id] ? `${channelCounts[cat.id]} kanal` : ""}
                </span>

                <Link
                  href={`/category/${cat.id}`}
                  className="text-white/20 hover:text-white/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/?edit=channels"
            className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl px-4 py-3 text-white/70 hover:text-white text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Kanalları Düzenle
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-2xl px-4 py-3 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
