"use client";

import { useEffect, useRef } from "react";
import { MediaItem } from "@/data/mockTweets";
import Image from "next/image";

interface Props {
  item: MediaItem;
  onClose: () => void;
}

export default function MediaModal({ item, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

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

      {/* Media container — stop click propagation so clicking media doesn't close */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" ? (
          <div className="relative w-full" style={{ maxHeight: "90vh" }}>
            <img
              src={item.url}
              alt="Media"
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={item.url}
            poster={item.thumbnail}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[90vh] rounded-2xl shadow-2xl bg-black"
          />
        )}
      </div>

      {/* Hint */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs">
        ESC veya dışarı tıkla → kapat
      </p>
    </div>
  );
}
