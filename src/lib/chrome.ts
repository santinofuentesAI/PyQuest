export function isImmersivePath(pathname: string) {
  return (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/placement") ||
    pathname.startsWith("/playground/editor") ||
    pathname.startsWith("/lesson") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/projects/")
  );
}
