import { ExternalLink, InfoList, InfoPage, InfoSection, REPOSITORY_URL } from "@/components/info/InfoPage";
import { getDictionary, pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("accessibility");

const DEFENSEUR_DES_DROITS_FORM = "https://formulaire.defenseurdesdroits.fr/";
const DEFENSEUR_DES_DROITS_DELEGATES = "https://www.defenseurdesdroits.fr/carte-des-delegues";

/**
 * Page Accessibilite : declaration d'accessibilite selon le modele du RGAA
 * 4.1.2, schema pluriannuel et plan d'actions de l'annee (obligations
 * « Mentions et pages obligatoires »). Liee depuis le pied de page, ou la
 * mention de l'etat de conformite est affichee.
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
        <InfoList items={page.limits} />
      </InfoSection>
      <InfoSection id="etablissement" heading={page.dateHeading}>
        <p className="m-0">{page.date}</p>
        <InfoSection id="technologies" heading={page.techHeading} level={3}>
          <p className="m-0">{page.tech}</p>
        </InfoSection>
        <InfoSection id="environnement" heading={page.environmentHeading} level={3}>
          <InfoList items={page.environment} />
        </InfoSection>
        <InfoSection id="outils" heading={page.toolsHeading} level={3}>
          <InfoList items={page.tools} />
        </InfoSection>
        <InfoSection id="pages-verifiees" heading={page.pagesHeading} level={3}>
          <InfoList items={page.pages} />
        </InfoSection>
      </InfoSection>
      <InfoSection id="contact" heading={page.contactHeading}>
        <p className="m-0">{page.contact}</p>
        <p className="m-0">
          <ExternalLink href={`${REPOSITORY_URL}/issues`}>{page.contactLink}</ExternalLink>
        </p>
      </InfoSection>
      <InfoSection id="recours" heading={page.remedyHeading}>
        <p className="m-0">{page.remedy}</p>
        <ul className="m-0 flex flex-col gap-1.5 ps-6">
          <li>
            <ExternalLink href={DEFENSEUR_DES_DROITS_FORM}>{page.remedyForm}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={DEFENSEUR_DES_DROITS_DELEGATES}>{page.remedyDelegate}</ExternalLink>
          </li>
          <li>{page.remedyMail}</li>
          <li>{page.remedyPhone}</li>
        </ul>
      </InfoSection>
      <InfoSection id="schema" heading={page.schemaHeading}>
        <p className="m-0">{page.schemaIntro}</p>
        <InfoList items={page.schema} />
      </InfoSection>
      <InfoSection id="plan" heading={page.planHeading}>
        <InfoList items={page.plan} />
      </InfoSection>
    </InfoPage>
  );
}
