import type { NextConfig } from "next";

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
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src https://platform.twitter.com https://twitter.com https://www.youtube.com https://www.youtube-nocookie.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
