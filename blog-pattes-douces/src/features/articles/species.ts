import type { Messages } from "@/i18n/messages";
import type { ArticleAuthor } from "@/types";

/**
 * Espece traduite d'un membre : « Animal » par defaut, « Ancien membre » si
 * le compte n'existe plus.
 */
export function speciesLabel(t: Messages, author: Pick<ArticleAuthor, "espece"> | null | undefined): string {
  if (!author) return t.species.former;
  const key = author.espece as keyof Messages["species"] | null | undefined;
  return (key && t.species[key]) || t.species.pet;
}
