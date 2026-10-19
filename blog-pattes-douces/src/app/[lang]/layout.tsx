import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import Shell from "@/components/layout/Shell";
import { ToastProvider } from "@/components/ui/Toast";
import { LOCALES, LOCALE_INFO } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { InlineScript } from "@/theme/InlineScript";
import { THEME_SCRIPT } from "@/theme/themeScript";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Utilisee seulement en arabe : pas de prechargement pour les autres langues.
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-arabic",
  preload: false,
});

/** Une version de chaque page par langue (guide i18n de Next.js). */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    // « {titre de page} – Pattes Douces » (RGAA 8.6).
    title: { template: "%s – Pattes Douces", default: "Pattes Douces" },
    description: t.meta.description,
  };
}

/** Layout racine : un par langue, avec lang et dir propres (RGAA 8.3). */
export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const messages = await getDictionary();

  return (
    <html
      lang={locale}
      dir={LOCALE_INFO[locale].dir}
      className={`${inter.variable} ${notoArabic.variable}`}
      // data-theme est pose par THEME_SCRIPT avant l'hydratation.
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider locale={locale} messages={messages}>
            <ToastProvider>
              <Shell>{children}</Shell>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
