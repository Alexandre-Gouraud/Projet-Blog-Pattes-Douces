/**
 * Avatar d'un membre : son initiale sur une des quatre couleurs de la marque
 * (DESIGN.md §3.3), toujours la meme pour un membre donne. Decoratif : le
 * pseudo est ecrit a cote.
 */
const PALETTE = [
  { bg: "#FFB371", fg: "#1F140B" },
  { bg: "#996C44", fg: "#FFFFFF" },
  { bg: "#D9D9D9", fg: "#1F140B" },
  { bg: "#F6D2B0", fg: "#1F140B" },
] as const;

function colorsFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ name, seed, size = 40 }: { name: string; seed?: string; size?: number }) {
  const { bg, fg } = colorsFor(seed || name);
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.4) }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
