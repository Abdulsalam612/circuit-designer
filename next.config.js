/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is to fix the issue with the canvas module
    if (isServer) {
      config.externals = [...config.externals, 'canvas']
    }
    
    return config
  },
}

module.exports = nextConfig
