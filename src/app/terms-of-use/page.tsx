import Link from "next/link";
import { webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

type TermsSubsection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string;
};

type TermsSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string;
  subsections?: TermsSubsection[];
  disclaimerLink?: boolean;
};

export const metadata = generateSeo({
  title: "Terms of Use",
  metaTitle: "Terms of Use | MacroCalculators",
  description: "Read the Terms of Use for MacroCalculators.com, including permitted use, intellectual property, warranties, liability, and contact information.",
  path: "/terms-of-use",
});

const sections: TermsSection[] = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using MacroCalculators.com, you acknowledge that you have read, understood, and agree to comply with these Terms of Use and all applicable laws and regulations.",
      "If you do not agree with any part of these Terms, you should discontinue use of the Site immediately.",
    ],
  },
  {
    id: "informational-purposes-only",
    title: "Informational Purposes Only",
    paragraphs: [
      "The content, tools, resources, articles, and information available on MacroCalculators.com are provided for general informational and educational purposes only.",
      "Nothing on this Site should be interpreted as medical advice, diagnosis, treatment, nutritional counseling, fitness coaching, or professional healthcare guidance.",
      "Any decisions you make based on information obtained from this Site are made at your own discretion and risk.",
    ],
    disclaimerLink: true,
  },
  {
    id: "use-of-the-site",
    title: "Use of the Site",
    subsections: [
      {
        title: "Permitted Use",
        paragraphs: ["You may use the Site for lawful personal and non-commercial purposes. You may:"],
        bullets: [
          "Access website content",
          "Use available tools and resources",
          "Share links to Site content",
          "Reference information with appropriate attribution",
        ],
      },
      {
        title: "Prohibited Use",
        paragraphs: ["You agree not to:"],
        bullets: [
          "Violate any applicable law or regulation",
          "Attempt to gain unauthorized access to the Site or its systems",
          "Interfere with website functionality or security",
          "Distribute malware, viruses, or harmful software",
          "Use automated systems to scrape or extract content at scale",
          "Reproduce or redistribute Site content for commercial purposes without permission",
          "Misrepresent information obtained from the Site",
        ],
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    paragraphs: [
      "All content available on MacroCalculators.com, including but not limited to the following, is protected by applicable intellectual property laws and remains the property of MacroCalculators.com or its licensors unless otherwise stated:",
    ],
    bullets: [
      "Text",
      "Graphics",
      "Design elements",
      "Branding",
      "Logos",
      "Website layout",
      "Original written content",
      "Software and functionality",
    ],
    closing: "You may not reproduce, modify, distribute, publish, or create derivative works from Site content without prior written permission.",
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    paragraphs: [
      "The Site may contain links to third-party websites or resources.",
      "These links are provided for convenience and informational purposes only.",
      "MacroCalculators.com does not control, endorse, or assume responsibility for the content, availability, privacy practices, or policies of third-party websites.",
      "Your use of external websites is subject to their own terms and policies.",
    ],
  },
  {
    id: "no-warranties",
    title: "No Warranties",
    paragraphs: [
      "The Site and all content, resources, and services are provided on an “as is” and “as available” basis.",
      "To the fullest extent permitted by law, MacroCalculators.com disclaims all warranties, express or implied, including but not limited to:",
    ],
    bullets: [
      "Accuracy of information",
      "Completeness of content",
      "Reliability of resources",
      "Fitness for a particular purpose",
      "Continuous availability",
      "Freedom from errors or interruptions",
    ],
    closing: "We do not guarantee that the Site will always be available, secure, or error-free.",
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, MacroCalculators.com, its owners, contributors, affiliates, and service providers shall not be liable for any direct, indirect, incidental, consequential, special, exemplary, or punitive damages arising from:",
    ],
    bullets: [
      "Use of the Site",
      "Inability to use the Site",
      "Reliance on Site content",
      "Errors or omissions in content",
      "Website interruptions",
      "Technical issues",
      "Unauthorized access to information",
    ],
    closing: "Your use of the Site is entirely at your own risk.",
  },
  {
    id: "indemnification",
    title: "Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless MacroCalculators.com, its owners, contributors, affiliates, and service providers from and against any claims, liabilities, damages, losses, expenses, or costs arising from:",
    ],
    bullets: [
      "Your use of the Site",
      "Violation of these Terms",
      "Violation of any applicable law",
      "Violation of the rights of another party",
    ],
  },
  {
    id: "advertising",
    title: "Advertising and Affiliate Disclosure",
    paragraphs: [
      "MacroCalculators.com may display advertisements, sponsored content, affiliate links, or promotional materials.",
      "We may earn compensation from certain third-party services, products, or partnerships.",
      "Such relationships do not affect our commitment to providing accurate and useful informational content.",
    ],
  },
  {
    id: "changes-to-site",
    title: "Changes to the Site",
    paragraphs: [
      "We reserve the right to modify, suspend, restrict, or discontinue any portion of the Site at any time without prior notice.",
      "We are not liable for any modification, suspension, or discontinuation of Site services or content.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "Changes to These Terms",
    paragraphs: [
      "We may update these Terms of Use from time to time.",
      "Any changes will be posted on this page along with an updated revision date.",
      "Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "These Terms shall be governed by and interpreted in accordance with the laws applicable in the jurisdiction where the Site operator resides, without regard to conflict of law principles.",
    ],
  },
  {
    id: "severability",
    title: "Severability",
    paragraphs: [
      "If any provision of these Terms is found to be invalid, unlawful, or unenforceable, the remaining provisions shall remain in full force and effect.",
    ],
  },
];

export default function TermsOfUsePage() {
  const schema = [
    webPageSchema("Terms of Use", "Read the Terms of Use for MacroCalculators.com, including permitted use, intellectual property, warranties, liability, and contact information.", "https://macrocalculators.com/terms-of-use"),
  ];

  return (
    <main className="legal-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="legal-hero">
        <p className="about-eyebrow">Terms &amp; conditions</p>
        <h1>Terms of Use<span>.</span></h1>
        <p className="legal-last-updated">Last updated: October 2, 2026</p>
        <p>
          Please read these Terms of Use (&quot;Terms&quot;) carefully before using MacroCalculators.com (&quot;the Site&quot;).
        </p>
        <p>
          By accessing or using the Site, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the Site.
        </p>
      </header>

      <nav aria-label="Terms of Use sections" className="legal-index">
        {sections.map((section, index) => (
          <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
        ))}
        <a href="#contact"><span>14</span>Contact Us</a>
      </nav>

      <div className="legal-sections">
        {sections.map((section, index) => (
          <section aria-labelledby={`${section.id}-title`} className="legal-section" id={section.id} key={section.id}>
            <div className="about-section-label"><span>Terms of Use</span><span>{String(index + 1).padStart(2, "0")} / 14</span></div>
            <div className="legal-section-content">
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <div className="legal-copy">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.closing && <p>{section.closing}</p>}
                {section.disclaimerLink && (
                  <p>For additional information regarding limitations and responsibilities, please review our <Link href="/disclaimer">Disclaimer</Link> page.</p>
                )}
                {section.subsections?.map((subsection) => (
                  <div className="legal-subsection" key={subsection.title}>
                    <h3>{subsection.title}</h3>
                    {subsection.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {subsection.bullets && <ul>{subsection.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                    {subsection.closing && <p>{subsection.closing}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section aria-labelledby="terms-contact-title" className="legal-section legal-contact" id="contact">
          <div className="about-section-label"><span>Questions</span><span>14 / 14</span></div>
          <div className="legal-section-content">
            <h2 id="terms-contact-title">Contact Us</h2>
            <div className="legal-copy">
              <p>If you have questions regarding these Terms of Use, please contact us:</p>
              <p><strong>Email:</strong><br /><a href="mailto:macrocalculators@gmail.com">macrocalculators@gmail.com</a></p>
              <p>Or visit our <Link href="/contact">Contact page</Link> for additional contact information.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
