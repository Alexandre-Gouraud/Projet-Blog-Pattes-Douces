/**
 * Regles de validation partagees entre le client (formulaires) et le serveur
 * (route handlers). Le serveur revalide toujours : la validation client n'est
 * qu'un confort, elle se contourne en appelant l'API directement.
 */

export const LIMITS = {
  pseudo: { min: 3, max: 30 },
  password: { min: 8, max: 128 },
  biographie: 500,
  titre: 150,
  texte: 20_000,
  commentaire: 2_000,
  // Sous la limite de 4,5 Mo du corps des requetes des fonctions Vercel.
  imageBytes: 4 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const OBJECT_ID = /^[a-f\d]{24}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

/** Identifiant MongoDB valide (24 caracteres hexadecimaux). */
export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID.test(value);
}

/** Chaine non vide (apres trim) d'au plus `max` caracteres. */
export function isText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL.test(value);
}

/** URL d'image produite par POST /api/uploads (Vercel Blob, en https). */
export function isBlobImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && BLOB_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

/** Message d'erreur si le mot de passe ne respecte pas la politique, sinon null. */
export function passwordError(password: string): string | null {
  if (password.length < LIMITS.password.min) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (password.length > LIMITS.password.max) return "Le mot de passe est trop long.";
  if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir au moins une lettre majuscule.";
  if (!/[a-z]/.test(password)) return "Le mot de passe doit contenir au moins une lettre minuscule.";
  if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir au moins un chiffre.";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Le mot de passe doit contenir au moins un caractère spécial.";
  return null;
}
