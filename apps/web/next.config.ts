import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // static export -> deployed to Cloudflare Pages, no server runtime
  images: { unoptimized: true }, // next/image optimization needs a server; skip it for static export
};

export default nextConfig;
