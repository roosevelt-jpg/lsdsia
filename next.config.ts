import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include seeded SQLite + Prisma engine files in serverless traces for Vercel.
  outputFileTracingIncludes: {
    "/*": ["./prisma/**/*"],
  },
  async headers() {
    return [
      {
        // Defense in depth: never serve quiz answer keys or curriculum source as static files.
        source: "/quiz-bank.json",
        headers: [{ key: "x-robots-tag", value: "noindex" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/quiz-bank.json",
        destination: "/",
        permanent: false,
      },
      {
        source: "/content/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
