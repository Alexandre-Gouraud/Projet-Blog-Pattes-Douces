import { ExternalLink, InfoPage, REPOSITORY_URL } from "@/components/info/InfoPage";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("contact");

export default async function ContactPage() {
  const t = await getDictionary();
  return (
    <InfoPage title={t.titles.contact}>
      <p className="m-0">{t.pages.contact.intro}</p>
      <p className="m-0">
        <ExternalLink href={`${REPOSITORY_URL}/issues`}>{t.pages.contact.issuesLink}</ExternalLink>
      </p>
    </InfoPage>
  );
}
