import type { PortfolioItem } from "@/lib/types";

const MAX_IMAGE_CHARS = 140_000;

export function trimStdout(stdout?: string) {
  if (!stdout) return undefined;
  return stdout.length > 4000 ? `${stdout.slice(0, 4000)}\n…` : stdout;
}

export function trimImage(image?: string) {
  if (!image) return undefined;
  return image.length > MAX_IMAGE_CHARS ? undefined : image;
}

export function upsertJobPortfolio(
  items: PortfolioItem[],
  next: PortfolioItem
): PortfolioItem[] {
  const without = items.filter((i) => !(i.source === "job" && i.jobId === next.jobId));
  return [next, ...without];
}
