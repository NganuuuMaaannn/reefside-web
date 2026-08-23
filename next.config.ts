import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable recommended app dir features if needed; keep minimal changes.
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/video/:path*',
        headers: [
          // Videos can be cached but may be large; keep a reasonable max-age.
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' },
        ],
      },
    ];
  },
};

export default nextConfig;
