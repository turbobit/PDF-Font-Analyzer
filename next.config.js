/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['better-sqlite3'],
    },
};

module.exports = nextConfig;
