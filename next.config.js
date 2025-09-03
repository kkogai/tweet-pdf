/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath: '/tweet-pdf',
  // assetPrefix: '/tweet-pdf',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig