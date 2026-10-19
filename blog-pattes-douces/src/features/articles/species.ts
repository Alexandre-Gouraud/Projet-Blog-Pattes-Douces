import type { Dictionary } from "@/i18n/dictionaries";
import type { ArticleAuthor } from "@/types";

/**
 * Espece traduite d'un membre : « Animal » par defaut, « Ancien membre » si
 * le compte n'existe plus.
 */
export function speciesLabel(t: Dictionary, author: Pick<ArticleAuthor, "espece"> | null | undefined): string {
  if (!author) return t.species.former;
  const key = author.espece as keyof Dictionary["species"] | null | undefined;
  return (key && t.species[key]) || t.species.pet;
}
