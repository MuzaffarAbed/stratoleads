import type { Metadata } from "next";

import { SiteShell } from "@/components/brand/SiteShell";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How STRATO IT collects, uses, stores and protects personal information on the convention enquiry website.",
};

const sections = [
  {
    title: "1. Introduction",
    blocks: [
      "STRATO IT (“STRATO”, “we”, “us” or “our”) respects your privacy and is committed to protecting your personal information.",
      "This Privacy Notice explains how we collect, use, store and protect personal information when you use our convention lead-generation website, submit a product enquiry, or access our digital business cards.",
      "We aim to handle personal information in accordance with applicable South African data protection legislation, including the Protection of Personal Information Act 4 of 2013 (POPIA).",
    ],
  },
  {
    title: "2. Personal Information We Collect",
    intro: "When you submit a convention enquiry, we may collect the following information:",
    items: [
      "Name",
      "Surname",
      "Company name",
      "Cellphone number",
      "Email address",
      "Product or service of interest",
      "Any additional comments you voluntarily provide",
    ],
    after: [
      "When you access a digital business card, you may also view professional contact information belonging to a STRATO representative, such as their name, job title, business email address, business telephone number and other published professional details.",
      "Please do not include confidential, sensitive or unnecessary personal information in the comments field.",
    ],
  },
  {
    title: "3. Why We Use Your Information",
    intro: "We collect and process enquiry information for the following purposes:",
    items: [
      "To understand your interest in STRATO products and services.",
      "To respond to your enquiry and facilitate relevant business discussions.",
      "To enable authorised STRATO personnel to review and manage enquiries.",
      "To maintain appropriate business records and support our operational requirements.",
      "To protect the website against misuse and investigate technical issues where necessary.",
    ],
    after: [
      "Submitting an enquiry does not automatically subscribe you to a marketing mailing list. Any separate marketing communications will be handled in accordance with applicable law and any required consent or other lawful basis.",
    ],
  },
  {
    title: "4. How We Store and Protect Your Information",
    blocks: [
      "Enquiry information is stored in a Google Sheets spreadsheet managed through Google Apps Script and is accessible only to authorised personnel and accounts with appropriate permissions.",
      "We apply reasonable technical and organisational safeguards designed to protect personal information against unauthorised access, disclosure, alteration, loss or misuse.",
      "These safeguards include restricting access to the spreadsheet, protecting the website's server-side integrations, and limiting access to authorised personnel.",
      "No method of electronic storage or transmission can be guaranteed to be completely secure. We take reasonable steps to reduce risks and respond appropriately to security incidents.",
    ],
  },
  {
    title: "5. Third-Party Services and International Processing",
    blocks: [
      "Our website uses Google services, including Google Sheets and Google Apps Script, to store and manage enquiry information.",
      "Depending on the services used, their configuration and applicable processing arrangements, information may be processed or stored in locations outside South Africa.",
      "Where applicable, STRATO will take reasonable steps to ensure that any cross-border transfer of personal information complies with POPIA and other relevant legal requirements.",
      "Google may process information in accordance with its applicable terms and privacy documentation.",
    ],
  },
  {
    title: "6. How Long We Retain Information",
    blocks: [
      "We retain enquiry information only for as long as reasonably necessary for the purposes for which it was collected, including responding to enquiries, maintaining appropriate business records and meeting applicable legal obligations.",
      "Information will be deleted, anonymised or securely disposed of when it is no longer required, subject to applicable retention requirements.",
      "The applicable retention period is determined by STRATO's internal policies and legal obligations.",
    ],
  },
  {
    title: "7. Your Rights",
    intro: "Subject to applicable law and any relevant limitations, you may have the right to:",
    items: [
      "Request access to personal information we hold about you.",
      "Request correction or updating of inaccurate or incomplete information.",
      "Request deletion or destruction of personal information where legally permissible.",
      "Object to certain processing of your personal information.",
      "Raise a concern or complaint about how your information is handled.",
      "Lodge a complaint with the Information Regulator of South Africa where appropriate.",
    ],
    after: [
      "To exercise your rights or raise a privacy concern, please use the contact details provided in the Contact Us section below.",
      "We may need to verify your identity before responding to certain requests.",
    ],
  },
  {
    title: "8. Digital Business Cards",
    blocks: [
      "Our digital business cards display professional contact information for STRATO representatives.",
      "Information displayed on these cards is managed by authorised administrators. Only information approved for publication should be made publicly available.",
      "If you are a STRATO representative and believe that your published contact information is inaccurate or should be updated, please contact the relevant STRATO administrator.",
    ],
  },
  {
    title: "9. Cookies and Technical Information",
    blocks: [
      "This website is designed primarily to capture enquiries and provide digital business cards.",
      "If cookies, analytics, tracking technologies or other website technologies are introduced, STRATO should update this Privacy Notice to describe their purposes and any applicable choices or controls available to visitors.",
    ],
  },
  {
    title: "10. Children's Information",
    blocks: [
      "This website is intended for business and professional enquiries and is not specifically directed at children.",
      "Please do not submit personal information about children unless there is a lawful basis and all applicable legal requirements have been met.",
    ],
  },
  {
    title: "11. Changes to This Notice",
    blocks: [
      "We may update this Privacy Notice from time to time to reflect changes to our website, business processes, service providers or applicable legal requirements.",
      "The latest version will be published on this website with its updated revision date.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <SiteShell label="Privacy notice">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium tracking-[0.08em] text-teal-deep uppercase">STRATO IT</p>
        <h1 className="mt-3 text-[clamp(2rem,1.4rem+2vw,3.25rem)] font-light leading-[1.1] tracking-[-0.035em] text-ink">
          Privacy Notice
        </h1>
        <p className="mt-3 text-sm text-muted">Last updated: 20 October 2026</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-medium tracking-[-0.02em] text-ink">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-7 text-muted">
                {"intro" in section ? <p>{section.intro}</p> : null}
                {"blocks" in section
                  ? section.blocks.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                  : null}
                {"items" in section ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {"after" in section
                  ? section.after.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                  : null}
              </div>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-medium tracking-[-0.02em] text-ink">12. Contact Us</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-7 text-muted">
              <p>To exercise your rights or raise a privacy concern, contact STRATO IT:</p>
              <ul className="space-y-1">
                <li>
                  <a className="font-medium text-teal-deep underline decoration-teal underline-offset-4" href="mailto:info@stratoitgroup.co.za">
                    info@stratoitgroup.co.za
                  </a>
                </li>
                <li>
                  <a className="font-medium text-teal-deep underline decoration-teal underline-offset-4" href="tel:+27112587800">
                    011 258 7800
                  </a>
                </li>
                <li>Kleve Hill Park, Paulshof, Sandton, 2191</li>
              </ul>
            </div>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}
