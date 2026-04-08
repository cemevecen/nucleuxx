import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unavatar.io" },
      { protocol: "https", hostname: "pbs.twimg.com" },
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
