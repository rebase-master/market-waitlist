/** @type {import('next').NextConfig} */

// Hybrid rendering by design: the marketing page is statically prerendered,
// and POST /api/waitlist runs as a serverless function. Do NOT add
// `output: 'export'` — a static export drops the API route from the build and
// every signup would 404. (PLAN.md eng-review finding A1.)
const nextConfig = {
  reactStrictMode: true,

  // Baseline security headers for a public financial-brand page. A full CSP is a
  // documented next-step (Next's inline runtime scripts need nonce plumbing).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // no reason to be framed; blocks clickjacking
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
