import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['res.cloudinary.com'], // ✅ Remove full URL
    },
    async redirects() {
        return [
            {
                source: '/(.*)',
                has: [
                    {
                        type: 'host',
                        value: 'www.msfoods.pk',
                    },
                ],
                destination: 'https://msfoods.pk/:path*',
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-store, max-age=0", // ✅ Prevent caching issues in production
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
