import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Quiz answer key and other seed files live under prisma/data — never public/.
  // Block accidental static paths that would expose answer-key filenames.
  async headers() {
    return [
      {
        source: "/quiz-bank.json",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
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
