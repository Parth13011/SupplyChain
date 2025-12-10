/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export ONLY for IPFS deployment (not for localhost dev)
  // Set BUILD_FOR_IPFS=true to enable static export
  ...(process.env.BUILD_FOR_IPFS === 'true' && { output: 'export' }),
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  // Configure asset paths for IPFS (relative paths)
  // Empty assetPrefix means relative paths, which work on IPFS
  assetPrefix: '',
  basePath: '',
  // Trailing slash for IPFS compatibility
  trailingSlash: true,
  // Build optimizations for faster builds
  swcMinify: true, // Use SWC minifier (faster than Terser)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Optimize webpack
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Speed up builds by reducing optimizations during development
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    
    return config;
  },
  // TypeScript: skip type checking during build (faster, but less safe)
  typescript: {
    // ⚠️ Warning: This skips type checking - only use if types are already verified
    ignoreBuildErrors: true, // Skip type checking for faster builds
  },
  // ESLint: skip linting during build (faster)
  eslint: {
    // ⚠️ Warning: This skips linting - only use if code is already linted
    ignoreDuringBuilds: true, // Skip linting for faster builds
  },
};

module.exports = nextConfig;

