/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactCompiler: true,

  allowedDevOrigins: ["10.0.0.149"],

  images: {
    // In development, bypass Next.js image optimisation entirely so the
    // local backend (localhost:8080) is served directly to the browser
    // without hitting Next's private-IP security block.
    // In production, optimisation is active and remotePatterns are enforced.
    unoptimized: isDev,

    qualities: [70, 75, 80],

    remotePatterns: [
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },

      // AWS S3 (any region / any bucket)
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },

      // Backend — local dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },

      // Backend — production Railway
      {
        protocol: 'https',
        hostname: 'afrochow-backendnew-production.up.railway.app',
        pathname: '/**',
      },

      // Backend — custom domain
      {
        protocol: 'https',
        hostname: 'api.afrochow.ca',
        pathname: '/**',
      },

      // Stock / placeholder image providers
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow Google OAuth popup to post the auth code back via postMessage.
          // 'same-origin' blocks window.closed calls from cross-origin popups,
          // breaking the auth-code flow. 'same-origin-allow-popups' fixes this.
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;