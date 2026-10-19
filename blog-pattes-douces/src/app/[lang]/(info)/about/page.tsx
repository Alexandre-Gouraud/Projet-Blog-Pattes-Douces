import { ExternalLink, InfoPage, REPOSITORY_URL } from "@/components/info/InfoPage";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("about");

export default async function AboutPage() {
  const t = await getDictionary();
  return (
    <InfoPage title={t.titles.about}>
      <p className="m-0">{t.pages.about.intro}</p>
      <p className="m-0">{t.pages.about.body}</p>
      <p className="m-0">
        <ExternalLink href={REPOSITORY_URL}>{t.pages.about.sourceLink}</ExternalLink>
      </p>
    </InfoPage>
  );
}
