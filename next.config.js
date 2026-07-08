/** @type {import('next').NextConfig} */

const nextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },


  typescript: {
    ignoreBuildErrors: false,
  },


  reactStrictMode: true,

}


module.exports = nextConfig