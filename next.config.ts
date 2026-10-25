import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  images: {
    remotePatterns: [
      // Backend-served destination images (dev server on :5000)
      { protocol: "http", hostname: "localhost", port: "5000" },
      // Destination images hosted on Unsplash
      { protocol: "https", hostname: "images.unsplash.com" },
      // Google account avatars (Google sign-in profile photos)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
