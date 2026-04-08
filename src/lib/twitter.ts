import { unstable_cache } from "next/cache";
import { Tweet } from "@/data/mockTweets";

// ─── Twitter API v2 tipler ────────────────────────────────────────────────────

interface TwUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
}

interface TwMedia {
  media_key: string;
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
}

interface TwTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    reply_count: number;
    retweet_count: number;
    like_count: number;
    impression_count: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

interface TwSearchResponse {
  data?: TwTweet[];
  includes?: {
    users?: TwUser[];
    media?: TwMedia[];
  };
  meta?: { result_count: number };
}

// ─── Mapper: Twitter API v2 → uygulama içi Tweet ─────────────────────────────

function mapTweet(tw: TwTweet, users: TwUser[], mediaMap: Map<string, TwMedia>): Tweet {
  const user = users.find((u) => u.id === tw.author_id);
  const mediaItems = (tw.attachments?.media_keys ?? [])
    .map((key) => mediaMap.get(key))
    .filter(Boolean) as TwMedia[];

  return {
    id: tw.id,
    authorHandle: user?.username ?? "unknown",
    authorName: user?.name ?? "Unknown",
    authorAvatar: user?.profile_image_url?.replace("_normal", "_bigger") ??
      `https://unavatar.io/twitter/${user?.username ?? "unknown"}`,
    content: tw.text,
    timestamp: tw.created_at,
    replies: tw.public_metrics.reply_count,
    retweets: tw.public_metrics.retweet_count,
    likes: tw.public_metrics.like_count,
    views: tw.public_metrics.impression_count,
    isVerified: user?.verified ?? false,
    media: mediaItems.length > 0
      ? mediaItems.map((m) => ({
          type: m.type === "photo" ? "image" : "video",
          url: m.type === "photo" ? m.url : undefined,
          thumbnail: m.preview_image_url ?? m.url,
        }))
      : undefined,
  };
}

// ─── Asıl fetch — Bearer Token ile Twitter API v2 ────────────────────────────

async function _fetchTweets(handles: string[], maxResults = 10): Promise<Tweet[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) return [];

  // "from:handle1 OR from:handle2 ..." — retweet'leri hariç tut
  const query = handles.map((h) => `from:${h}`).join(" OR ") + " -is:retweet -is:reply";

  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(maxResults, 100)),
    "tweet.fields": "created_at,author_id,public_metrics,attachments",
    expansions: "author_id,attachments.media_keys",
    "user.fields": "name,username,profile_image_url,verified",
    "media.fields": "type,url,preview_image_url",
  });

  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }, // Next.js fetch cache: 1 saat
    }
  );

  if (!res.ok) {
    console.error("[twitter] API hatası:", res.status, await res.text());
    return [];
  }

  const json: TwSearchResponse = await res.json();
  if (!json.data?.length) return [];

  const users = json.includes?.users ?? [];
  const mediaMap = new Map<string, TwMedia>(
    (json.includes?.media ?? []).map((m) => [m.media_key, m])
  );

  return json.data.map((tw) => mapTweet(tw, users, mediaMap));
}

// ─── Dışa açılan fonksiyon: unstable_cache ile sarılmış ──────────────────────
// Her kategori bağımsız cache slot'u. Revalidation: 1 saat.

export const fetchTweetsByHandles = unstable_cache(
  _fetchTweets,
  ["twitter-tweets"],
  { revalidate: 3600 }
);
