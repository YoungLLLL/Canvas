import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.artic.edu", pathname: "/iiif/2/**" }],
  },
};

export default nextConfig;
