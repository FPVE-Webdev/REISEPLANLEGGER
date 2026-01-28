/** @type {import('next').NextConfig} */

// Import Sentry webpack plugin for source maps
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry configuration
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Enable silent mode in production
  silent: process.env.NODE_ENV === 'production',

  // Ignore build errors
  ignore: ['node_modules'],

  // Configure source maps
  sourcemaps: {
    // Disable uploading source maps in development
    disable: process.env.NODE_ENV !== 'production',

    // Set root directory
    setCommits: false,

    // Set release info
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // Configure what gets uploaded
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
});
