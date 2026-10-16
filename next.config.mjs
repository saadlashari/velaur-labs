

const nextConfig = {
  ...(process.env.VELAUR_PORTABLE_BUILD==='1'?{experimental:{cpus:1,webpackBuildWorker:false}}:{}),
  webpack(config) { config.parallelism = 1; config.resolve.alias['@'] = process.cwd(); return config; },
  poweredByHeader: false,
  serverExternalPackages: ['pg'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;

