import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Configuration Turbopack (Next.js 16)
  turbopack: {
    // Configuration des rules si nécessaire
  },
  
  // Optimisations images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "72y8mozbqb.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
    // Désactive l'optimisation pour export statique si nécessaire
    // unoptimized: process.env.EXPORT_STATIC === "true",
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  
  // Optimisations build
  poweredByHeader: false, // Cache le header X-Powered-By
  compress: true, // Active la compression gzip
  
  // Configuration pour le trailing slash (optionnel)
  // trailingSlash: true,
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  
  // Redirections (si nécessaire)
  async redirects() {
    return [];
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
