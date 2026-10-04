import type { NextConfig } from "next";

/**
 * Les routes ont ete renommees en anglais et en minuscules lors de la
 * restructuration. Ces redirections permanentes evitent de casser les liens
 * et les favoris qui pointent encore vers les anciennes URL.
 *
 * /Feed et /Activity ne figurent PAS ici : leur ancienne et leur nouvelle URL
 * ne different que par la casse, et le matcher de `redirects()` est insensible
 * a la casse, ce qui ferait boucler la redirection. Ces deux cas sont traites
 * dans src/proxy.ts.
 */
const legacyRedirects = [
  { source: "/Connexion", destination: "/login" },
  { source: "/Inscription", destination: "/register" },
  { source: "/Creation_article", destination: "/articles/new" },
  { source: "/Article_page/:id", destination: "/articles/:id" },
  { source: "/Post_user", destination: "/my-articles" },
  { source: "/Profil", destination: "/profile" },
  { source: "/commentaires", destination: "/comments" },
];

/** En-tetes de securite envoyes sur toutes les reponses. */
const securityHeaders = [
  // Interdit d'afficher le site dans une iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Le navigateur respecte le Content-Type annonce au lieu de le deviner.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Image Docker : serveur autonome minimal (.next/standalone). Active seulement
  // par le Dockerfile, pour que `pnpm start` continue de fonctionner hors Docker.
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  // Ne pas annoncer la techno du serveur (en-tete X-Powered-By).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Images d'articles hebergees sur Vercel Blob (voir /api/uploads).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**", search: "" },
    ],
  },
  async redirects() {
    return legacyRedirects.map((redirect) => ({ ...redirect, permanent: true }));
  },
};

export default nextConfig;
