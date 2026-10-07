import { editorialTeamProfileSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

const pageTitle = "MacroCalculators Editorial Team | Nutrition & Fitness Calculators";
const pageDescription = "Meet the MacroCalculators Editorial Team and learn how we research, review, and maintain nutrition, calorie, macro, and fitness calculator content.";
export const metadata = generateSeo({
  title: pageTitle,
  metaTitle: pageTitle,
  description: pageDescription,
  path: "/editorial-team",
  robots: { index: true, follow: true },
});

export default function EditorialTeamPage() {
  const schema = [editorialTeamProfileSchema()];

  return (
    <main className="about-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="about-hero">
        <p className="about-eyebrow">Editorial standards</p>
        <h1>MacroCalculators Editorial Team</h1>
        <p className="about-hero-copy">
          The MacroCalculators Editorial Team develops and maintains the calculators and educational content published on MacroCalculators.com.
        </p>
        <div className="about-hero-bottom">
          <p>
            Our work focuses on making nutrition and fitness calculations easier to understand while explaining the formulas, assumptions, references, and limitations behind each result.
          </p>
        </div>
      </header>

      <nav aria-label="Editorial team sections" className="about-index">
        <a href="#our-work">Our work</a>
        <a href="#editorial-approach">Our approach</a>
        <a href="#topics-we-cover">Topics</a>
        <a href="#our-sources">Our sources</a>
        <a href="#accuracy-limitations">Accuracy &amp; limitations</a>
      </nav>

      <section aria-labelledby="our-work-title" className="about-section about-origin" id="our-work">
        <div className="about-section-label"><span>What we do</span><span>01 / 05</span></div>
        <div className="about-origin-grid">
          <h2 id="our-work-title">Research and clear explanations for useful tools.</h2>
          <div className="about-prose">
            <p>
              We research calculator formulas, review supporting information, explain calculations in practical language, and keep published content updated as references and methodologies change.
            </p>
            <p>
              We explain how each calculation works, including its formulas, inputs, assumptions, and how results should be interpreted.
            </p>
            <p>
              We review published material for accuracy, clarity, outdated information, and broken references, and update content when appropriate.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="editorial-approach-title" className="about-section" id="editorial-approach">
        <div className="about-section-label"><span>What guides our work</span><span>02 / 05</span></div>
        <div className="about-section-heading">
          <h2 id="editorial-approach-title">Our editorial approach.</h2>
          <p>We aim to make the information behind each result reliable, understandable, and useful in context.</p>
        </div>
        <div className="about-principles">
          <article className="about-principle">
            <span>01</span>
            <h3>Evidence first</h3>
            <p>We aim to base formulas and important nutrition claims on established research, scientific publications, government resources, and recognized professional organizations.</p>
          </article>
          <article className="about-principle">
            <span>02</span>
            <h3>Clear over complicated</h3>
            <p>Calculator results should be understandable. We explain the underlying calculation without unnecessary technical language.</p>
          </article>
          <article className="about-principle">
            <span>03</span>
            <h3>Estimates are estimates</h3>
            <p>We explain assumptions and limitations rather than presenting nutrition and body-composition calculations as precise measurements.</p>
          </article>
          <article className="about-principle">
            <span>04</span>
            <h3>Practical context</h3>
            <p>We explain what a number represents, how it was calculated, and how it fits into the broader context of nutrition and fitness.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="topics-we-cover-title" className="about-section" id="topics-we-cover">
        <div className="about-section-label"><span>Our subject areas</span><span>03 / 05</span></div>
        <div className="about-section-heading">
          <h2 id="topics-we-cover-title">Topics we cover.</h2>
          <p>Our calculators and educational content focus on connected aspects of nutrition and fitness.</p>
        </div>
        <div className="about-tool-groups">
          <article className="about-tool-card">
            <span className="about-card-number">01</span>
            <h3>Nutrition &amp; Macros</h3>
            <p>Daily macro, protein, carbohydrate, and dietary-fat calculations.</p>
          </article>
          <article className="about-tool-card">
            <span className="about-card-number">02</span>
            <h3>Calories &amp; Energy</h3>
            <p>Calorie needs, basal metabolic rate, total daily energy expenditure, and calorie-deficit calculations.</p>
          </article>
          <article className="about-tool-card">
            <span className="about-card-number">03</span>
            <h3>Body Composition</h3>
            <p>Body-fat percentage and lean-body-mass estimation.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="our-sources-title" className="about-section" id="our-sources">
        <div className="about-section-label"><span>Research &amp; references</span><span>04 / 05</span></div>
        <div className="about-trust-grid">
          <article className="about-trust-card">
            <h2 id="our-sources-title">Our sources.</h2>
            <p>Each calculator page includes references relevant to its formulas, methodology, and educational content.</p>
            <p>Depending on the calculator, sources may include peer-reviewed research, government nutrition resources, academic publications, and established professional organizations.</p>
          </article>
          <article className="about-trust-card about-transparency-card">
            <span className="about-card-number">Source transparency</span>
            <h2>References connected to the content.</h2>
            <p>Where a formula or important claim comes from a specific source, the relevant calculator page should identify that source.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="accuracy-limitations-title" className="about-section" id="accuracy-limitations">
        <div className="about-section-label"><span>Honest estimates</span><span>05 / 05</span></div>
        <div className="about-trust-grid">
          <article className="about-trust-card">
            <h2 id="accuracy-limitations-title">Accuracy and limitations.</h2>
            <p>MacroCalculators provides educational estimates, not laboratory measurements or individualized medical advice.</p>
            <p>Calculator results depend on the formulas, assumptions, and information used. Different methods can produce different results, so we explain methodology and limitations wherever they are relevant.</p>
          </article>
          <article className="about-trust-card about-transparency-card">
            <span className="about-card-number">Use with context</span>
            <h2>Results are a starting point.</h2>
            <p>Users with medical conditions, medically prescribed diets, or circumstances requiring individualized nutrition guidance should consult an appropriately qualified healthcare professional.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="editorial-contact-title" className="about-contact" id="editorial-contact">
        <p className="about-eyebrow">Questions &amp; feedback</p>
        <h2 id="editorial-contact-title">Contact the editorial team.</h2>
        <p>
          Questions, corrections, or reference suggestions can be sent to{" "}
          <a href="mailto:macrocalculators@gmail.com">macrocalculators@gmail.com</a>.
        </p>
        <a className="about-text-link" href="mailto:macrocalculators@gmail.com">Email the editorial team <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
