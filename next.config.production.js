import { defineConfig } from 'next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig

