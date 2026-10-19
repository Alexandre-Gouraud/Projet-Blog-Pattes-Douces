import { ExternalLink, InfoPage, InfoSection, REPOSITORY_URL } from "@/components/info/InfoPage";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("accessibility");

const DEFENSEUR_DES_DROITS_URL = "https://formulaire.defenseurdesdroits.fr/";

/**
 * Declaration d'accessibilite (RGAA 4.1.2), liee depuis le pied de page avec
 * l'etat de conformite. « Partiellement conforme » tant que l'audit complet
 * n'a pas ete realise.
 */
export default async function AccessibilityPage() {
  const t = await getDictionary();
  const page = t.pages.accessibility;
  return (
    <InfoPage title={t.titles.accessibility}>
      <p className="m-0">{page.intro}</p>
      <InfoSection id="etat" heading={page.statusHeading}>
        <p className="m-0">{page.status}</p>
      </InfoSection>
      <InfoSection id="tests" heading={page.testsHeading}>
        <p className="m-0">{page.tests}</p>
      </InfoSection>
      <InfoSection id="non-accessible" heading={page.limitsHeading}>
        <ul className="m-0 flex flex-col gap-1.5 ps-6">
          {page.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </InfoSection>
      <InfoSection id="date" heading={page.dateHeading}>
        <p className="m-0">{page.date}</p>
      </InfoSection>
      <InfoSection id="technologies" heading={page.techHeading}>
        <p className="m-0">{page.tech}</p>
      </InfoSection>
      <InfoSection id="contact" heading={page.contactHeading}>
        <p className="m-0">{page.contact}</p>
        <p className="m-0">
          <ExternalLink href={`${REPOSITORY_URL}/issues`}>{page.contactLink}</ExternalLink>
        </p>
      </InfoSection>
      <InfoSection id="recours" heading={page.remedyHeading}>
        <p className="m-0">{page.remedy}</p>
        <p className="m-0">
          <ExternalLink href={DEFENSEUR_DES_DROITS_URL}>{page.remedyLink}</ExternalLink>
        </p>
      </InfoSection>
    </InfoPage>
  );
}
