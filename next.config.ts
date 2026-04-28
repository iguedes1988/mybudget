import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        // Strip protocol — Next.js matches host only
        process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, ""),
        process.env.APP_URL?.replace(/^https?:\/\//, ""),
        // Root domain fallback (users accessing apphouse.app directly)
        "apphouse.app",
        "www.apphouse.app",
        // Local dev
        "localhost:3000",
        "localhost:8080",
      ].filter(Boolean) as string[],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
