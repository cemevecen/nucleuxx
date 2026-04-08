"use client";

import { Tweet, MediaItem } from "@/data/mockTweets";
import { formatTweetTime, formatCount } from "@/lib/timeAgo";
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
            <span
              className="text-white/40 text-xs ml-auto flex-shrink-0 font-mono tabular-nums"
              title={new Date(tweet.timestamp).toLocaleString("tr-TR")}
            >
              {formatTweetTime(tweet.timestamp)}
            </span>
          </div>
          <span className="text-white/40 text-xs">@{tweet.authorHandle}</span>
        </div>
      </div>

      {/* Content — uzun tweetler tamamen görünür */}
      <p className="text-white/90 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
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
            const isLastOfThree = media.length === 3 && i === 2;
            const sizeClasses = `${media.length === 1 ? "w-full rounded-xl" : "rounded-lg"} ${
              isLastOfThree ? "col-span-2" : ""
            }`;
            const aspectStyle = { aspectRatio: media.length === 1 ? "16/9" : "4/3" };

            // ── Video: feedde doğrudan oynar, detaya gitmeye gerek yok
            if (isVideo) {
              // Gerçek API url'i (video.twimg.com mp4) varsa inline <video>,
              // yoksa (mock) Twitter embed fallback.
              const hasDirectVideo = !!item.url;
              const hasTwitterEmbed = !item.url && !!item.tweetId;

              return (
                <div
                  key={i}
                  className={`relative overflow-hidden bg-black ${sizeClasses}`}
                  style={aspectStyle}
                >
                  {hasDirectVideo && (
                    <video
                      src={item.url}
                      poster={item.thumbnail}
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {hasTwitterEmbed && (
                    <iframe
                      src={`https://platform.twitter.com/embed/Tweet.html?id=${item.tweetId}&theme=dark&chrome=nofooter`}
                      title="Tweet video"
                      className="absolute inset-0 w-full h-full border-0"
                      scrolling="no"
                      allowFullScreen
                    />
                  )}
                  {!hasDirectVideo && !hasTwitterEmbed && item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              );
            }

            // ── Görsel: tıklayınca modal ile büyüt
            return (
              <button
                key={i}
                onClick={() => onMediaClick(item)}
                className={`relative overflow-hidden bg-white/5 transition-opacity hover:opacity-90 active:opacity-75 ${sizeClasses}`}
                style={aspectStyle}
                aria-label="Görseli büyüt"
              >
                <img
                  src={item.url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />

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
        {/* Reply */}
        <button className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
          </svg>
          {formatCount(tweet.replies)}
        </button>
        {/* Retweet */}
        <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
          </svg>
          {formatCount(tweet.retweets)}
        </button>
        {/* Like */}
        <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
          </svg>
          {formatCount(tweet.likes)}
        </button>
        {/* Views */}
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
          </svg>
          {formatCount(tweet.views)}
        </span>
      </div>
    </article>
  );
}
