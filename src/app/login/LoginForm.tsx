"use client";

import { useActionState, useState } from "react";
import {
  loginWithCredentials,
  loginWithGoogle,
  loginWithTwitter,
} from "@/app/actions/auth";
import type { OAuthUiFlags } from "@/lib/costGuards";

type Props = { oauth: OAuthUiFlags };

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${className ?? ""}`}>
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
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
    </span>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${className ?? ""}`}>
      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>
  );
}

const oauthBtn =
  "group flex w-full items-center gap-3 rounded-xl border border-neutral-700/90 bg-neutral-950/70 px-4 py-3.5 text-left text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:border-neutral-500 hover:bg-neutral-900/80 active:scale-[0.99]";

const fieldClass =
  "w-full rounded-xl border border-neutral-700/90 bg-neutral-950/40 py-3.5 px-4 text-sm text-white placeholder:text-neutral-500 shadow-inner shadow-black/20 transition focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/40";

export default function LoginForm({ oauth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [state, action, pending] = useActionState(loginWithCredentials, undefined);

  const showOAuthBlock = oauth.google || oauth.twitter;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030304] text-white">
      {/* Arka plan: alttan mor-mavi ışı + hafif vignette */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              "radial-gradient(ellipse 120% 70% at 50% 108%, rgba(76, 29, 149, 0.42) 0%, rgba(15, 23, 42, 0.35) 42%, transparent 68%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 70% 100%, rgba(37, 99, 235, 0.14) 0%, transparent 55%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030304]/80 via-transparent to-[#030304]/95" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-14 sm:px-6">
        <div className="w-full max-w-[380px]">
          {/* Başlık */}
          <header className="mb-10 text-center">
            <h1 className="text-[1.85rem] font-black tracking-tight text-white sm:text-[2rem]">nucleuxx</h1>
            <p className="mt-2 text-sm text-neutral-500">Twitter feed agregatörü</p>
          </header>

          {oauth.oauthGloballyDisabled && (
            <p className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3.5 py-2.5 text-center text-[11px] leading-relaxed text-amber-100/85">
              OAuth kapalı (<code className="rounded bg-black/30 px-1 text-amber-200/90">AUTH_DISABLE_OAUTH</code>
              ). Yalnızca e-posta; Google/X kotası kullanılmaz.
            </p>
          )}

          {showOAuthBlock && (
            <div className="mb-8 space-y-3">
              {oauth.google && (
                <form action={loginWithGoogle}>
                  <button type="submit" className={oauthBtn}>
                    <GoogleGlyph />
                    <span className="flex-1 text-center sm:text-left">Google ile devam et</span>
                  </button>
                </form>
              )}
              {oauth.twitter && (
                <form action={loginWithTwitter}>
                  <button type="submit" className={oauthBtn}>
                    <XGlyph />
                    <span className="flex-1 text-center sm:text-left">X ile devam et</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {showOAuthBlock && (
            <div className="mb-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-neutral-700/80" />
              <span className="shrink-0 text-xs font-medium text-neutral-600">ya da</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neutral-700 to-neutral-700/80" />
            </div>
          )}

          {/* Giriş / Kayıt */}
          <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-black/35 p-1 shadow-inner shadow-black/40 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-400"
              }`}
            >
              Giriş yap
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-400"
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
                className={fieldClass}
                placeholder="Adın Soyadın"
              />
            )}

            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={fieldClass}
              placeholder="Email adresi"
            />

            <input
              name="password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              minLength={mode === "register" ? 8 : 1}
              className={fieldClass}
              placeholder={mode === "register" ? "Şifre (en az 8 karakter)" : "Şifre"}
            />

            {state?.error && (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black shadow-lg shadow-black/25 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "…" : mode === "login" ? "Giriş yap" : "Kayıt ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
