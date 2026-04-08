"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_CATEGORIES } from "@/data/categories";
import { MOCK_TWEETS, Tweet, MediaItem } from "@/data/mockTweets";
import TweetCard from "@/components/TweetCard";
import MediaModal from "@/components/MediaModal";

const CHANNELS_KEY = "nucleuxx_channels";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const category = DEFAULT_CATEGORIES.find((c) => c.id === id);
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHANNELS_KEY);
      if (stored) {
        const channels: Record<string, string[]> = JSON.parse(stored);
        const handles = channels[id] ?? [];
        setSelectedHandles(handles);
      }
    } catch {
      setSelectedHandles([]);
    }
  }, [id]);

  useEffect(() => {
    const allTweets = MOCK_TWEETS[id] ?? [];
    if (selectedHandles.length > 0) {
      setTweets(allTweets.filter((t) => selectedHandles.includes(t.authorHandle)));
    } else {
      setTweets(allTweets);
    }
  }, [id, selectedHandles]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Kategori bulunamadı</p>
          <Link href="/" className="text-white/60 hover:text-white transition-colors">← Ana Sayfa</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm"
          >
            ← Ana Sayfa
          </Link>
        </div>

        {/* Category header */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundImage: `linear-gradient(to right, ${category.gradient.from}, ${category.gradient.to})` }}
        >
          <h1 className="text-2xl font-black text-white mb-1">{category.name}</h1>
          <p className="text-white/70 text-sm">
            {selectedHandles.length > 0
              ? `${selectedHandles.length} hesap seçili · ${tweets.length} tweet`
              : `${category.accounts.length} hesap · ${tweets.length} tweet`}
          </p>
        </div>

        {/* Tweet list */}
        <div className="space-y-3">
          {tweets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/20">
              <p className="text-sm">Henüz tweet yok</p>
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onMediaClick={(item) => setActiveMedia(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* Media modal */}
      {activeMedia && (
        <MediaModal item={activeMedia} onClose={() => setActiveMedia(null)} />
      )}
    </div>
  );
}
