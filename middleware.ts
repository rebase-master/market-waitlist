import { NextResponse, type NextRequest } from 'next/server'

// Expose the current pathname to Server Components (the root layout) via a request
// header, so the layout can set the correct <html lang>/<dir> per locale. App Router
// layouts don't otherwise receive the pathname.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Only the localized HTML pages need this — not assets, the API, or SEO files.
  matcher: ['/', '/ar'],
}
