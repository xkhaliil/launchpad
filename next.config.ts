import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Screens merged into others (plan.md, section 7): old links still work.
  async redirects() {
    return [
      { source: "/evaluation", destination: "/dashboard", permanent: false },
      {
        source: "/cover-letters",
        destination: "/jobs?ad=generic",
        permanent: false,
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
