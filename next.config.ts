import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Strict typechecking runs via `npm run typecheck` & CI; skip redundant pass inside `next build`
      ignoreBuildErrors: true,
    },
    // Allow access to remote image placeholder.
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // This allows any path under the hostname
        },
      ],
    },
    output: 'standalone',
    outputFileTracingExcludes: {
      '*': [
        '**/*.map',
        '**/*.d.ts',
        '**/node_modules/typescript/**',
        '**/node_modules/eslint/**',
        '**/node_modules/@swc/core*/**',
        '**/node_modules/sharp/**',
        '**/node_modules/@img/**',
        '**/node_modules/firebase-tools/**',
        '**/node_modules/@google-cloud/**',
        '**/node_modules/@electric-sql/**',
        '**/node_modules/pglite-2/**',
        '**/node_modules/next/dist/server/dev/next-dev-server.js',
        '**/node_modules/next/dist/server/dev/hot-reloader-webpack.js',
        '**/node_modules/next/dist/server/dev/hot-reloader-turbopack.js',
        '**/node_modules/next/dist/server/dev/turbopack/**',
        '**/node_modules/next/dist/server/dev/turbopack-utils.js',
        '**/node_modules/next/dist/build/webpack/**',
        '**/node_modules/next/dist/build/webpack-config.js',
        '**/node_modules/next/dist/build/babel/**',
        '**/node_modules/next/dist/build/swc/**',
        '**/node_modules/next/dist/build/turbopack-build/**',
        '**/node_modules/next/dist/build/templates/**',
        '**/node_modules/next/dist/build/polyfills/**',
        '**/node_modules/next/dist/compiled/babel/bundle.js',
        '**/node_modules/next/dist/compiled/babel-packages/**',
        '**/node_modules/next/dist/compiled/webpack/**',
        '**/node_modules/next/dist/compiled/terser/**',
        '**/node_modules/next/dist/compiled/amphtml-validator/**',
        '**/node_modules/next/dist/compiled/@ampproject/**',
        '**/node_modules/next/dist/compiled/edge-runtime/**',
        '**/node_modules/next/dist/compiled/next-server/*-experimental.*',
        '**/node_modules/next/dist/compiled/next-server/*-turbo*',
        '**/node_modules/next/dist/compiled/next-server/*.dev.js',
        '.playwright-cli/**',
        'plugin/**',
      ],
    },
    transpilePackages: ['motion'],
    webpack: (config, {dev}) => {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
}
