// middleware.ts
//To handle request that are sent to the server
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Example logic (can be customized)
  const { pathname } = request.nextUrl

  if (pathname === "/admin") {
    // Example: redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// (optional) define where the middleware should run
export const config = {
  matcher: ["/admin/:path*"], // only run on specific paths
}
