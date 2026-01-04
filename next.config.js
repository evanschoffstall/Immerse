/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  typescript: {
    // Disable overly strict prop serialization checks for client components
    // These are false positives for legitimate React patterns (contexts, callbacks, etc.)
    ignoreBuildErrors: false,
  },
  experimental: {
    // Relax type checking for client component props
    typedRoutes: false,
  },
};

module.exports = nextConfig;
