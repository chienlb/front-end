import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-e9c6e32e3a214a6882903c35717e07d2.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gutenberg.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gutenberg.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "supersimple.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.supersimple.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
