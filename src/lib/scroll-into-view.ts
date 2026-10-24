export function scrollIntoViewSoon(node: HTMLElement | null) {
  if (!node || typeof node.scrollIntoView !== "function") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
}
