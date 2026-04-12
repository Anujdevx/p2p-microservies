import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:8080/:path*', // Proxy to Spring Boot API Gateway
      },
    ];
  },
};

export default nextConfig;
