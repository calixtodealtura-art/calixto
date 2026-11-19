import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudinary optimiza las fotos de productos (ver src/lib/imageLoader.ts)
    loader:     'custom',
    loaderFile: './src/lib/imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig

