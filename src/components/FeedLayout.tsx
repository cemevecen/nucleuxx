"use client";

import { useRef } from "react";
import { Category } from "@/data/categories";
import { MOCK_TWEETS, MediaItem } from "@/data/mockTweets";
import CategoryColumn from "./CategoryColumn";

interface Props {
  categories: Category[];
  onMediaClick: (item: MediaItem) => void;
}

export default function FeedLayout({ categories, onMediaClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const colWidth = scrollRef.current.querySelector("div")?.offsetWidth ?? 340;
    scrollRef.current.scrollBy({ left: dir === "right" ? colWidth + 16 : -(colWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Scroll arrows — hidden on mobile */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-xl"
        aria-label="Sola kaydır"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-xl"
        aria-label="Sağa kaydır"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Fade edges — only on desktop */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      {/* Columns container
          Mobile:  horizontal snap scroll, column = 88vw
          Desktop: horizontal scroll, column = 340px
      */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto h-full px-4 sm:px-12 pb-4 scroll-smooth snap-x snap-mandatory sm:snap-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <div key={cat.id} className="snap-start">
            <CategoryColumn
              category={cat}
              tweets={MOCK_TWEETS[cat.id] ?? []}
              onMediaClick={onMediaClick}
            />
          </div>
        ))}
      </div>

      {/* Mobile dot indicators */}
      <div className="flex sm:hidden justify-center gap-1.5 pt-2 pb-1">
        {categories.map((cat) => (
          <div key={cat.id} className="w-1.5 h-1.5 rounded-full bg-white/20" />
        ))}
      </div>
    </div>
  );
}
