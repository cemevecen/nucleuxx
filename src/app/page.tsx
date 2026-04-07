"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_CATEGORIES, Category } from "@/data/categories";
import { MediaItem } from "@/data/mockTweets";
import Onboarding from "@/components/Onboarding";
import Navbar from "@/components/Navbar";
import FeedLayout from "@/components/FeedLayout";
import MediaModal from "@/components/MediaModal";

const STORAGE_KEY = "nucleuxx_categories";

export default function Home() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        const cats = DEFAULT_CATEGORIES.filter((c) => ids.includes(c.id));
        setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES.slice(0, 4));
      } catch {
        setCategories(null);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (selected: Category[]) => {
    const ids = selected.map((c) => c.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setCategories(selected);
    setShowOnboarding(false);
  };

  const handleMediaClick = useCallback((item: MediaItem) => {
    setActiveMedia(item);
  }, []);

  const handleCloseMedia = useCallback(() => {
    setActiveMedia(null);
  }, []);

  if (categories === null && !showOnboarding) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {!showOnboarding && categories && (
        <>
          <Navbar categories={categories} onEditChannels={() => setShowOnboarding(true)} />
          <main className="flex-1 overflow-hidden py-3 sm:py-4">
            <FeedLayout categories={categories} onMediaClick={handleMediaClick} />
          </main>
        </>
      )}

      {/* Media modal */}
      {activeMedia && (
        <MediaModal item={activeMedia} onClose={handleCloseMedia} />
      )}
    </div>
  );
}
