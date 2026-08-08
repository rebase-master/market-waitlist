// Canonical site origin, normalized to have no trailing slash — so `${SITE_URL}/ar`
// and friends never produce a double slash, regardless of how NEXT_PUBLIC_SITE_URL
// happens to be set in the deployment platform.
const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amanah.example.com'

export const SITE_URL = raw.replace(/\/+$/, '')
