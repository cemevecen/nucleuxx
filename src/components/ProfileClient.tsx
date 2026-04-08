"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { DEFAULT_CATEGORIES } from "@/data/categories";

const STORAGE_KEY = "nucleuxx_categories";
const CHANNELS_KEY = "nucleuxx_channels";

interface Props {
  name: string;
  email: string;
  image: string | null;
  provider: string;
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

function providerLabel(provider: string) {
  if (provider === "google") return { label: "Google", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" };
  if (provider === "twitter") return { label: "X (Twitter)", color: "bg-white/10 text-white/70 border-white/15" };
  return { label: "Email", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfileClient({ name, email, image, provider, createdAt }: Props) {
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

  const grad = avatarGradient(email || name);
  const firstLetter = (name || email || "?")[0].toUpperCase();
  const { label: provLabel, color: provColor } = providerLabel(provider);

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
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ana Sayfa
        </Link>

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
          {/* Giriş yöntemi */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-white/50 text-sm">Giriş yöntemi</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${provColor}`}>
              {provLabel}
            </span>
          </div>

          {/* Üyelik tarihi */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-white/50 text-sm">Üyelik tarihi</span>
            <span className="text-white/80 text-sm">{formatDate(createdAt)}</span>
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
