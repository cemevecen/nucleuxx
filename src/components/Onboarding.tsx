"use client";

import { useState } from "react";
import { DEFAULT_CATEGORIES, Category } from "@/data/categories";
import { CHANNEL_SUGGESTIONS } from "@/data/channelSuggestions";

interface Props {
  onComplete: (categories: Category[], channels: Record<string, string[]>) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(DEFAULT_CATEGORIES.slice(0, 4).map((c) => c.id))
  );
  const [selectedChannels, setSelectedChannels] = useState<Record<string, Set<string>>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const goToStep2 = () => {
    const cats = DEFAULT_CATEGORIES.filter((c) => selectedCategories.has(c.id));
    const firstId = cats[0]?.id ?? "";
    setActiveTab(firstId);
    const counts: Record<string, number> = {};
    cats.forEach((c) => { counts[c.id] = 20; });
    setVisibleCount(counts);
    setStep(2);
  };

  const toggleChannel = (catId: string, handle: string) => {
    setSelectedChannels((prev) => {
      const catSet = new Set(prev[catId] ?? []);
      if (catSet.has(handle)) {
        catSet.delete(handle);
      } else {
        catSet.add(handle);
      }
      return { ...prev, [catId]: catSet };
    });
  };

  const selectAll = (catId: string) => {
    const suggestions = CHANNEL_SUGGESTIONS[catId] ?? [];
    const visible = suggestions.slice(0, visibleCount[catId] ?? 20);
    setSelectedChannels((prev) => {
      const catSet = new Set(prev[catId] ?? []);
      visible.forEach((s) => catSet.add(s.handle));
      return { ...prev, [catId]: catSet };
    });
  };

  const deselectAll = (catId: string) => {
    setSelectedChannels((prev) => ({ ...prev, [catId]: new Set() }));
  };

  const showMore = (catId: string) => {
    setVisibleCount((prev) => ({ ...prev, [catId]: (prev[catId] ?? 20) + 20 }));
  };

  const canComplete = () => {
    const cats = DEFAULT_CATEGORIES.filter((c) => selectedCategories.has(c.id));
    return cats.every((c) => (selectedChannels[c.id]?.size ?? 0) > 0);
  };

  const handleComplete = () => {
    const cats = DEFAULT_CATEGORIES.filter((c) => selectedCategories.has(c.id));
    const channels: Record<string, string[]> = {};
    cats.forEach((c) => {
      channels[c.id] = Array.from(selectedChannels[c.id] ?? []);
    });
    onComplete(cats, channels);
  };

  const selectedCats = DEFAULT_CATEGORIES.filter((c) => selectedCategories.has(c.id));

  if (step === 1) {
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
              const isSelected = selectedCategories.has(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
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
              <span className="text-white/60 font-medium">{selectedCategories.size}</span> kategori seçildi
            </p>
            <button
              onClick={goToStep2}
              className="bg-white text-black font-bold px-8 py-3 rounded-full text-sm hover:bg-white/90 active:scale-95 transition-all"
            >
              Devam Et →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2
  const activeSuggestions = CHANNEL_SUGGESTIONS[activeTab] ?? [];
  const visibleSuggestions = activeSuggestions.slice(0, visibleCount[activeTab] ?? 20);
  const activeSelected = selectedChannels[activeTab] ?? new Set<string>();

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col z-50">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col h-full max-w-2xl mx-auto w-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <button
            onClick={() => setStep(1)}
            className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1"
          >
            ← geri
          </button>
          <div className="text-center">
            <h2 className="text-white font-bold text-lg">Kanalları Seç</h2>
          </div>
          <span className="text-white/40 text-xs">Adım 2/2</span>
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-4 flex-shrink-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {selectedCats.map((cat) => {
            const count = selectedChannels[cat.id]?.size ?? 0;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                  isActive
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/8"
                }`}
              >
                {isActive && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundImage: `linear-gradient(to right, ${cat.gradient.from}, ${cat.gradient.to})` }}
                  />
                )}
                {cat.name}
                {count > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                    style={{ backgroundImage: `linear-gradient(to right, ${cat.gradient.from}, ${cat.gradient.to})` }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Select all / Deselect all */}
        {activeTab && (
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-white/40 text-xs">
              {activeSuggestions.length} kanal · {activeSelected.size} seçili
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => selectAll(activeTab)}
                className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-white/30"
              >
                Tümünü seç
              </button>
              <button
                onClick={() => deselectAll(activeTab)}
                className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-white/30"
              >
                Seçimi kaldır
              </button>
            </div>
          </div>
        )}

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {visibleSuggestions.map((suggestion) => {
            const isChecked = activeSelected.has(suggestion.handle);
            const initials = suggestion.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            const activeCat = DEFAULT_CATEGORIES.find((c) => c.id === activeTab);

            return (
              <button
                key={suggestion.handle}
                onClick={() => toggleChannel(activeTab, suggestion.handle)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all text-left"
                style={{ minHeight: "60px" }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{
                    backgroundImage: activeCat
                      ? `linear-gradient(to bottom right, ${activeCat.gradient.from}, ${activeCat.gradient.to})`
                      : undefined,
                    opacity: 0.8,
                  }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight truncate">{suggestion.name}</p>
                  <p className="text-white/40 text-xs truncate">@{suggestion.handle} · {suggestion.description}</p>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked ? "border-white bg-white" : "border-white/30"
                  }`}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}

          {/* Show more button */}
          {visibleSuggestions.length < activeSuggestions.length && (
            <button
              onClick={() => showMore(activeTab)}
              className="w-full py-3 text-sm text-white/50 hover:text-white border border-white/10 rounded-2xl hover:border-white/30 transition-all"
            >
              20 daha göster ({activeSuggestions.length - visibleSuggestions.length} kaldı)
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 flex-shrink-0 border-t border-white/10 mt-4">
          <p className="text-white/30 text-sm">
            {selectedCats.every((c) => (selectedChannels[c.id]?.size ?? 0) > 0)
              ? <span className="text-white/60">Hazır!</span>
              : <span>Her kategoriden en az 1 kanal seç</span>
            }
          </p>
          <button
            onClick={handleComplete}
            disabled={!canComplete()}
            className={`font-bold px-8 py-3 rounded-full text-sm transition-all ${
              canComplete()
                ? "bg-white text-black hover:bg-white/90 active:scale-95"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Başla →
          </button>
        </div>
      </div>
    </div>
  );
}
