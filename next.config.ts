import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // The home directory also contains a lockfile; pin the workspace root here so
  // Next.js doesn't infer it incorrectly.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
