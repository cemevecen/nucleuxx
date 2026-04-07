"use client";

import { Category } from "@/data/categories";
import { Tweet, MediaItem } from "@/data/mockTweets";
import TweetCard from "./TweetCard";

interface Props {
  category: Category;
  tweets: Tweet[];
  onMediaClick: (item: MediaItem) => void;
}

export default function CategoryColumn({ category, tweets, onMediaClick }: Props) {
  return (
    /*
      Desktop (md+): h-full → scroll container'ın tamamını doldur, içten scroll
      Mobile:        w-[88vw], h-auto → tweet sayısı kadar uzasın, sayfa scroll eder
    */
    <div className="flex-shrink-0 w-[88vw] sm:w-[340px] flex flex-col md:h-full">

      {/* Kolon başlığı — sticky on desktop */}
      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-4 mb-3 flex items-center gap-3 flex-shrink-0`}>
        <span className="text-2xl">{category.emoji}</span>
        <div>
          <h2 className="font-bold text-white text-base leading-tight">{category.name}</h2>
          <p className="text-white/70 text-xs">{category.accounts.length} hesap</p>
        </div>
        <div className="ml-auto flex -space-x-2">
          {category.accounts.slice(0, 3).map((acc) => (
            <div
              key={acc.handle}
              className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden flex items-center justify-center text-xs font-bold text-white"
              title={acc.name}
            >
              {acc.name[0]}
            </div>
          ))}
        </div>
      </div>

      {/*
        Tweet listesi:
        Desktop: flex-1 + overflow-y-auto → kolon içinde scroll
        Mobile:  h-auto → tüm tweet'ler açılır, sayfa scroll eder
      */}
      <div className="space-y-3 pr-1 scrollbar-thin md:flex-1 md:overflow-y-auto">
        {tweets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/20">
            <span className="text-4xl mb-2">🫙</span>
            <p className="text-sm">Henüz tweet yok</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} onMediaClick={onMediaClick} />
          ))
        )}
      </div>
    </div>
  );
}
