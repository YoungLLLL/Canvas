import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.artic.edu", pathname: "/iiif/2/**" }],
  },
};

export default nextConfig;
