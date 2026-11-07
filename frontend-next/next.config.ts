import type { NextConfig } from "next";

const apiProxyUrl = process.env.API_PROXY_URL ?? "http://localhost:5000";
const imageUrl = new URL(
  process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:9000",
);

const nextConfig: NextConfig = {
  transpilePackages: ["@rebuy/contracts"],
  images: {
    remotePatterns: [
      {
        protocol: imageUrl.protocol.replace(":", "") as "http" | "https",
        hostname: imageUrl.hostname,
        ...(imageUrl.port ? { port: imageUrl.port } : {}),
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
