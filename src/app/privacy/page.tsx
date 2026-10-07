import Link from "next/link";
import SiteLink from "@/components/SiteLink";
import { webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

type PrivacySubsection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  closing?: string;
};

type PrivacySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string;
  links?: { before?: string; label: string; href: string; after?: string }[];
  disclaimerLink?: boolean;
  subsections?: PrivacySubsection[];
};

export const metadata = generateSeo({
  title: "Privacy Policy",
  metaTitle: "Privacy Policy | MacroCalculators",
  description: "How MacroCalculators.com collects, uses, and protects your information.",
  path: "/privacy",
});

const sections: PrivacySection[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    subsections: [
      {
        title: "Information You Provide Directly",
        paragraphs: [
          "Our calculators (macro calculator, TDEE calculator, BMR calculator, and others) ask for details like age, sex, weight, height, activity level, and goals to generate your results.",
          "This data is processed in your browser only. We do not store, save, or transmit the personal health details you enter into our calculators to our servers, unless you explicitly create an account or sign up for a feature that requires saving your data (if and when such a feature is offered).",
          "If you contact us by email or through a contact form, we collect the information you voluntarily provide, such as your name and email address.",
        ],
      },
      {
        title: "Information Collected Automatically",
        paragraphs: [
          "Like most websites, we automatically collect certain technical information when you visit, including:",
        ],
        bullets: [
          "IP address (used in anonymized or aggregated form where possible)",
          "Browser type and version",
          "Device type and operating system",
          "Pages visited, time spent on pages, and referring website",
          "General location (country/region level, derived from IP address)",
        ],
        closing: "This information is collected through standard web server logs and analytics tools (see Analytics).",
      },
      {
        title: "Cookies and Local Storage",
        paragraphs: ["We use cookies and browser local storage for:"],
        bullets: [
          "Essential functionality — such as remembering your dark/light mode preference",
          "Analytics — to understand how visitors use the Site (see Analytics)",
          "Advertising — if and where ads are displayed (see Advertising)",
        ],
        closing: "You can disable cookies through your browser settings. Doing so may affect some features of the Site, such as theme preference persistence.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    paragraphs: ["We use the information we collect to:"],
    bullets: [
      "Provide and operate the calculators and tools on this Site",
      "Understand how visitors use the Site so we can improve it",
      "Respond to inquiries sent through contact forms or email",
      "Maintain the security and proper functioning of the Site",
      "Comply with legal obligations",
    ],
    closing: "We do not sell your personal information to third parties.",
  },
  {
    id: "analytics",
    title: "Analytics",
    paragraphs: [
      "We may use third-party analytics services (such as Google Analytics) to understand Site traffic and usage patterns. These services may use cookies and similar technologies to collect information about your use of the Site, which may include your IP address.",
      "Analytics data is used in aggregate to understand overall trends — it is not used to identify you individually.",
    ],
    links: [
      {
        before: "You can opt out of Google Analytics tracking by installing the ",
        label: "Google Analytics Opt-out Browser Add-on",
        href: "https://tools.google.com/dlpage/gaoptout",
        after: ".",
      },
    ],
  },
  {
    id: "advertising",
    title: "Advertising",
    paragraphs: [
      "If this Site displays advertising, we may work with third-party advertising networks (such as Google AdSense) that use cookies to serve ads based on your visits to this and other websites.",
      "These third parties may collect information about your visits to this and other websites to provide advertisements about goods and services of interest to you. You can opt out of personalized advertising by visiting Google's Ads Settings or aboutads.info.",
      "We do not control the cookies or tracking practices of third-party advertising networks. Please review their respective privacy policies for more information.",
    ],
    links: [
      { before: "Opt out of personalized advertising through ", label: "Google's Ads Settings", href: "https://adssettings.google.com/" },
      { before: " or ", label: "aboutads.info", href: "https://optout.aboutads.info/", after: "." },
    ],
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    paragraphs: [
      "Our Site may contain links to third-party websites, including sources we cite for scientific references. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policy of any website you visit.",
    ],
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    paragraphs: [
      "MacroCalculators.com is not directed at children under the age of 13 (or under 16 in certain jurisdictions), and we do not knowingly collect personal information from children. Our calculators are designed for use by healthy adults.",
      "If you believe a child has provided us with personal information, please contact us so we can remove it.",
    ],
    disclaimerLink: true,
  },
  {
    id: "data-security",
    title: "Data Security",
    paragraphs: [
      "We take reasonable technical and organizational measures to protect any information we collect. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights and Choices",
    paragraphs: [
      "Depending on your location, you may have rights regarding your personal information, including:",
    ],
    bullets: [
      "Access — requesting a copy of the information we hold about you",
      "Correction — requesting correction of inaccurate information",
      "Deletion — requesting deletion of your information",
      "Opt-out — opting out of analytics or advertising cookies (see Analytics and Advertising)",
    ],
    subsections: [
      {
        title: "For EU/UK Visitors (GDPR)",
        paragraphs: [
          "If you are located in the European Economic Area or United Kingdom, you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict, or object to our processing of your personal data, and the right to data portability.",
        ],
      },
      {
        title: "For California Residents (CCPA/CPRA)",
        paragraphs: [
          "If you are a California resident, you have the right to know what personal information we collect, request deletion of your personal information, and opt out of the sale or sharing of your personal information. We do not sell personal information as defined under the CCPA.",
          "To exercise any of these rights, contact us using the information in Contact Us.",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    paragraphs: [
      "We retain automatically collected technical/analytics data only as long as necessary for the purposes described in this policy, or as required by law. Information entered into our calculators is not retained by us, as it is processed client-side in your browser.",
    ],
  },
  {
    id: "policy-changes",
    title: "Changes to This Policy",
    paragraphs: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. The "Last Updated" date at the top of this page indicates when this policy was last revised. We encourage you to review this page periodically.',
    ],
  },
];

export default function PrivacyPage() {
  const schema = [
    webPageSchema("Privacy Policy", "How MacroCalculators.com collects, uses, and protects your information.", "https://macrocalculators.com/privacy"),
  ];

  return (
    <main className="legal-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="legal-hero">
        <p className="about-eyebrow">Your information, clearly explained</p>
        <h1>Privacy Policy<span>.</span></h1>
        <p className="legal-last-updated">Last updated: October 2, 2026</p>
        <p>
          MacroCalculators.com (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;the Site&quot;) respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
        </p>
        <p>By using MacroCalculators.com, you agree to the practices described in this policy.</p>
      </header>

      <nav aria-label="Privacy Policy sections" className="legal-index">
        {sections.map((section, index) => (
          <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
        ))}
        <a href="#contact"><span>11</span>Contact Us</a>
      </nav>

      <div className="legal-sections">
        {sections.map((section, index) => (
          <section aria-labelledby={`${section.id}-title`} className="legal-section" id={section.id} key={section.id}>
            <div className="about-section-label"><span>Privacy Policy</span><span>{String(index + 1).padStart(2, "0")} / 11</span></div>
            <div className="legal-section-content">
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <div className="legal-copy">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.closing && <p>{section.closing}</p>}
                {section.links?.map((link) => (
                  <p key={link.href}>
                    {link.before ?? ""}
                    <SiteLink href={link.href}>{link.label}</SiteLink>
                    {link.after ?? ""}
                  </p>
                ))}
                {section.disclaimerLink && (
                  <p>
                    See our <Link href="/disclaimer">Disclaimer</Link> for more on who should and shouldn&apos;t use our tools.
                  </p>
                )}
                {section.subsections?.map((subsection) => (
                  <div className="legal-subsection" key={subsection.title}>
                    <h3>{subsection.title}</h3>
                    {subsection.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {subsection.bullets && <ul>{subsection.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                    {subsection.closing && <p>{subsection.closing}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section aria-labelledby="privacy-contact-title" className="legal-section legal-contact" id="contact">
          <div className="about-section-label"><span>Questions</span><span>11 / 11</span></div>
          <div className="legal-section-content">
            <h2 id="privacy-contact-title">Contact Us</h2>
            <div className="legal-copy">
              <p>If you have questions about this Privacy Policy or how we handle your information, contact us at: <a href="mailto:macrocalculators@gmail.com">macrocalculators@gmail.com</a></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
