import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rebuy/contracts"],
};

export default nextConfig;
