"use client";

import Link from "next/link";
import { Category } from "@/data/categories";
import { logout } from "@/app/actions/auth";

interface Props {
  categories: Category[];
}

export default function Navbar({ categories }: Props) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 flex-shrink-0 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <h1 className="text-lg sm:text-xl font-black tracking-tighter text-white">nucleuxx</h1>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <span className="hidden sm:block text-white/30 text-xs">{categories.length} kanal</span>
      </div>

      {/* Channel pills — hidden on mobile */}
      <div className="hidden lg:flex items-center gap-2 overflow-hidden flex-1 mx-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="flex items-center bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 rounded-full px-3 py-1 flex-shrink-0 transition-all"
          >
            <span className="text-white/60 hover:text-white/90 text-xs font-medium transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* Mobile: category count pill */}
      <div className="flex lg:hidden items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
        <span className="text-white/50 text-xs">{categories.length} kanal aktif</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Profile link */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 hover:border-white/30 flex items-center justify-center transition-all overflow-hidden"
          title="Profil"
        >
          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
