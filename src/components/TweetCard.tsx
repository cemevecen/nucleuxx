"use client";

import { Tweet, MediaItem } from "@/data/mockTweets";
import { timeAgo, formatCount } from "@/lib/timeAgo";
import Image from "next/image";

interface Props {
  tweet: Tweet;
  onMediaClick: (item: MediaItem) => void;
}

export default function TweetCard({ tweet, onMediaClick }: Props) {
  const media = tweet.media ?? [];

  return (
    <article className="bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
          <Image
            src={tweet.authorAvatar}
            alt={tweet.authorName}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/60 select-none">
            {tweet.authorName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white text-sm truncate">
              {tweet.authorName}
            </span>
            {tweet.isVerified && (
              <svg className="w-4 h-4 text-sky-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2c-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22c1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12h.25zm-13.42 4.29L5 12.46l1.76-1.76 2.07 2.07 4.71-4.71L15.3 9.8l-6.47 6.49z" />
              </svg>
            )}
            <span className="text-white/40 text-xs ml-auto flex-shrink-0">
              {timeAgo(tweet.timestamp)}
            </span>
          </div>
          <span className="text-white/40 text-xs">@{tweet.authorHandle}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-white/90 text-sm leading-relaxed mb-3">
        {tweet.content}
      </p>

      {/* Media */}
      {media.length > 0 && (
        <div
          className={`mb-3 rounded-xl overflow-hidden gap-1 ${
            media.length === 1
              ? ""
              : media.length === 2
              ? "grid grid-cols-2"
              : "grid grid-cols-2"
          }`}
        >
          {media.slice(0, 4).map((item, i) => {
            const isVideo = item.type === "video";
            const src = isVideo ? item.thumbnail ?? item.url : item.url;
            const isLastOfThree = media.length === 3 && i === 2;

            return (
              <button
                key={i}
                onClick={() => onMediaClick(item)}
                className={`relative overflow-hidden bg-white/5 transition-opacity hover:opacity-90 active:opacity-75 ${
                  media.length === 1 ? "w-full rounded-xl" : "rounded-lg"
                } ${isLastOfThree ? "col-span-2" : ""}`}
                style={{ aspectRatio: media.length === 1 ? "16/9" : "4/3" }}
                aria-label={isVideo ? "Videoyu oynat" : "Görseli büyüt"}
              >
                {/* Image */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Video play overlay */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {/* Duration badge placeholder */}
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                      video
                    </span>
                  </div>
                )}

                {/* +N more overlay */}
                {media.length > 4 && i === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-white font-bold text-lg">+{media.length - 4}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between text-white/30 text-xs">
        <button className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {formatCount(tweet.replies)}
        </button>
        <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {formatCount(tweet.retweets)}
        </button>
        <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {formatCount(tweet.likes)}
        </button>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {formatCount(tweet.views)}
        </span>
      </div>
    </article>
  );
}
