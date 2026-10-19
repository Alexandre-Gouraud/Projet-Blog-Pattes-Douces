import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import Shell from "@/components/layout/Shell";
import { ToastProvider } from "@/components/ui/Toast";
import { LOCALE_INFO } from "@/i18n/config";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary, getLocale } from "@/i18n/server";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { THEME_SCRIPT } from "@/theme/themeScript";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Utilisee seulement en arabe : pas de prechargement pour les autres langues.
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-arabic",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    // « {titre de page} – Pattes Douces » (RGAA 8.6).
    title: { template: "%s – Pattes Douces", default: "Pattes Douces" },
    description: t.siteDescription,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={LOCALE_INFO[locale].dir}
      className={`${inter.variable} ${notoArabic.variable}`}
      // data-theme est pose par THEME_SCRIPT avant l'hydratation.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider initialLocale={locale}>
            <ToastProvider>
              <Shell>{children}</Shell>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
