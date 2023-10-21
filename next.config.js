/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['snzxbsauvwneqtlnuxqy.supabase.co'] },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];
    return config;
  },
};

module.exports = nextConfig;
