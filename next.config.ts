import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{
            hostname: 'readonlydemo.vendure.io',
        }]
    }
};

export default nextConfig;
