import { InfoPage, InfoSection } from "@/components/info/InfoPage";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("privacy");

export default async function PrivacyPage() {
  const t = await getDictionary();
  const page = t.pages.privacy;
  const sections = [
    { id: "compte", heading: page.accountHeading, text: page.account },
    { id: "contributions", heading: page.contentHeading, text: page.content },
    { id: "navigateur", heading: page.browserHeading, text: page.browser },
    { id: "suppression", heading: page.deletionHeading, text: page.deletion },
  ];
  return (
    <InfoPage title={t.titles.privacy}>
      <p className="m-0">{page.intro}</p>
      {sections.map((section) => (
        <InfoSection key={section.id} id={section.id} heading={section.heading}>
          <p className="m-0">{section.text}</p>
        </InfoSection>
      ))}
    </InfoPage>
  );
}
