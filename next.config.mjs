/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'i.pinimg.com',
          },
        ],
        domains: ['localhost', 'via.placeholder.com'],
      },
};

export default nextConfig;
