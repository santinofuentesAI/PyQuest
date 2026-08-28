import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker copies `.next/standalone`. Vercel traces the app itself — standalone
  // there drops static assets.
  ...(!process.env.VERCEL ? { output: "standalone" as const } : {}),
  // Preview and some browsers hit the dev server as 127.0.0.1, which Next
  // treats as a different origin from localhost and blocks /_next chunks.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
