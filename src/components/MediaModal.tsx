"use client";

import { useEffect } from "react";
import { MediaItem } from "@/data/mockTweets";

interface Props {
  item: MediaItem;
  onClose: () => void;
}

export default function MediaModal({ item, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isVideo = item.type === "video";

  // Gerçek API: video.twimg.com doğrudan <video> tag'de çalışır
  const hasDirectVideo = isVideo && !!item.url;
  // Mock aşaması: platform.twitter.com embed
  const hasTwitterEmbed = isVideo && !!item.tweetId && !item.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full"
        style={{ maxWidth: hasTwitterEmbed ? 560 : 900 }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── 1. Gerçek API: video.twimg.com MP4 ── */}
        {hasDirectVideo && (
          <video
            src={item.url}
            poster={item.thumbnail}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[90vh] rounded-2xl shadow-2xl bg-black"
          />
        )}

        {/* ── 2. Mock: Twitter platform embed ── */}
        {hasTwitterEmbed && (
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#15202b]">
            {/* Başlık */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              <span className="text-white/60 text-xs">Tweet</span>
            </div>
            <iframe
              src={`https://platform.twitter.com/embed/Tweet.html?id=${item.tweetId}&theme=dark&chrome=nofooter`}
              title="Tweet"
              className="w-full border-0"
              style={{ height: 480 }}
              scrolling="no"
              allowFullScreen
            />
          </div>
        )}

        {/* ── 3. Görsel ── */}
        {!isVideo && item.url && (
          <img
            src={item.url}
            alt=""
            className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        )}
      </div>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/20 text-xs pointer-events-none">
        ESC veya dışarı tıkla → kapat
      </p>
    </div>
  );
}
