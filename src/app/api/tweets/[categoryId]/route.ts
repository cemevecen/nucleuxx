import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CATEGORIES } from "@/data/categories";
import { MOCK_TWEETS } from "@/data/mockTweets";
import { fetchTweetsByHandles } from "@/lib/twitter";

// 1 saat CDN / edge cache
export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;

  const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }

  // Bearer token yoksa mock'a düş
  if (!process.env.TWITTER_BEARER_TOKEN) {
    const mock = MOCK_TWEETS[categoryId] ?? [];
    return NextResponse.json(mock, {
      headers: { "X-Data-Source": "mock" },
    });
  }

  const handles = category.accounts.map((a) => a.handle);
  const tweets = await fetchTweetsByHandles(handles, 15);

  // API başarısız olduysa mock'a düş
  if (tweets.length === 0) {
    const mock = MOCK_TWEETS[categoryId] ?? [];
    return NextResponse.json(mock, {
      headers: { "X-Data-Source": "mock-fallback" },
    });
  }

  return NextResponse.json(tweets, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      "X-Data-Source": "twitter-api",
    },
  });
}
