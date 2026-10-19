import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Utilisee seulement en arabe : pas de prechargement pour les autres langues.
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-arabic",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: "%s – Pattes Douces",
    default: "Pattes Douces",
  },
  description: "Le blog des amoureux des chats : articles, photos et commentaires.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${notoArabic.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
