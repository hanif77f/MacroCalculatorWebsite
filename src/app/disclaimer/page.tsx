import Link from "next/link";
import { webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "Disclaimer",
  metaTitle: "Disclaimer | MacroCalculators",
  description: "Read the MacroCalculators disclaimer covering educational content, calculator estimates, medical advice, external links, and limitations of liability.",
  path: "/disclaimer",
});

const sections = [
  {
    id: "general-information",
    title: "General Information",
    paragraphs: [
      "The information provided on MacroCalculators is for general educational and informational purposes only.",
      "Our calculators, articles, guides, and other content are designed to help users better understand nutrition, calories, macronutrients, metabolism, body composition, and related fitness concepts. While we strive to provide accurate and up-to-date information, we make no guarantees regarding the completeness, accuracy, reliability, suitability, or availability of any information presented on this website.",
      "Any reliance you place on the information provided by MacroCalculators is strictly at your own risk.",
    ],
  },
  {
    id: "not-medical-advice",
    title: "Not Medical Advice",
    paragraphs: [
      "The content on MacroCalculators is not intended to replace professional medical advice, diagnosis, or treatment.",
      "Our calculators provide estimates based on formulas, assumptions, and information entered by users. Results should be considered informational tools rather than medical recommendations.",
      "Always seek the advice of a qualified physician, registered dietitian, healthcare professional, or other qualified provider regarding any medical condition, health concern, dietary change, exercise program, or treatment decision.",
      "Never disregard professional medical advice or delay seeking it because of information found on this website.",
    ],
  },
  {
    id: "calculator-estimates",
    title: "Calculator Results Are Estimates",
    paragraphs: [
      "All calculators on MacroCalculators provide estimates only.",
      "Human metabolism, body composition, calorie expenditure, and nutritional needs vary significantly from person to person. Factors such as genetics, age, sex, activity level, medical conditions, medications, lifestyle, and measurement accuracy can influence results.",
    ],
    bullets: [
      "Results may not be completely accurate for every individual.",
      "Actual calorie needs may differ from calculator estimates.",
      "Actual macronutrient requirements may vary.",
      "Weight loss, weight gain, and body composition outcomes cannot be guaranteed.",
    ],
    closing: "Calculator results should be used as a starting point for planning rather than as exact predictions.",
  },
  {
    id: "nutrition-information",
    title: "Nutrition and Fitness Information",
    paragraphs: [
      "Nutrition and fitness recommendations presented on MacroCalculators are intended for general educational purposes.",
      "Individual nutritional needs vary depending on personal circumstances, health conditions, fitness goals, and professional recommendations.",
      "The information provided on this website should not be interpreted as personalized dietary advice, exercise programming, coaching services, or treatment plans.",
      "Users are responsible for evaluating whether information is appropriate for their specific situation.",
    ],
  },
  {
    id: "no-professional-relationship",
    title: "No Professional Relationship",
    paragraphs: [
      "Your use of MacroCalculators does not create any professional, medical, nutritional, coaching, consulting, or client relationship between you and MacroCalculators.",
      "Use of this website does not establish a doctor-patient, dietitian-client, trainer-client, or any other professional relationship.",
    ],
  },
  {
    id: "external-links",
    title: "External Links Disclaimer",
    paragraphs: [
      "MacroCalculators may contain links to external websites for additional information or resources.",
      "We do not control, endorse, monitor, or guarantee the accuracy, relevance, availability, or content of any third-party websites.",
      "Any interactions with third-party websites are conducted at your own discretion and risk.",
    ],
  },
  {
    id: "accuracy",
    title: "Accuracy of Information",
    paragraphs: [
      "We make reasonable efforts to keep information current and accurate.",
      "However, nutrition science, fitness research, and health recommendations continue to evolve over time.",
    ],
    bullets: [
      "Some information may become outdated.",
      "Formulas and methodologies may change.",
      "New research may alter previous recommendations.",
    ],
    closing: "We reserve the right to update, modify, or remove content at any time without notice.",
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, MacroCalculators, its owners, contributors, authors, editors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:",
    ],
    bullets: [
      "Use of this website.",
      "Reliance on information provided on this website.",
      "Use of calculator results.",
      "Errors or omissions in content.",
      "Technical interruptions or website unavailability.",
    ],
    closing: "Users assume full responsibility for how they use the information and calculator results provided on MacroCalculators.",
  },
  {
    id: "no-guarantees",
    title: "No Guarantees",
    paragraphs: ["MacroCalculators does not guarantee any specific outcome related to:"],
    bullets: [
      "Weight loss",
      "Weight gain",
      "Muscle gain",
      "Fat loss",
      "Athletic performance",
      "Body composition changes",
      "Health improvements",
    ],
    closing: "Individual results vary based on numerous factors beyond the scope of any calculator or educational resource.",
  },
  {
    id: "use-at-your-own-risk",
    title: "Use at Your Own Risk",
    paragraphs: ["By using MacroCalculators, you acknowledge and agree that:"],
    bullets: [
      "You are using the website voluntarily.",
      "Calculator results are estimates only.",
      "Information is provided for educational purposes.",
      "You are responsible for your own health, nutrition, and fitness decisions.",
      "You assume all risks associated with the use of the website and its content.",
    ],
  },
];

export default function DisclaimerPage() {
  const schema = [
    webPageSchema("Disclaimer", "Read the MacroCalculators disclaimer covering educational content, calculator estimates, medical advice, external links, and limitations of liability.", "https://macrocalculators.com/disclaimer"),
  ];

  return (
    <main className="legal-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="legal-hero">
        <p className="about-eyebrow">Transparency &amp; responsible use</p>
        <h1>Disclaimer<span>.</span></h1>
        <p>
          Please read this information carefully. It explains the purpose and limitations of the information and estimates provided by MacroCalculators.
        </p>
      </header>

      <nav aria-label="Disclaimer sections" className="legal-index">
        {sections.map((section, index) => (
          <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
        ))}
        <a href="#contact"><span>11</span>Contact Us</a>
      </nav>

      <div className="legal-sections">
        {sections.map((section, index) => (
          <section aria-labelledby={`${section.id}-title`} className="legal-section" id={section.id} key={section.id}>
            <div className="about-section-label"><span>Disclaimer</span><span>{String(index + 1).padStart(2, "0")} / 11</span></div>
            <div className="legal-section-content">
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <div className="legal-copy">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.closing && <p>{section.closing}</p>}
              </div>
            </div>
          </section>
        ))}

        <section aria-labelledby="disclaimer-contact-title" className="legal-section legal-contact" id="contact">
          <div className="about-section-label"><span>Questions</span><span>11 / 11</span></div>
          <div className="legal-section-content">
            <h2 id="disclaimer-contact-title">Contact Us</h2>
            <div className="legal-copy">
              <p>If you have questions regarding this Disclaimer, please contact us through our <Link href="/contact">Contact page</Link>.</p>
              <p>We appreciate your use of MacroCalculators and encourage users to consult qualified professionals for personalized medical, nutrition, or fitness advice.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
