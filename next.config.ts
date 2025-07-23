import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ztdkbucjuynmoesbttje.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // SEO and Performance Optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Enable static optimization
  output: 'standalone',
  
  // Compression and optimization
  compress: true,
  
  // Security headers for SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/english-course',
        destination: '/courses',
        permanent: true,
      },
      {
        source: '/learn-english',
        destination: '/learn-english-malaysia',
        permanent: true,
      },
      {
        source: '/english-training',
        destination: '/courses',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
