/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/tweet-pdf' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/tweet-pdf' : '',
  images: {
    unoptimized: true
  },
  reactStrictMode: false,
}

module.exports = nextConfig