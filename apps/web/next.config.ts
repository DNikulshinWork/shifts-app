import type { NextConfig } from 'next';
import path from 'path';
import withPWA from '@ducanh2912/next-pwa';

// '/' (режим своего домена) превращается в '', '/shifts-app' остаётся как есть
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE: basePath }, // нормализованный префикс для клиентского кода
  ...(basePath && { basePath, assetPrefix: `${basePath}/` }),
  ...(allowedDevOrigins.length > 0 && { allowedDevOrigins }),
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
  transpilePackages: ['@shifts/types'],
  reactStrictMode: true,
};

const isProd = process.env.NODE_ENV === 'production';

export default withPWA({
  dest: 'public',
  disable: !isProd,
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
})(nextConfig);
