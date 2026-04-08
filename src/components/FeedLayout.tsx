"use client";

import { useRef, useState, useEffect } from "react";
import { Category } from "@/data/categories";
import { Tweet, MOCK_TWEETS, MediaItem } from "@/data/mockTweets";
import CategoryColumn from "./CategoryColumn";

interface Props {
  categories: Category[];
  onMediaClick: (item: MediaItem) => void;
  selectedChannels: Record<string, string[]>;
}

// Kategori başına tweet'leri API'den çeker; hata/boşlukta mock'a düşer.
function useTweets(categories: Category[]) {
  const [tweets, setTweets] = useState<Record<string, Tweet[]>>(() => {
    const init: Record<string, Tweet[]> = {};
    for (const cat of categories) init[cat.id] = MOCK_TWEETS[cat.id] ?? [];
    return init;
  });

  useEffect(() => {
    let cancelled = false;
    for (const cat of categories) {
      fetch(`/api/tweets/${cat.id}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data: Tweet[] | null) => {
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setTweets((prev) => ({ ...prev, [cat.id]: data }));
          }
        })
        .catch(() => { /* mock zaten yüklü, sessizce devam */ });
    }
    return () => { cancelled = true; };
  // categories referansı değiştiğinde yeniden fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.map((c) => c.id).join(",")]);

  return tweets;
}

export default function FeedLayout({ categories, onMediaClick, selectedChannels }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = categories.length;
  const tweets = useTweets(categories);

  const useGrid = count <= 4;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const col = scrollRef.current.querySelector<HTMLElement>("[data-col]");
    const colWidth = col?.offsetWidth ?? 340;
    scrollRef.current.scrollBy({ left: dir === "right" ? colWidth + 16 : -(colWidth + 16), behavior: "smooth" });
  };

  if (useGrid) {
    return (
      <>
        {/* Mobile: snap scroll tek kolon */}
        <div
          className="flex sm:hidden gap-4 overflow-x-auto px-4 pb-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => (
            <div key={cat.id} className="snap-start flex-shrink-0 w-[88vw]" data-col>
              <CategoryColumn
                category={cat}
                tweets={tweets[cat.id] ?? []}
                onMediaClick={onMediaClick}
                selectedHandles={selectedChannels[cat.id] ?? []}
                fluid
              />
            </div>
          ))}
        </div>

        {/* Desktop: grid — kolonlar eşit genişlikte, ekrana yayılır */}
        <div
          className="hidden sm:grid gap-4 px-4 pb-6"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {categories.map((cat) => (
            <CategoryColumn
              key={cat.id}
              category={cat}
              tweets={tweets[cat.id] ?? []}
              onMediaClick={onMediaClick}
              selectedHandles={selectedChannels[cat.id] ?? []}
              fluid
            />
          ))}
        </div>

        {/* Mobile dot indicators */}
        <div className="flex sm:hidden justify-center gap-1.5 pt-1 pb-3">
          {categories.map((cat) => (
            <div key={cat.id} className="w-1.5 h-1.5 rounded-full bg-white/20" />
          ))}
        </div>
      </>
    );
  }

  // 5+ kategori: yatay scroll
  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-2 top-24 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-xl"
        aria-label="Sola kaydır"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-2 top-24 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-xl"
        aria-label="Sağa kaydır"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-12 pb-6 snap-x snap-mandatory sm:snap-none"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <div key={cat.id} className="snap-start flex-shrink-0 w-[88vw] sm:w-[340px]" data-col>
            <CategoryColumn
              category={cat}
              tweets={tweets[cat.id] ?? []}
              onMediaClick={onMediaClick}
              selectedHandles={selectedChannels[cat.id] ?? []}
            />
          </div>
        ))}
      </div>

      <div className="flex sm:hidden justify-center gap-1.5 pt-1 pb-3">
        {categories.map((cat) => (
          <div key={cat.id} className="w-1.5 h-1.5 rounded-full bg-white/20" />
        ))}
      </div>
    </div>
  );
}
