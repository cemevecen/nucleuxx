"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DEFAULT_CATEGORIES, Category } from "@/data/categories";
import { MediaItem } from "@/data/mockTweets";
import Onboarding from "@/components/Onboarding";
import Navbar from "@/components/Navbar";
import FeedLayout from "@/components/FeedLayout";
import MediaModal from "@/components/MediaModal";

const STORAGE_KEY = "nucleuxx_categories";
const CHANNELS_KEY = "nucleuxx_channels";

function HomeInner() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, string[]>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedChannels = localStorage.getItem(CHANNELS_KEY);

    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        const cats = DEFAULT_CATEGORIES.filter((c) => ids.includes(c.id));
        setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES.slice(0, 4));
      } catch {
        setCategories(null);
      }

      if (storedChannels) {
        try {
          const channels: Record<string, string[]> = JSON.parse(storedChannels);
          setSelectedChannels(channels);
        } catch {
          setSelectedChannels({});
        }
      }
    } else {
      setShowOnboarding(true);
    }

    // Profil sayfasından "Kanalları Düzenle" ile gelen yönlendirme
    if (searchParams.get("edit") === "channels") {
      setShowOnboarding(true);
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleOnboardingComplete = (selected: Category[], channels: Record<string, string[]>) => {
    const ids = selected.map((c) => c.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
    setCategories(selected);
    setSelectedChannels(channels);
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onClose={categories ? () => setShowOnboarding(false) : undefined}
          initialCategories={categories?.map((c) => c.id)}
          initialChannels={selectedChannels}
        />
      )}

      {!showOnboarding && categories && (
        <>
          <Navbar categories={categories} />
          <main className="flex-1 py-3 sm:py-4">
            <FeedLayout
              categories={categories}
              onMediaClick={handleMediaClick}
              selectedChannels={selectedChannels}
            />
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

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
