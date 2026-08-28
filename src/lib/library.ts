import { SECTIONS } from "./curriculum";
import { LIBRARY, getLibraryArticle, type LibraryArticle } from "@/content/library";

export { LIBRARY, getLibraryArticle };
export type { LibraryArticle };

export function librarySections() {
  return SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    color: section.color,
    articles: section.units
      .map((u) => getLibraryArticle(u.id))
      .filter((a): a is LibraryArticle => Boolean(a)),
  })).filter((s) => s.articles.length > 0);
}
