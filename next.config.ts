import type { NextConfig } from 'next';

const remotePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
  {
    protocol: 'https',
    hostname: 'images.pexels.com',
    pathname: '/photos/**',
  },
  {
    protocol: 'https',
    hostname: 'upload.wikimedia.org',
    pathname: '/wikipedia/commons/**',
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      remotePatterns.push({
        protocol: parsed.protocol.slice(0, -1) as 'http' | 'https',
        hostname: parsed.hostname,
        pathname: '/storage/v1/object/public/product-images/**',
      });
    }
  } catch {
    // Runtime configuration validation reports invalid Supabase URLs separately.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
