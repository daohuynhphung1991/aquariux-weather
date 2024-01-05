/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        WEATHER_URL: process.env.WEATHER_URL,
        WEATHER_API: process.env.WEATHER_API,
    }
}

module.exports = nextConfig
