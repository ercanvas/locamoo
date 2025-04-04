/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        unoptimized: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ['mongodb'],
        outputStandalone: true,
        timeoutInMs: 15000,
    },
    serverRuntimeConfig: {
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/locamoo',
            options: {
                connectTimeoutMS: 10000,
                socketTimeoutMS: 10000,
                maxPoolSize: 10,
            }
        }
    },
    env: {
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://locamoo.onrender.com',
    }
};

export default nextConfig;
