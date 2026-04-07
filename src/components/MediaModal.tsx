"use client";

import { useEffect } from "react";
import { MediaItem } from "@/data/mockTweets";

interface Props {
  item: MediaItem;
  onClose: () => void;
}

export default function MediaModal({ item, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isVideo = item.type === "video";
  const isYouTube = isVideo && !!item.youtubeId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all"
        aria-label="Kapat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Media container */}
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isYouTube ? (
          /* YouTube embed */
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : isVideo && item.url ? (
          /* Direct video */
          <video
            src={item.url}
            poster={item.thumbnail}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[90vh] rounded-2xl shadow-2xl bg-black"
          />
        ) : (
          /* Image */
          <img
            src={item.url}
            alt="Media"
            className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        )}
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">
        ESC veya dışarı tıkla → kapat
      </p>
    </div>
  );
}
