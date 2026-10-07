import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { breadcrumbSchema, contactPageSchema, webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "Contact Us",
  metaTitle: "Contact MacroCalculators",
  description: "Contact MacroCalculators for questions, feedback, technical issues, content suggestions, or partnership inquiries.",
  path: "/contact",
});

const contactTopics = [
  "General questions about the website",
  "Reporting errors or technical issues",
  "Content suggestions",
  "Partnership or collaboration inquiries",
  "Feedback on user experience",
  "Corrections or updates to published content",
];

export default function ContactPage() {
  const schema = [
    webPageSchema("Contact Us", "Contact MacroCalculators for questions, feedback, technical issues, content suggestions, or partnership inquiries.", "https://macrocalculators.com/contact"),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "Contact", url: "https://macrocalculators.com/contact" },
    ]),
    contactPageSchema("macrocalculators@gmail.com"),
  ];

  return (
    <main className="contact-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="contact-hero">
        <p className="about-eyebrow">We would love to hear from you</p>
        <h1>Contact <span>Us</span></h1>
        <p className="contact-intro">Have a question, suggestion, or feedback?</p>
        <div className="contact-hero-bottom">
          <p>
            We&apos;re always interested in hearing from our visitors. Whether you&apos;ve spotted an issue, have a content suggestion, or simply want to get in touch, feel free to contact us.
          </p>
          <a className="contact-email-card" href="mailto:macrocalculators@gmail.com">
            <span className="contact-email-label">Get in touch by email</span>
            <strong>macrocalculators@gmail.com</strong>
            <span className="contact-email-action">Write to us <span aria-hidden="true">↗</span></span>
          </a>
        </div>
      </header>

      <div className="contact-response">
        <span className="contact-response-mark" aria-hidden="true">48–72</span>
        <p>We aim to respond to most inquiries within <strong>48–72 hours.</strong></p>
      </div>

      <ContactForm />

      <section aria-labelledby="contact-topics-title" className="contact-section">
        <div className="about-section-label"><span>How can we help?</span><span>01 / 03</span></div>
        <div className="contact-section-heading">
          <h2 id="contact-topics-title">What you can contact us about.</h2>
          <p>Choose the topic that best describes your message. It helps us direct your feedback to the right place.</p>
        </div>
        <ul className="contact-topic-grid">
          {contactTopics.map((topic, index) => (
            <li key={topic}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{topic}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="before-contact-title" className="contact-section contact-guidance-section">
        <div className="about-section-label"><span>A quick note</span><span>02 / 03</span></div>
        <div className="contact-guidance">
          <div>
            <h2 id="before-contact-title">Before contacting us.</h2>
            <p>Our tools and content are designed to inform and support learning—not to replace personal professional care.</p>
          </div>
          <ul>
            <li>We do not provide personalized medical, nutrition, fitness, or healthcare advice.</li>
            <li>Calculator results and educational content are intended for informational purposes only.</li>
            <li>For medical concerns, consult a qualified healthcare professional.</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-contact-title" className="contact-about">
        <div className="about-section-label"><span>About MacroCalculators</span><span>03 / 03</span></div>
        <div className="contact-about-content">
          <h2 id="about-contact-title">Tools to make nutrition easier to understand.</h2>
          <div>
            <p>
              MacroCalculators is dedicated to providing free nutrition, fitness, and body composition calculators alongside educational content designed to help people make informed decisions about their health and wellness goals.
            </p>
            <p>
              Our mission is to create accurate, easy-to-use tools that simplify nutrition and fitness calculations for everyone.
            </p>
            <Link className="about-text-link" href="/about">Learn more about us <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <aside className="contact-bottom-cta">
        <p className="about-eyebrow">Ready when you are</p>
        <p>Send us a note—we appreciate you helping us make MacroCalculators better.</p>
        <a href="mailto:macrocalculators@gmail.com">Email MacroCalculators <span aria-hidden="true">↗</span></a>
      </aside>
    </main>
  );
}
