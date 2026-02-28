/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Include data files in serverless function bundles on Vercel
  outputFileTracingIncludes: {
    "/api/jobs": ["./data/**/*"],
    "/api/results": ["./data/**/*"],
    "/api/costs": ["./data/**/*"],
  },
};

export default nextConfig;
