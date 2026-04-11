import "server-only";

import type { TwitterAccount } from "@/data/categories";
import type { MediaItem, Tweet } from "@/data/mockTweets";

const DEFAULT_HOST = "twitter-api45.p.rapidapi.com";
const DEFAULT_PATH = "/timeline.php";

/** Aynı Node sürecinde son timeline yanıtları (serverless’ta istek başına soğuk olabilir). */
const memoryCache = new Map<string, { ts: number; tweets: Tweet[] }>();
const MAX_CACHE_ENTRIES = 120;

/** Küresel: iki RapidAPI HTTP çağrısı arası minimum süre (rate limit dostu). */
let lastHttpRequestAt = 0;

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function effectiveMinDelayMs(): number {
  const rawDelay = process.env.RAPIDAPI_MIN_DELAY_MS;
  if (rawDelay === "0") return 0;
  if (rawDelay != null && rawDelay !== "") {
    const n = Number(rawDelay);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  const rpm = envInt("RAPIDAPI_REQUESTS_PER_MINUTE", 0);
  if (rpm > 0) return Math.max(250, Math.ceil(60_000 / rpm));
  return 2000;
}

async function throttleGlobalHttp(): Promise<void> {
  const minGap = effectiveMinDelayMs();
  if (minGap <= 0) return;
  const now = Date.now();
  const elapsed = now - lastHttpRequestAt;
  const wait = minGap - elapsed;
  if (wait > 0) await sleep(wait);
  lastHttpRequestAt = Date.now();
}

function cacheGet(handleKey: string, ttlSec: number): Tweet[] | null {
  const row = memoryCache.get(handleKey);
  if (!row) return null;
  if (Date.now() - row.ts > ttlSec * 1000) {
    memoryCache.delete(handleKey);
    return null;
  }
  return row.tweets;
}

function cacheSet(handleKey: string, tweets: Tweet[]): void {
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const first = memoryCache.keys().next().value;
    if (first) memoryCache.delete(first);
  }
  memoryCache.set(handleKey, { ts: Date.now(), tweets });
}

export function isRapidTwitterConfigured(): boolean {
  return !!process.env.RAPIDAPI_KEY?.trim();
}

/** Kota / gecikme ayarlarının özeti (log ve HTTP başlığı için). */
export function getRapidRatePolicySummary(): {
  cacheTtlSec: number;
  minDelayMs: number;
  maxHandles: number;
} {
  return {
    cacheTtlSec: envInt("RAPIDAPI_CACHE_TTL_SECONDS", 120),
    minDelayMs: effectiveMinDelayMs(),
    maxHandles: envInt("RAPIDAPI_TWITTER_MAX_HANDLES", 6),
  };
}

function extractStatusArray(payload: unknown): Record<string, unknown>[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);
  }
  if (typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const keys = ["timeline", "statuses", "tweets", "data", "results", "items"] as const;

  for (const k of keys) {
    const v = root[k];
    if (Array.isArray(v)) {
      return v.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);
    }
  }

  const nested = root.data ?? root.result ?? root.response;
  if (nested && typeof nested === "object") {
    return extractStatusArray(nested);
  }

  return [];
}

function pickUser(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const u = raw.user;
  if (u && typeof u === "object") return u as Record<string, unknown>;

  const core = raw.core;
  if (core && typeof core === "object") {
    const ur = (core as Record<string, unknown>).user_results;
    if (ur && typeof ur === "object") {
      const res = (ur as Record<string, unknown>).result;
      if (res && typeof res === "object") return res as Record<string, unknown>;
    }
  }

  const author = raw.author;
  if (author && typeof author === "object") return author as Record<string, unknown>;
  return undefined;
}

function mergeLegacy(raw: Record<string, unknown>): Record<string, unknown> {
  const leg = raw.legacy;
  if (leg && typeof leg === "object") {
    const L = leg as Record<string, unknown>;
    return { ...L, ...raw, user: L.user ?? raw.user };
  }
  return raw;
}

function parseIsoDate(s: string | undefined): string {
  if (!s) return new Date().toISOString();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function extractMedia(flat: Record<string, unknown>): MediaItem[] | undefined {
  const ee = flat.extended_entities as { media?: unknown[] } | undefined;
  const ent = flat.entities as { media?: unknown[] } | undefined;
  const media = ee?.media ?? ent?.media;
  if (!Array.isArray(media) || media.length === 0) return undefined;

  const out: MediaItem[] = [];
  for (const m of media) {
    if (!m || typeof m !== "object") continue;
    const o = m as Record<string, unknown>;
    const type = String(o.type ?? "").toLowerCase();
    const id = o.id_str ?? o.id;
    const tweetId = id != null ? String(id) : undefined;

    if (type === "video" || type === "animated_gif") {
      const variants = (o.video_info as { variants?: { url?: string; content_type?: string }[] } | undefined)?.variants;
      let url: string | undefined;
      if (variants?.length) {
        const mp4 = variants.filter((v) => v.content_type?.includes("video"));
        url = mp4.sort((a, b) => (b.url?.length ?? 0) - (a.url?.length ?? 0))[0]?.url ?? variants[0]?.url;
      }
      const thumb =
        (o.media_url_https as string | undefined) ??
        (o.media_url as string | undefined) ??
        (o.preview_image_url as string | undefined);
      if (url || thumb) {
        out.push({ type: "video", url, thumbnail: thumb, tweetId });
      }
      continue;
    }

    const img =
      (o.media_url_https as string | undefined) ??
      (o.media_url as string | undefined) ??
      (o.url as string | undefined);
    if (img) out.push({ type: "image", url: img, tweetId });
  }

  return out.length ? out : undefined;
}

function mapOne(
  raw: Record<string, unknown>,
  fallbackHandle: string,
  account: TwitterAccount
): Tweet | null {
  const flat = mergeLegacy(raw);
  const text =
    (flat.full_text as string | undefined) ??
    (flat.text as string | undefined) ??
    (flat.note_tweet as { text?: string } | undefined)?.text ??
    (flat.content as string | undefined);

  if (!text || typeof text !== "string") return null;

  const idRaw = flat.id_str ?? flat.id ?? flat.rest_id ?? flat.tweet_id ?? flat.conversation_id;
  const id = idRaw != null ? `rapid-${String(idRaw)}` : `rapid-${fallbackHandle}-${text.slice(0, 24)}-${Date.now()}`;

  const user = pickUser(flat);
  const screen =
    (user?.screen_name as string | undefined) ??
    (user?.username as string | undefined) ??
    (flat.screen_name as string | undefined) ??
    fallbackHandle;
  const name =
    (user?.name as string | undefined) ??
    (user?.display_name as string | undefined) ??
    account.name;
  const avatar =
    (user?.profile_image_url_https as string | undefined) ??
    (user?.profile_pic_url as string | undefined) ??
    (user?.avatar as string | undefined) ??
    account.avatar;

  const created =
    (flat.created_at as string | undefined) ??
    (flat.created as string | undefined) ??
    (flat.date as string | undefined) ??
    (flat.timestamp as string | undefined);

  const views = Number(flat.views_count ?? flat.view_count ?? flat.views ?? 0) || 0;

  return {
    id,
    authorHandle: String(screen).replace(/^@/, ""),
    authorName: String(name),
    authorAvatar: String(avatar),
    content: text.replace(/\s+/g, " ").trim(),
    timestamp: parseIsoDate(created),
    likes: Number(flat.favorite_count ?? flat.like_count ?? flat.likes ?? 0) || 0,
    retweets: Number(flat.retweet_count ?? flat.retweets ?? 0) || 0,
    replies: Number(flat.reply_count ?? flat.replies ?? 0) || 0,
    views,
    media: extractMedia(flat),
    isVerified: !!(user?.verified ?? flat.verified ?? user?.is_blue_verified),
  };
}

function parseTimelineJson(json: unknown, clean: string, account: TwitterAccount): Tweet[] {
  const rows = extractStatusArray(json);
  const tweets: Tweet[] = [];
  for (const row of rows) {
    const t = mapOne(row, clean, account);
    if (t) tweets.push(t);
  }
  tweets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return tweets;
}

/**
 * Tek HTTP çağrısı — küresel throttle + 429’da sınırlı yeniden deneme.
 */
async function fetchRapidTimelineNetworkOnce(
  handle: string,
  account: TwitterAccount
): Promise<{ ok: boolean; status: number; tweets: Tweet[] }> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return { ok: false, status: 0, tweets: [] };

  const host = process.env.RAPIDAPI_TWITTER_HOST?.trim() || DEFAULT_HOST;
  const path = process.env.RAPIDAPI_TWITTER_TIMELINE_PATH?.trim() || DEFAULT_PATH;
  const clean = handle.replace(/^@/, "");

  const url = new URL(`https://${host}${path}`);
  url.searchParams.set("screenname", clean);

  await throttleGlobalHttp();

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
    cache: "no-store",
  });

  if (res.status === 429) {
    return { ok: false, status: 429, tweets: [] };
  }

  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[rapidTwitter] ${clean}: HTTP ${res.status}`);
    }
    return { ok: false, status: res.status, tweets: [] };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ok: false, status: res.status, tweets: [] };
  }

  return {
    ok: true,
    status: res.status,
    tweets: parseTimelineJson(json, clean, account),
  };
}

async function fetchRapidTimelineNetwork(
  handle: string,
  account: TwitterAccount
): Promise<Tweet[]> {
  const retries = envInt("RAPIDAPI_429_RETRIES", 1);
  const backoffMs = envInt("RAPIDAPI_429_BACKOFF_MS", 3500);

  let attempt = await fetchRapidTimelineNetworkOnce(handle, account);
  if (attempt.ok) return attempt.tweets;

  if (attempt.status === 429 && retries > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[rapidTwitter] 429 — ${backoffMs}ms sonra tekrar`);
    }
    await sleep(backoffMs);
    attempt = await fetchRapidTimelineNetworkOnce(handle, account);
    if (attempt.ok) return attempt.tweets;
  }

  return [];
}

/**
 * Önbellek + sıralı çağrı (kategori içinde). Güncel içerik TTL dolunca yeniden çekilir.
 */
export async function fetchRapidTimelineForHandle(
  handle: string,
  account: TwitterAccount
): Promise<Tweet[]> {
  if (!isRapidTwitterConfigured()) return [];

  const host = process.env.RAPIDAPI_TWITTER_HOST?.trim() || DEFAULT_HOST;
  const path = process.env.RAPIDAPI_TWITTER_TIMELINE_PATH?.trim() || DEFAULT_PATH;
  const clean = handle.replace(/^@/, "");
  const cacheKey = `${host}|${path}|${clean}`;
  const ttlSec = envInt("RAPIDAPI_CACHE_TTL_SECONDS", 120);

  const hit = cacheGet(cacheKey, ttlSec);
  if (hit) return hit;

  const tweets = await fetchRapidTimelineNetwork(handle, account);
  cacheSet(cacheKey, tweets);
  return tweets;
}

/**
 * Kategori: hesaplar sırayla işlenir (aynı istek içinde patlama yok);
 * her hesap için TTL önbelleği ayrı. Birden fazla kategori aynı anda istenirse
 * paralellik hâlâ olabilir — düşük planlarda RAPIDAPI_REQUESTS_PER_MINUTE ile sıkılaştır.
 */
export async function fetchRapidTweetsForCategory(accounts: TwitterAccount[]): Promise<Tweet[]> {
  if (!isRapidTwitterConfigured() || accounts.length === 0) return [];

  const maxHandles = envInt("RAPIDAPI_TWITTER_MAX_HANDLES", 6);
  const slice = accounts.slice(0, Math.min(maxHandles, accounts.length));

  const merged: Tweet[] = [];
  for (const acc of slice) {
    const tw = await fetchRapidTimelineForHandle(acc.handle, acc);
    merged.push(...tw);
  }

  merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const cap = envInt("RAPIDAPI_TWITTER_MAX_TWEETS", 100);
  return merged.slice(0, cap);
}
