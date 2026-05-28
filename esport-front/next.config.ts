import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // nécessaire pour le Dockerfile de production
};

export default nextConfig;
