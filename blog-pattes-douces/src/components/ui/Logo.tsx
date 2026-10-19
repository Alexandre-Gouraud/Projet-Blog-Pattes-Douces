import Image from "next/image";

/**
 * Logo de la marque, toujours sur une pastille blanche (y compris en theme
 * sombre) pour garder son contraste. Decoratif : le nom « Pattes Douces » est
 * ecrit a cote en texte reel (DESIGN.md §2).
 */
export function Logo({ size = 44, priority = false }: { size?: number; priority?: boolean }) {
  return (
    <Image
      src="/images/logo.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className="shrink-0 bg-white shadow-sm"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27) }}
    />
  );
}
