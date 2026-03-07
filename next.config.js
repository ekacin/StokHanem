/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Required to allow Next.js to import Zbar Webassembly files
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };

        // Webpack 5 requires enabling experimental WASM support usually
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            syncWebAssembly: true,
        };

        return config;
    },
    // Silence Turbopack warning when using custom webpack config in Next 16
    turbopack: {},
};

module.exports = nextConfig;
