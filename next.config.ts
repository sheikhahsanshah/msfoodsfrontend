import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['res.cloudinary.com', 'https://res.cloudinary.com/'],
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
};

export default nextConfig;
