import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["drive.google.com"],
  },
};

export default nextConfig;
