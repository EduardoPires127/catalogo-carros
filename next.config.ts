import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.mercadolibre.com",
      },
    ],
  },
};

export default nextConfig;
