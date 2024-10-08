/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_QUESTION_SERVICE_URL:
      process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL,
    NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  },
};

export default nextConfig;
