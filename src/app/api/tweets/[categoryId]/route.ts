import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_CATEGORIES } from "@/data/categories";
import { MOCK_TWEETS } from "@/data/mockTweets";
import { fetchRssForHandles } from "@/lib/rss";

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

  const handles = category.accounts.map((a) => a.handle);

  // 1. RSS ile gerçek içerik
  const rss = await fetchRssForHandles(handles);
  if (rss.length > 0) {
    // RSS desteklemeyen hesaplar için mock tweet'leri ekle
    const rssHandles = new Set(rss.map((t) => t.authorHandle));
    const mockFill = (MOCK_TWEETS[categoryId] ?? []).filter(
      (t) => !rssHandles.has(t.authorHandle)
    );
    const merged = [...rss, ...mockFill].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(merged, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        "X-Data-Source": "rss",
      },
    });
  }

  // 2. Fallback: mock
  return NextResponse.json(MOCK_TWEETS[categoryId] ?? [], {
    headers: { "X-Data-Source": "mock-fallback" },
  });
}
