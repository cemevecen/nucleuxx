import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DEFAULT_CATEGORIES } from "@/data/categories";
import { MOCK_TWEETS } from "@/data/mockTweets";
import { fetchRssForHandles } from "@/lib/rss";
import {
  fetchRapidTweetsForCategory,
  getRapidRatePolicySummary,
  isRapidTwitterConfigured,
} from "@/lib/rapidTwitter";

/** Canlı timeline: RapidAPI + RSS için kısa önbellek; CDN’de kullanıcıya özel cache yok. */
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const { categoryId } = await params;

  const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }

  const handles = category.accounts.map((a) => a.handle);

  // 1. RapidAPI (twitter-api45 timeline) — gerçek zamanlı X gönderileri
  if (isRapidTwitterConfigured()) {
    const policy = getRapidRatePolicySummary();
    const rapid = await fetchRapidTweetsForCategory(category.accounts);
    if (rapid.length > 0) {
      const rapidHandles = new Set(rapid.map((t) => t.authorHandle));
      const mockFill = (MOCK_TWEETS[categoryId] ?? []).filter(
        (t) => !rapidHandles.has(t.authorHandle)
      );
      const merged = [...rapid, ...mockFill].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const maxAge = Math.min(300, Math.max(15, policy.cacheTtlSec));
      return NextResponse.json(merged, {
        headers: {
          "Cache-Control": `private, max-age=${maxAge}`,
          "X-Data-Source": "rapidapi-twitter",
          "X-Rapid-Cache-TTL-Sec": String(policy.cacheTtlSec),
          "X-Rapid-Min-Delay-Ms": String(policy.minDelayMs),
          "X-Rapid-Max-Handles": String(policy.maxHandles),
        },
      });
    }
  }

  // 2. RSS
  const rss = await fetchRssForHandles(handles);
  if (rss.length > 0) {
    const rssHandles = new Set(rss.map((t) => t.authorHandle));
    const mockFill = (MOCK_TWEETS[categoryId] ?? []).filter(
      (t) => !rssHandles.has(t.authorHandle)
    );
    const merged = [...rss, ...mockFill].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(merged, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Data-Source": "rss",
      },
    });
  }

  // 3. Mock
  return NextResponse.json(MOCK_TWEETS[categoryId] ?? [], {
    headers: { "X-Data-Source": "mock-fallback" },
  });
}
