/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    // Fully static export — this site has no API routes / server-side rendering,
    // so it can be hosted as plain static files (e.g. Cloudflare Pages).
    output: 'export',
    images: {
        // next/image's optimization API needs a server; static export has none.
        unoptimized: true
    }
};

module.exports = nextConfig;
