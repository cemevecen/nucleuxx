import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
/** Vercel vb. ortamlarda Image Optimization isteklerini kapatır (hosting kotası). Yerelde genelde gerekmez. */
const imageUnoptimized = process.env.NEXT_IMAGE_UNOPTIMIZED === "1" || process.env.NEXT_IMAGE_UNOPTIMIZED === "true";

const nextConfig: NextConfig = {
  images: {
    unoptimized: imageUnoptimized,
    remotePatterns: [
      { protocol: "https", hostname: "unavatar.io" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async headers() {
    const base: { key: string; value: string }[] = [
      {
        key: "Content-Security-Policy",
        value:
          "frame-src https://platform.twitter.com https://twitter.com https://www.youtube.com https://www.youtube-nocookie.com;",
      },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    if (isProd) {
      base.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [{ source: "/(.*)", headers: base }];
  },
};

export default nextConfig;
