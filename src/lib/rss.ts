import { unstable_cache } from "next/cache";
import { Tweet } from "@/data/mockTweets";

// ─── Twitter handle → RSS URL eşleşmesi ──────────────────────────────────────
// Sadece gerçek RSS kaynağı olan hesaplar — diğerleri mock'ta kalır

export const RSS_FEEDS: Record<string, { url: string; name: string; avatar: string }> = {
  // Teknoloji
  webrazzi:       { url: "https://webrazzi.com/feed/",                          name: "Webrazzi",        avatar: "https://unavatar.io/twitter/webrazzi" },
  shiftdelete_net:{ url: "https://shiftdelete.net/feed",                        name: "ShiftDelete",     avatar: "https://unavatar.io/twitter/shiftdelete_net" },
  donanimhaber:   { url: "https://donanimhaber.com/rss",                        name: "Donanım Haber",   avatar: "https://unavatar.io/twitter/donanimhaber" },
  mobilsahne:     { url: "https://mobilsahne.com/feed/",                        name: "Mobil Sahne",     avatar: "https://unavatar.io/twitter/mobilsahne" },

  // Türkiye (haber)
  hurriyet:       { url: "https://www.hurriyet.com.tr/rss/gundem",              name: "Hürriyet",        avatar: "https://unavatar.io/twitter/hurriyet" },
  cnnturk:        { url: "https://www.cnnturk.com/feed/rss/all/news",           name: "CNN Türk",        avatar: "https://unavatar.io/twitter/cnnturk" },
  haberturk:      { url: "https://www.haberturk.com/rss",                      name: "Habertürk",       avatar: "https://unavatar.io/twitter/haberturk" },
  sabah:          { url: "https://www.sabah.com.tr/rss/anasayfa.xml",          name: "Sabah",           avatar: "https://unavatar.io/twitter/sabah" },
  sozcu_com:      { url: "https://www.sozcu.com.tr/feed/",                     name: "Sözcü",           avatar: "https://unavatar.io/twitter/sozcu_com" },
  cumhuriyetgzt:  { url: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml",   name: "Cumhuriyet",      avatar: "https://unavatar.io/twitter/cumhuriyetgzt" },
  milliyet:       { url: "https://www.milliyet.com.tr/rss/rssid/2",            name: "Milliyet",        avatar: "https://unavatar.io/twitter/milliyet" },
  ntv:            { url: "https://www.ntv.com.tr/gundem.rss",                  name: "NTV",             avatar: "https://unavatar.io/twitter/ntv" },

  // Kripto
  cointurk_net:   { url: "https://www.coin-turk.com/feed",                     name: "CoinTurk",        avatar: "https://unavatar.io/twitter/cointurk_net" },
};

// ─── Basit RSS 2.0 + Atom parser ─────────────────────────────────────────────
// Bağımlılıksız; CDATA, namespace, hem <item> hem <entry> destekler

function cdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? cdata(m[1]) : "";
}

function attr(xml: string, tagName: string, attrName: string): string {
  const m = xml.match(new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["']`, "i"));
  return m ? m[1] : "";
}

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
}

function parseRss(xml: string): RssItem[] {
  // RSS 2.0: <item>, Atom: <entry>
  const pattern = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  const results: RssItem[] = [];
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(xml)) !== null && results.length < 15) {
    const body = m[1] ?? m[2];

    // Link — RSS'de <link> ya da Atom'da <link href="...">
    let link = tag(body, "link");
    if (!link) link = attr(body, "link", "href");

    // Tarih — pubDate (RSS) veya published/updated (Atom)
    const rawDate = tag(body, "pubDate") || tag(body, "published") || tag(body, "updated");
    const pubDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

    // Görsel — media:content, media:thumbnail, enclosure, description içi <img>
    let imageUrl: string | undefined;
    const mediaContent = xml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
    const mediaThumbnail = body.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i);
    const enclosure = body.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i);
    const imgInDesc = tag(body, "description").match(/<img[^>]*src=["']([^"']+)["']/i);

    imageUrl = mediaThumbnail?.[1] ?? enclosure?.[1] ?? mediaContent?.[1] ?? imgInDesc?.[1];

    // Description — HTML tag'lerini temizle, max 280 karakter
    const rawDesc = cdata(tag(body, "description") || tag(body, "summary") || tag(body, "content"));
    const description = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);

    if (link && description) {
      results.push({
        title: cdata(tag(body, "title")),
        link,
        pubDate,
        description,
        imageUrl,
      });
    }
  }

  return results;
}

// ─── RSS item → Tweet mapper ──────────────────────────────────────────────────

function rssToTweet(
  item: RssItem,
  handle: string,
  meta: { name: string; avatar: string },
  index: number
): Tweet {
  // İçerik: başlık + açıklama (Twitter tweet stilinde)
  const content = item.title
    ? `${item.title}\n\n${item.description !== item.title ? item.description : ""}`.trim()
    : item.description;

  return {
    id: `rss-${handle}-${index}-${new Date(item.pubDate).getTime()}`,
    authorHandle: handle,
    authorName: meta.name,
    authorAvatar: meta.avatar,
    content,
    timestamp: item.pubDate,
    likes: 0,
    retweets: 0,
    replies: 0,
    views: 0,
    media: item.imageUrl ? [{ type: "image", url: item.imageUrl }] : undefined,
  };
}

// ─── Tek handle için fetch ────────────────────────────────────────────────────

async function _fetchRssFeed(handle: string): Promise<Tweet[]> {
  const meta = RSS_FEEDS[handle];
  if (!meta) return [];

  const res = await fetch(meta.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; nucleuxx-bot/1.0)" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const xml = await res.text();
  const items = parseRss(xml);
  return items.map((item, i) => rssToTweet(item, handle, meta, i));
}

// ─── Kategori içindeki tüm RSS-destekli hesaplar için paralel fetch ───────────

async function _fetchRssForHandles(handles: string[]): Promise<Tweet[]> {
  const rssHandles = handles.filter((h) => !!RSS_FEEDS[h]);
  if (rssHandles.length === 0) return [];

  const results = await Promise.allSettled(rssHandles.map(_fetchRssFeed));

  const tweets: Tweet[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") tweets.push(...r.value);
  }

  // Zaman damgasına göre yeniden sırala
  tweets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return tweets;
}

export const fetchRssForHandles = unstable_cache(
  _fetchRssForHandles,
  ["rss-feeds"],
  { revalidate: 3600 }
);
