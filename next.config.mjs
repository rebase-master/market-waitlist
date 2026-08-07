/** @type {import('next').NextConfig} */

// Hybrid rendering by design: the marketing page is statically prerendered,
// and POST /api/waitlist runs as a serverless function. Do NOT add
// `output: 'export'` — a static export drops the API route from the build and
// every signup would 404. (PLAN.md eng-review finding A1.)
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
