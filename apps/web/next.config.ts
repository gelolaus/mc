import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'mc-heads.net', pathname: '/avatar/**' }],
  },
};

export default config;
