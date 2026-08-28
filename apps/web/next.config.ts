import type { NextConfig } from 'next';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const repoName =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\//, '') || 'shifts-app';

// Разрешённые origin'ы для dev (через запятую)
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  ...(isProd && {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),

  // Разрешаем cross-origin HMR в development
  ...(allowedDevOrigins.length > 0 && {
    allowedDevOrigins,
  }),

  turbopack: {
    root: path.join(__dirname, '../..'),
  },

  transpilePackages: ['@shifts/types'],
  reactStrictMode: true,
};

export default nextConfig;
