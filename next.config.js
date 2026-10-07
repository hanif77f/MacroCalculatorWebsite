const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.macrocalculators.com' }],
        destination: 'https://macrocalculators.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
