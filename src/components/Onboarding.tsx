"use client";

import { useState } from "react";
import { DEFAULT_CATEGORIES, Category } from "@/data/categories";

interface Props {
  onComplete: (selected: Category[]) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(DEFAULT_CATEGORIES.slice(0, 4).map((c) => c.id))
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // en az 1 seçili kalsın
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    const categories = DEFAULT_CATEGORIES.filter((c) => selected.has(c.id));
    onComplete(categories);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-50 p-4">
      {/* Glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            nucleuxx
          </h1>
          <p className="text-white/40 text-base">
            Takip ettiğin kanalları seç, kendi akışını oluştur.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selected.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border ${
                  isSelected
                    ? "border-white/30 bg-white/10 scale-[1.02]"
                    : "border-white/5 bg-white/5 hover:bg-white/8 hover:border-white/15"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-xl mb-3"
                  style={{ backgroundImage: `linear-gradient(to bottom right, ${cat.gradient.from}, ${cat.gradient.to})` }}
                />
                <p className="font-semibold text-white text-sm">{cat.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{cat.accounts.length} hesap</p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-sm">
            <span className="text-white/60 font-medium">{selected.size}</span> kategori seçildi
          </p>
          <button
            onClick={handleContinue}
            className="bg-white text-black font-bold px-8 py-3 rounded-full text-sm hover:bg-white/90 active:scale-95 transition-all"
          >
            Başla →
          </button>
        </div>
      </div>
    </div>
  );
}
