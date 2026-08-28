export function isImmersivePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/placement") ||
    pathname.startsWith("/lesson") ||
    pathname.startsWith("/review")
  );
}
