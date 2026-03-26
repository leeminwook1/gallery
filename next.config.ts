import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow images from /uploads (local)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
