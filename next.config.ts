import type { NextConfig } from "next";
const withPWA = require("next-pwa");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
    async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json"
          }
        ]
      }
    ];
  }
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
})(nextConfig);