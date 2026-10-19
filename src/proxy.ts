import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Skip onboarding and placement. The home catalog and the map remain reachable. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/placement")) {
    return NextResponse.redirect(new URL("/learn", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/placement/:path*"],
};
