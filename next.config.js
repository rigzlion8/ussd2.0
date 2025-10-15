/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    AFRICASTALKING_API_KEY: process.env.AFRICASTALKING_API_KEY,
    AFRICASTALKING_USERNAME: process.env.AFRICASTALKING_USERNAME,
    AFRICASTALKING_SENDER_ID: process.env.AFRICASTALKING_SENDER_ID,
    AFRICASTALKING_SHORT_CODE: process.env.AFRICASTALKING_SHORT_CODE,
    MONGODB_URI: process.env.MONGODB_URI,
    DAILY_SUBSCRIPTION_COST: process.env.DAILY_SUBSCRIPTION_COST,
    WEEKLY_SUBSCRIPTION_COST: process.env.WEEKLY_SUBSCRIPTION_COST,
    SUBSCRIPTION_CURRENCY: process.env.SUBSCRIPTION_CURRENCY,
    TIMEZONE: process.env.TIMEZONE,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/api/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
    ]
  },
}

module.exports = nextConfig
