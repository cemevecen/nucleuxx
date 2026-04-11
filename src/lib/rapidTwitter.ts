import "server-only";

import type { TwitterAccount } from "@/data/categories";
import type { MediaItem, Tweet } from "@/data/mockTweets";

const DEFAULT_HOST = "twitter-api45.p.rapidapi.com";
const DEFAULT_PATH = "/timeline.php";

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function isRapidTwitterConfigured(): boolean {
  return !!process.env.RAPIDAPI_KEY?.trim();
}

/** API yanıtından tweet benzeri nesne dizisini çıkarır (twitter-api45 yapısına toleranslı). */
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

/**
 * Tek hesap için twitter-api45 timeline (RapidAPI).
 * Anahtar yoksa boş döner.
 */
export async function fetchRapidTimelineForHandle(
  handle: string,
  account: TwitterAccount
): Promise<Tweet[]> {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return [];

  const host = process.env.RAPIDAPI_TWITTER_HOST?.trim() || DEFAULT_HOST;
  const path = process.env.RAPIDAPI_TWITTER_TIMELINE_PATH?.trim() || DEFAULT_PATH;
  const clean = handle.replace(/^@/, "");

  const url = new URL(`https://${host}${path}`);
  url.searchParams.set("screenname", clean);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[rapidTwitter] ${clean}: HTTP ${res.status}`);
    }
    return [];
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return [];
  }

  const rows = extractStatusArray(json);
  const tweets: Tweet[] = [];
  for (const row of rows) {
    const t = mapOne(row, clean, account);
    if (t) tweets.push(t);
  }

  tweets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return tweets;
}

/** Kategori: en fazla N hesap için paralel timeline, birleşik akış. */
export async function fetchRapidTweetsForCategory(accounts: TwitterAccount[]): Promise<Tweet[]> {
  if (!isRapidTwitterConfigured() || accounts.length === 0) return [];

  const maxHandles = envInt("RAPIDAPI_TWITTER_MAX_HANDLES", 6);
  const slice = accounts.slice(0, Math.min(maxHandles, accounts.length));

  const settled = await Promise.allSettled(
    slice.map((acc) => fetchRapidTimelineForHandle(acc.handle, acc))
  );

  const merged: Tweet[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled") merged.push(...s.value);
  }

  merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const cap = envInt("RAPIDAPI_TWITTER_MAX_TWEETS", 100);
  return merged.slice(0, cap);
}
