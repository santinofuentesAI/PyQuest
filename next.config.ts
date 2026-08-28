import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Preview and some browsers hit the dev server as 127.0.0.1, which Next
  // treats as a different origin from localhost and blocks /_next chunks.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
