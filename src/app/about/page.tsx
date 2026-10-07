import Link from "next/link";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "About MacroCalculators",
  metaTitle: "About MacroCalculators | Nutrition Calculators & Resources",
  description: "Learn about MacroCalculators, our practical nutrition tools, and how we help people understand calories, macros, metabolism, and body composition.",
  path: "/about",
});

const calculatorGroups = [
  {
    id: "nutrition",
    number: "01",
    title: "Nutrition & Macros",
    description: "Estimate daily targets for the three macronutrients that provide energy and support bodily functions.",
    tools: [
      ["Macro Calculator", "/"],
      ["Protein Calculator", "/calculators/protein-calculator"],
      ["Carb Calculator", "/calculators/carb-calculator"],
      ["Fat Intake Calculator", "/calculators/fat-intake-calculator"],
    ],
  },
  {
    id: "energy",
    number: "02",
    title: "Calories & Energy",
    description: "Explore energy needs, maintenance calories, and practical targets for different goals.",
    tools: [
      ["BMR Calculator", "/calculators/bmr-calculator"],
      ["TDEE Calculator", "/calculators/tdee-calculator"],
      ["Calorie Calculator", "/calculators/calorie-calculator"],
      ["Calorie Deficit Calculator", "/calculators/calorie-deficit-calculator"],
    ],
  },
  {
    id: "body-composition",
    number: "03",
    title: "Body Composition",
    description: "Look beyond scale weight with estimates of body fat and lean body mass.",
    tools: [
      ["Body Fat Calculator", "/calculators/body-fat-calculator"],
      ["Lean Body Mass Calculator", "/calculators/lean-body-mass-calculator"],
    ],
  },
];

const principles = [
  {
    number: "01",
    title: "Practical over perfect",
    text: "Calculators provide estimates, not guarantees. We aim to offer realistic starting points that people can adjust based on their own experience.",
  },
  {
    number: "02",
    title: "Clarity over complexity",
    text: "Useful information should be understandable without advanced nutrition knowledge. We explain the numbers in straightforward, practical language.",
  },
  {
    number: "03",
    title: "Education alongside calculation",
    text: "A result is more useful when you know what it means. We pair calculations with explanations, examples, and context whenever appropriate.",
  },
];

export default function AboutPage() {
  const schema = [
    webPageSchema("About MacroCalculators", "Learn about MacroCalculators, our practical nutrition tools, and how we help people understand calories, macros, metabolism, and body composition.", "https://macrocalculators.com/about"),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "About", url: "https://macrocalculators.com/about" },
    ]),
  ];

  return (
    <main className="about-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header aria-labelledby="about-title" className="about-hero">
        <p className="about-eyebrow">About MacroCalculators</p>
        <h1 id="about-title">Helping people understand <span>nutrition.</span></h1>
        <p className="about-hero-copy">
          Practical calculators and clear explanations for calories, macronutrients, metabolism, and body composition.
        </p>
        <div className="about-hero-bottom">
          <p>
            Nutrition can feel confusing. MacroCalculators was created to make the numbers easier to understand, with useful estimates and educational resources to help people make informed decisions.
          </p>
          <Link className="about-text-link" href="/calculators">Explore all calculators <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <nav aria-label="About this page" className="about-index">
        <a href="#why-we-built-this">Why we built this</a>
        <a href="#what-we-cover">What we cover</a>
        <a href="#how-it-connects">How it connects</a>
        <a href="#our-approach">Our approach</a>
        <a href="#accuracy">Accuracy &amp; transparency</a>
      </nav>

      <section aria-labelledby="why-we-built-this" className="about-section about-origin" id="why-we-built-this">
        <div className="about-section-label"><span>Our purpose</span><span>01 / 05</span></div>
        <div className="about-origin-grid">
          <h2 id="why-we-built-this">Better understanding leads to better choices.</h2>
          <div className="about-prose">
            <p>
              One source recommends eating more protein. Another suggests reducing carbohydrates. A third focuses entirely on calories. It can be difficult to see how these ideas fit together or which numbers matter to your goals.
            </p>
            <p>
              Calories influence body weight. Macronutrients describe how those calories are distributed. Metabolism helps estimate how much energy the body uses, while body composition adds context beyond the number on a scale.
            </p>
            <p>
              We bring these connected topics together in one place. Our goal is to make nutrition concepts easier to understand without overwhelming people with technical information or complicated formulas.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="what-we-cover" className="about-section" id="what-we-cover">
        <div className="about-section-label"><span>Our tools</span><span>02 / 05</span></div>
        <div className="about-section-heading">
          <h2 id="what-we-cover">One connected set of questions.</h2>
          <p>Our calculators focus on nutrition, energy, and body composition—and how each can help answer a different part of the picture.</p>
        </div>
        <div className="about-tool-groups">
          {calculatorGroups.map((group) => (
            <article className="about-tool-card" key={group.id}>
              <span className="about-card-number">{group.number}</span>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul>
                {group.tools.map(([title, href]) => (
                  <li key={href}><Link href={href}>{title}<span aria-hidden="true">↗</span></Link></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-it-connects" className="about-section about-flow-section" id="how-it-connects">
        <div className="about-section-label"><span>Putting the numbers together</span><span>03 / 05</span></div>
        <div className="about-section-heading">
          <h2 id="how-it-connects">Nutrition is not a collection of isolated numbers.</h2>
          <p>Each estimate can provide context for the next. Together, they help build a more complete starting point for planning.</p>
        </div>
        <ol className="about-flow">
          <li>
            <span className="about-flow-number">01</span>
            <h3>Start with resting energy</h3>
            <p>A BMR estimate gives a baseline for the energy your body uses at rest.</p>
          </li>
          <li>
            <span className="about-flow-number">02</span>
            <h3>Account for daily activity</h3>
            <p>Use activity to estimate TDEE—the calories your body may use across a typical day.</p>
          </li>
          <li>
            <span className="about-flow-number">03</span>
            <h3>Set a calorie direction</h3>
            <p>Adjust an estimated maintenance target to suit weight loss, maintenance, or gain.</p>
          </li>
          <li>
            <span className="about-flow-number">04</span>
            <h3>Make room for macros</h3>
            <p>Distribute calories across protein, carbohydrates, and fat for a practical plan.</p>
          </li>
        </ol>
        <p className="about-flow-footnote">Body fat and lean mass estimates can add further context to progress beyond scale weight.</p>
      </section>

      <section aria-labelledby="our-approach" className="about-section" id="our-approach">
        <div className="about-section-label"><span>What guides our work</span><span>04 / 05</span></div>
        <div className="about-section-heading">
          <h2 id="our-approach">Our approach.</h2>
          <p>Useful tools should be understandable, honest about their limits, and designed to support learning.</p>
        </div>
        <div className="about-principles">
          {principles.map((principle) => (
            <article className="about-principle" key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="accuracy" className="about-section" id="accuracy">
        <div className="about-section-label"><span>Honest estimates</span><span>05 / 05</span></div>
        <div className="about-trust-grid">
          <article className="about-trust-card">
            <h2 id="accuracy">Accuracy and limitations.</h2>
            <p>
              No formula can perfectly predict real-world energy use or individual nutrient needs. Genetics, training, sleep, stress, lifestyle, body composition, measurement accuracy, and changes in health can all affect results.
            </p>
            <p>
              Treat calculator results as estimates and starting points—not exact predictions. Monitor how things go over time and adjust to your own experience and goals. If you have a medical condition or specific health concern, seek guidance from a qualified healthcare provider.
            </p>
          </article>
          <article className="about-trust-card about-transparency-card">
            <span className="about-card-number">Our commitment</span>
            <h2>Show the thinking behind the result.</h2>
            <p>Whenever possible, our educational content explains:</p>
            <ul>
              <li>The purpose of each calculator</li>
              <li>The formulas and assumptions being used</li>
              <li>Common limitations and mistakes</li>
              <li>Practical ways to interpret results</li>
            </ul>
            <p>Transparency helps people understand both the value and the limits of calculator-based estimates.</p>
          </article>
        </div>
      </section>

      <aside aria-label="Our mission" className="about-mission">
        <span className="about-eyebrow">Our mission</span>
        <blockquote>
          Help people understand calories, macronutrients, metabolism, and body composition through practical tools and clear educational content.
        </blockquote>
        <p>We hope better information helps people build healthy habits, set realistic goals, and make informed choices about nutrition and fitness.</p>
      </aside>

      <section aria-labelledby="about-next-step" className="about-next-step">
        <div>
          <p className="about-eyebrow">Keep exploring</p>
          <h2 id="about-next-step">Start with the question you have today.</h2>
        </div>
        <div className="about-next-links">
          <Link href="/calculators">Browse calculators <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section aria-labelledby="about-contact-title" className="about-contact" id="contact">
        <p className="about-eyebrow">Questions &amp; feedback</p>
        <h2 id="about-contact-title">Contact us.</h2>
        <p>
          Have a suggestion, feedback, or an idea for a future calculator? We are always looking for ways to improve MacroCalculators and expand our collection of nutrition-focused tools. We appreciate your support and thank you for being here.
        </p>
        <Link className="about-text-link" href="/contact">Visit our Contact page <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
