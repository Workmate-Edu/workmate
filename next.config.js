/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_URI_PRODUCTION: process.env.MONGODB_URI_PRODUCTION,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  async rewrites() {
    return [
      {
        source: '/api/socket',
        destination: '/api/socket',
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api/socket",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT,DELETE" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push({
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    })
    return config;
  }
};

module.exports = nextConfig;
