"use client";

import { useActionState, useState } from "react";
import {
  loginWithCredentials,
  loginWithGoogle,
  loginWithTwitter,
} from "@/app/actions/auth";
import type { OAuthUiFlags } from "@/lib/costGuards";

type Props = { oauth: OAuthUiFlags };

export default function LoginForm({ oauth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, action, pending] = useActionState(loginWithCredentials, undefined);

  const showOAuthBlock = oauth.google || oauth.twitter;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white">nucleuxx</h1>
          <p className="text-white/30 text-sm mt-1">Twitter feed agregatorü</p>
        </div>

        {oauth.oauthGloballyDisabled && (
          <p className="text-amber-200/80 text-xs bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 mb-4">
            OAuth bu ortamda kapalı (<code className="text-amber-100/90">AUTH_DISABLE_OAUTH</code>). Yalnızca
            e-posta ile giriş/kayıt; Google/X kotası kullanılmaz.
          </p>
        )}

        {showOAuthBlock && (
          <div className="space-y-3 mb-6">
            {oauth.google && (
              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google ile devam et
                </button>
              </form>
            )}

            {oauth.twitter && (
              <form action={loginWithTwitter}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium transition-all"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X ile devam et
                </button>
              </form>
            )}
          </div>
        )}

        {showOAuthBlock && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">ya da</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        <div className="flex bg-white/5 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              mode === "login" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            Giriş yap
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              mode === "register" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            Kayıt ol
          </button>
        </div>

        <form action={action} className="space-y-3">
          <input type="hidden" name="mode" value={mode} />

          {mode === "register" && (
            <input
              name="name"
              type="text"
              autoComplete="name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/30 transition-all"
              placeholder="Adın Soyadın"
            />
          )}

          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/30 transition-all"
            placeholder="Email adresi"
          />

          <input
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={mode === "register" ? 8 : 1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/30 transition-all"
            placeholder={mode === "register" ? "Şifre (en az 8 karakter)" : "Şifre"}
          />

          {state?.error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black font-semibold text-sm rounded-xl py-3 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "..." : mode === "login" ? "Giriş yap" : "Kayıt ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
