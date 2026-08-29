import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Skip onboarding and placement: the map is the entry. Node runtime (not Edge) so Vercel anonymous deploys work. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname.startsWith("/onboarding") || pathname.startsWith("/placement")) {
    return NextResponse.redirect(new URL("/learn", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/onboarding/:path*", "/placement/:path*"],
};
