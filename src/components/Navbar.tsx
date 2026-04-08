"use client";

import { Category } from "@/data/categories";
import { logout } from "@/app/actions/auth";

interface Props {
  categories: Category[];
  onEditChannels: () => void;
}

export default function Navbar({ categories, onEditChannels }: Props) {
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
          <div
            key={cat.id}
            className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1 flex-shrink-0"
          >
            <span className="text-white/60 text-xs font-medium">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Mobile: category count pill */}
      <div className="flex lg:hidden items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
        <span className="text-white/50 text-xs">{categories.length} kanal aktif</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Edit button */}
        <button
          onClick={onEditChannels}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium transition-colors border border-white/10 hover:border-white/20 rounded-full px-3 sm:px-4 py-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Düzenle</span>
        </button>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors border border-white/5 hover:border-white/15 rounded-full px-3 sm:px-4 py-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </form>
      </div>
    </header>
  );
}
