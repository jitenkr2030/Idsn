/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z-cdn.chatglm.cn',
      },
    ],
  },
  // Fix for Next.js 16 build
  serverExternalPackages: ['@prisma/client'],
  // Exclude examples directory from build
  outputFileTracingExcludes: {
    '*': ['examples/**/*', 'skills/**/*'],
  },
}

export default nextConfig