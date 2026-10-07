import Link from "next/link";
import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { ComponentProps, ReactNode } from "react";
import BmrCalculatorWidget from "@/components/BmrCalculatorWidget";
import BodyFatCalculatorWidget from "@/components/BodyFatCalculatorWidget";
import CarbCalculatorWidget from "@/components/CarbCalculatorWidget";
import CalorieCalculatorWidget from "@/components/CalorieCalculatorWidget";
import CalorieDeficitCalculatorWidget from "@/components/CalorieDeficitCalculatorWidget";
import CalculatorWidget from "@/components/CalculatorWidget";
import FatIntakeCalculatorWidget from "@/components/FatIntakeCalculatorWidget";
import LeanBodyMassCalculatorWidget from "@/components/LeanBodyMassCalculatorWidget";
import ProteinCalculatorWidget from "@/components/ProteinCalculatorWidget";
import SectionReveals from "@/components/SectionReveals";
import SiteLink from "@/components/SiteLink";
import TdeeCalculatorWidget from "@/components/TdeeCalculatorWidget";
import { calculators, getCalculator, calculatorHref } from "@/data/calculators";
import { getContent } from "@/lib/mdx";
import { remarkCalculatorFaqs, remarkCalculatorSections } from "@/lib/calculator-mdx-layout";
import { generateSeo } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema, webApplicationSchema, webPageSchema } from "@/lib/schema";

const calculatorMetaTitles: Record<string, string> = {
  "tdee-calculator": "TDEE Calculator: Calculate Total Daily Energy Expenditure",
  "calorie-calculator": "Calorie Calculator: Calculate Daily Calorie Needs",
  "bmr-calculator": "BMR Calculator: Calculate Basal Metabolic Rate",
  "protein-calculator": "Protein Calculator: Calculate Daily Protein Intake",
  "carb-calculator": "Carb Calculator: Calculate Daily Carbohydrate Intake",
  "fat-intake-calculator": "Fat Intake Calculator: Calculate Daily Fat Needs",
  "body-fat-calculator": "Body Fat Calculator: Estimate Body Fat Percentage",
  "lean-body-mass-calculator": "Lean Body Mass Calculator: Calculate LBM",
  "calorie-deficit-calculator": "Calorie Deficit Calculator: Calculate Weight Loss Calories",
  "maintenance-calorie-calculator": "Maintenance Calorie Calculator: Find Your Maintenance Calories",
};

function cleanFaqText(value: string) {
  return value
    .replace(/\[(.*?)\]\([^\)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+\n/g, " ")
    .replace(/\n{2,}/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractFaqEntries(markdown: string) {
  const faqHeading = /^#\s+Frequently Asked Questions\s*$/im.exec(markdown);
  if (!faqHeading) return [];

  const faqContent = markdown
    .slice(faqHeading.index + faqHeading[0].length)
    .split(/^#\s+/m, 1)[0];

  return faqContent
    .split(/^##\s+/m)
    .slice(1)
    .map((section) => {
      const [question = "", ...answerLines] = section.split(/\r?\n/);
      return {
        question: cleanFaqText(question),
        answer: cleanFaqText(answerLines.join("\n")),
      };
    })
    .filter((item) => item.question && item.answer);
}

const pageLinks = [
  ["What is TDEE?", "quick-answer-what-is-tdee"],
  ["What is included in TDEE?", "what-is-included-in-tdee"],
  ["How is TDEE calculated?", "how-is-tdee-calculated"],
  ["TDEE activity levels", "tdee-activity-levels"],
  ["TDEE vs BMR", "tdee-vs-bmr"],
  ["TDEE for weight loss", "tdee-calculator-for-weight-loss"],
  ["How accurate is TDEE?", "how-accurate-is-a-tdee-calculator"],
  ["Frequently asked questions", "frequently-asked-questions"],
];

const caloriePageLinks = [
  ["Daily Calorie Target", "quick-answer-how-many-calories-should-i-eat-per-day"],
  ["What Is a Calorie?", "what-is-a-calorie"],
  ["How the Calorie Calculator Works", "how-the-calorie-calculator-works"],
  ["Resting Energy Expenditure", "step-1-estimate-resting-energy-expenditure"],
  ["Physical Activity", "step-2-account-for-physical-activity"],
  ["Maintenance Calories", "step-3-estimate-maintenance-calories"],
  ["Adjust Calories for Your Goal", "step-4-adjust-calories-for-your-goal"],
  ["Calorie Calculator for Weight Loss", "calorie-calculator-for-weight-loss"],
  ["Calorie Calculator for Weight Gain", "calorie-calculator-for-weight-gain"],
  ["Maintain Your Weight", "how-many-calories-should-i-eat-to-maintain-my-weight"],
  ["Calories for Men and Women", "calories-for-men-and-women"],
  ["Calories by Age", "calories-by-age"],
  ["Calories and Activity Level", "calories-and-activity-level"],
  ["Calories and BMR", "calories-and-bmr"],
  ["Calories and TDEE", "calories-and-tdee"],
  ["How Accurate Is a Calorie Calculator?", "how-accurate-is-a-calorie-calculator"],
  ["Real-Life Examples", "real-life-calorie-calculation-examples"],
  ["Calories Per Day Reference Table", "calories-per-day-reference-table"],
  ["Calories and Macronutrients", "calories-and-macronutrients"],
  ["Calories in a Pound", "how-many-calories-are-in-a-pound"],
  ["How to Track Calories", "how-to-track-calories"],
  ["Common Calorie Calculation Mistakes", "common-calorie-calculation-mistakes"],
  ["When to Recalculate", "when-should-you-recalculate-your-calorie-needs"],
  ["Who Should Use This Calculator?", "who-should-use-a-calorie-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const calorieDeficitPageLinks = [
  ["What Is a Calorie Deficit?", "quick-answer-what-is-a-calorie-deficit"],
  ["How the Calculator Works", "how-the-calorie-deficit-calculator-works"],
  ["Choosing a Calorie Deficit", "step-3-choose-a-calorie-deficit"],
  ["Calorie Deficit for Weight Loss", "calorie-deficit-for-weight-loss"],
  ["How Many Calories Should I Eat to Lose Weight?", "how-many-calories-should-i-eat-to-lose-weight"],
  ["How to Calculate a Calorie Deficit", "how-to-calculate-a-calorie-deficit"],
  ["What Is a 500-Calorie Deficit?", "what-is-a-500-calorie-deficit"],
  ["The 3,500-Calorie Rule", "the-3500-calorie-rule-why-it-is-only-a-rough-reference"],
  ["Calorie Deficit and TDEE", "calorie-deficit-and-tdee"],
  ["Calorie Deficit for Women and Men", "calorie-deficit-for-women-and-men"],
  ["Calorie Deficit by Activity Level", "calorie-deficit-by-activity-level"],
  ["Calorie Deficit and Target Weight", "calorie-deficit-and-target-weight"],
  ["Estimated Weight Loss", "estimated-weight-loss-from-a-calorie-deficit"],
  ["How Long Should You Stay in a Deficit?", "how-long-should-you-stay-in-a-calorie-deficit"],
  ["How to Eat in a Calorie Deficit", "how-to-eat-in-a-calorie-deficit"],
  ["Common Calculation Mistakes", "common-calorie-deficit-calculation-mistakes"],
  ["Accuracy", "how-accurate-is-a-calorie-deficit-calculator"],
  ["Real-Life Examples", "real-life-calorie-deficit-examples"],
  ["500 vs 750 vs 1,000 Calorie Deficit", "500-vs-750-vs-1000-calorie-deficit"],
  ["Calorie Deficit for Muscle Retention", "calorie-deficit-for-muscle-retention"],
  ["When to Recalculate", "when-should-you-recalculate-your-calorie-deficit"],
  ["Who Should Use This Calculator?", "who-should-use-a-calorie-deficit-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const bmrPageLinks = [
  ["What Is BMR?", "quick-answer-what-is-bmr"],
  ["How Is BMR Calculated?", "how-is-bmr-calculated"],
  ["BMR Formula Comparison", "bmr-formula-comparison"],
  ["What Affects Your BMR?", "what-affects-your-bmr"],
  ["BMR at Rest", "bmr-at-rest"],
  ["BMR vs RMR", "bmr-vs-rmr"],
  ["BMR for Men and Women", "bmr-for-men-and-women"],
  ["BMR Examples", "bmr-examples"],
  ["How to Read Your BMR Result", "how-to-read-your-bmr-result"],
  ["Can BMR Change Over Time?", "can-bmr-change-over-time"],
  ["Common BMR Calculation Mistakes", "common-bmr-calculation-mistakes"],
  ["How Accurate Is a BMR Calculator?", "how-accurate-is-a-bmr-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const proteinPageLinks = [
  ["Daily Protein Target", "quick-answer-daily-protein-target"],
  ["What Does Protein Do?", "what-does-protein-do"],
  ["How the Protein Calculator Works", "how-the-protein-calculator-works"],
  ["Protein Intake Formula", "protein-intake-formula"],
  ["Protein Per Kilogram vs Protein Per Pound", "protein-per-kilogram-vs-protein-per-pound"],
  ["Protein for Different Goals", "protein-for-different-goals"],
  ["Protein Needs by Body Weight", "protein-needs-by-body-weight"],
  ["Protein Needs Through Different Life Stages", "protein-needs-through-different-life-stages"],
  ["High-Protein Foods", "high-protein-foods"],
  ["Complete and Incomplete Proteins", "complete-and-incomplete-proteins"],
  ["Protein Timing and Meal Distribution", "protein-timing-and-meal-distribution"],
  ["How Many Calories Are in Protein?", "how-many-calories-are-in-protein"],
  ["Real-Life Protein Examples", "real-life-protein-examples"],
  ["Common Protein Intake Mistakes", "common-protein-intake-mistakes"],
  ["How Accurate Is a Protein Calculator?", "how-accurate-is-a-protein-calculator"],
  ["When Should You Recalculate Your Protein Needs?", "when-should-you-recalculate-your-protein-needs"],
  ["Protein Needs for Women and Men", "protein-needs-for-women-and-men"],
  ["Who Should Use This Calculator?", "who-should-use-this-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const carbPageLinks = [
  ["Daily Carb Target", "quick-answer-daily-carb-target"],
  ["How Many Carbs Do You Need?", "how-many-carbs-do-you-need"],
  ["How the Carb Calculator Works", "how-the-carb-calculator-works"],
  ["Carb Calculation Formula", "carb-calculation-formula"],
  ["Carbohydrate Reference Examples", "carbohydrate-reference-examples"],
  ["What Affects Your Carbohydrate Needs?", "what-affects-your-carbohydrate-needs"],
  ["Total Carbohydrates vs Net Carbs", "total-carbohydrates-vs-net-carbs"],
  ["Carbohydrates for Different Goals", "carbohydrates-for-different-goals"],
  ["Carbohydrates and Activity Level", "carbohydrates-and-activity-level"],
  ["Carbohydrate Food Sources", "carbohydrate-food-sources"],
  ["How to Count Carbs", "how-to-count-carbs"],
  ["Carbohydrates on Low-Carb and Keto Diets", "carbohydrates-on-low-carb-and-keto-diets"],
  ["How Many Calories Are in a Gram of Carbohydrate?", "how-many-calories-are-in-a-gram-of-carbohydrate"],
  ["Real-Life Carb Examples", "real-life-carb-examples"],
  ["Carbohydrate Needs Can Differ Between People", "carbohydrate-needs-can-differ-between-people"],
  ["Common Carb Calculation Mistakes", "common-carb-calculation-mistakes"],
  ["How Accurate Is a Carb Calculator?", "how-accurate-is-a-carb-calculator"],
  ["When Should You Recalculate Your Carb Target?", "when-should-you-recalculate-your-carb-target"],
  ["Who Should Use This Calculator?", "who-should-use-this-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const fatPageLinks = [
  ["Daily Fat Target", "quick-answer-how-much-fat-should-i-eat-per-day"],
  ["How the Fat Intake Calculator Works", "how-the-fat-intake-calculator-works"],
  ["How Much Fat Do You Need?", "how-much-fat-do-you-need"],
  ["Fat Per Gram and Calories From Fat", "fat-per-gram-and-calories-from-fat"],
  ["Percentage of Calories From Fat", "how-to-calculate-the-percentage-of-calories-from-fat"],
  ["Fat Intake for Different Goals", "fat-intake-for-different-goals"],
  ["Dietary Fat and Your Diet", "dietary-fat-and-your-diet"],
  ["Real-Life Fat Intake Examples", "real-life-fat-intake-examples"],
  ["Common Calculation Mistakes", "common-fat-intake-calculation-mistakes"],
  ["Accuracy", "how-accurate-is-a-fat-intake-calculator"],
  ["Who Should Use This Calculator?", "who-should-use-a-fat-intake-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const bodyFatPageLinks = [
  ["Body Fat Percentage", "quick-answer-body-fat-percentage"],
  ["What Is Body Fat Percentage?", "what-is-body-fat-percentage"],
  ["How the Calculator Works", "how-does-the-body-fat-calculator-work"],
  ["How to Measure Body Fat", "how-to-measure-body-fat-with-a-tape-measure"],
  ["Body Fat Formula", "how-to-calculate-body-fat-percentage"],
  ["Fat Mass and Lean Mass", "body-fat-mass-and-lean-body-mass"],
  ["Body Fat Percentage Chart", "body-fat-percentage-chart"],
  ["Body Fat by Age", "body-fat-percentage-by-age"],
  ["Body Fat Examples", "body-fat-examples"],
  ["Navy vs BMI Estimates", "us-navy-vs-bmi-body-fat-estimates"],
  ["Measurement Methods", "how-to-measure-body-fat-at-home"],
  ["Accuracy", "how-accurate-is-a-body-fat-calculator"],
  ["Common Mistakes", "common-body-fat-calculation-mistakes"],
  ["Weight Loss and Muscle Gain", "body-fat-percentage-and-weight-loss"],
  ["Army and Navy Calculators", "army-and-navy-body-fat-calculators"],
  ["When to Recalculate", "when-should-you-recalculate-body-fat"],
  ["Safety and Limitations", "safety-and-limitations"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const leanMassPageLinks = [
  ["Lean Body Mass", "quick-answer-lean-body-mass"],
  ["What Is Lean Body Mass?", "what-is-lean-body-mass"],
  ["Why Calculate Lean Body Mass?", "why-calculate-lean-body-mass"],
  ["How LBM Is Calculated", "how-is-lean-body-mass-calculated"],
  ["Formula Comparison", "lean-body-mass-formula-comparison"],
  ["LBM From Body Fat Percentage", "lean-body-mass-from-body-fat-percentage"],
  ["LBM vs Lean Body Weight", "lean-body-mass-vs-lean-body-weight"],
  ["LBM vs Fat-Free Mass", "lean-body-mass-vs-fat-free-mass"],
  ["LBM vs Muscle Mass", "lean-body-mass-vs-muscle-mass"],
  ["LBM for Men and Women", "lean-body-mass-for-men-and-women"],
  ["Age and LBM", "how-age-affects-lean-body-mass"],
  ["Weight Loss and Muscle Gain", "lean-body-mass-and-weight-loss"],
  ["LBM and BMR", "lean-body-mass-and-bmr"],
  ["LBM by Body Weight", "lean-body-mass-by-body-weight"],
  ["Real-Life Examples", "real-life-lean-body-mass-examples"],
  ["Measurement and Accuracy", "how-to-measure-lean-body-mass"],
  ["Common Calculation Mistakes", "common-lean-body-mass-calculation-mistakes"],
  ["When to Recalculate", "when-should-you-recalculate-lean-body-mass"],
  ["Who Should Use This Calculator?", "who-should-use-this-calculator"],
  ["Frequently Asked Questions", "frequently-asked-questions"],
  ["References", "references"],
];

const relatedSlugs = [
  "bmr-calculator",
  "calorie-deficit-calculator",
  "maintenance-calorie-calculator",
  "macro-calculator",
  "protein-calculator",
];

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function headingId(children: ReactNode) {
  return textOf(children)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

const headingAccents = [
  ["Weight Loss", "macro-protein"],
  ["Lose Weight", "macro-protein"],
  ["Calorie Deficit", "macro-protein"],
  ["Muscle Gain", "macro-carbs"],
  ["Calorie Surplus", "macro-carbs"],
  ["Maintenance Calories", "macro-fat"],
  ["Maintenance", "macro-fat"],
  ["Activity Levels", "macro-fat"],
  ["References", "macro-fat"],
  ["Questions", "macro-fat"],
  ["Accuracy", "macro-fat"],
  ["Formula", "macro-carbs"],
  ["Calories", "macro-protein"],
  ["BMR", "macro-carbs"],
  ["Body Fat", "macro-fat"],
  ["Lean Body Mass", "macro-fat"],
  ["Fat-Free Mass", "macro-fat"],
  ["Fat", "macro-fat"],
  ["Protein", "macro-protein"],
  ["Carbohydrate", "macro-carbs"],
  ["Carbs", "macro-carbs"],
  ["TDEE", "macro-fat"],
] as const;

function accentHeading(children: ReactNode) {
  const title = textOf(children);
  const accent = headingAccents.find(([phrase]) => new RegExp(`\\b${phrase}\\b`, "i").test(title));
  if (!accent) return children;

  const index = title.toLowerCase().indexOf(accent[0].toLowerCase());
  return [
    title.slice(0, index),
    <span className={accent[1]} key="accent">{title.slice(index, index + accent[0].length)}</span>,
    title.slice(index + accent[0].length),
  ];
}

const mdxComponents = {
  a: SiteLink,
  h1: ({ children, ...props }: ComponentProps<"h1">) => {
    const title = textOf(children);
    const id = headingId(children);
    if (!title.startsWith("Quick Answer:")) {
      return <h2 {...props} className="calculator-article-heading" id={id}>{accentHeading(children)}</h2>;
    }
    return (
      <div className="calculator-quick-answer-title">
        <span>Quick Answer</span>
        <h2 {...props} className="calculator-article-heading" id={id}>{accentHeading(title.replace(/^Quick Answer:\s*/i, ""))}</h2>
      </div>
    );
  },
  h2: ({ children, ...props }: ComponentProps<"h2">) => <h3 {...props} className="calculator-article-subheading" id={headingId(children)}>{accentHeading(children)}</h3>,
  h3: ({ children, ...props }: ComponentProps<"h3">) => <h4 {...props} className="calculator-article-minor-heading">{accentHeading(children)}</h4>,
  h4: ({ children, ...props }: ComponentProps<"h4">) => <h5 {...props} className="calculator-article-label">{accentHeading(children)}</h5>,
  table: ({ children, ...props }: ComponentProps<"table">) => (
    <div aria-label="Scrollable table" className="calculator-table-scroll" role="region" tabIndex={0}>
      <table {...props} className="mdx-table">{children}</table>
    </div>
  ),
};

export function generateStaticParams() {
  return calculators.filter((calculator) => !calculator.isHomepage).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCalculator(slug);
  if (!entry || entry.isHomepage) return {};
  const content = getContent("calculators", slug);
  return generateSeo({
    title: content?.frontmatter.title ?? entry.title,
    metaTitle: calculatorMetaTitles[slug],
    description: content?.frontmatter.description ?? entry.description,
    path: `/calculators/${slug}`,
    keywords: content?.frontmatter.keywords,
    robots: { index: Boolean(content), follow: true },
  });
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCalculator(slug);
  if (!entry || entry.isHomepage) notFound();

  const content = getContent("calculators", slug);
  const pageTitle = content?.frontmatter.title ?? entry.title;
  const pageDescription = content?.frontmatter.description ?? entry.description;
  const url = `https://macrocalculators.com/calculators/${slug}`;
  const schema = [
    webPageSchema(pageTitle, pageDescription, url),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "Calculators", url: "https://macrocalculators.com/calculators" },
      { name: pageTitle, url },
    ]),
    webApplicationSchema(pageTitle, pageDescription, url),
  ];

  if (!["tdee", "calories", "deficit", "bmr", "protein", "carbs", "fat", "bodyfat", "leanmass"].includes(entry.calculatorType) || !content) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <h1 className="font-display text-3xl font-extrabold">{entry.title}</h1>
        <p className="mt-2 max-w-xl text-muted">{entry.description}</p>
        <div className="mt-6"><CalculatorWidget /></div>
        <p className="mt-10 text-sm text-muted">Calculator content is being prepared.</p>
      </main>
    );
  }

  const { compiledSource, frontmatter, scope } = await serialize(content.content, {
    mdxOptions: { remarkPlugins: [remarkGfm, remarkCalculatorFaqs, remarkCalculatorSections], development: false },
  }, true);
  const fullScope = { opts: { Fragment, jsx, jsxs, jsxDEV }, frontmatter, ...scope };
  const Content = Reflect.construct(Function, [...Object.keys(fullScope), compiledSource])(...Object.values(fullScope)).default;
  const resolvedPageTitle = content.frontmatter.title ?? entry.title;
  const resolvedPageDescription = content.frontmatter.description ?? entry.description;
  const faqEntries = extractFaqEntries(content.content);
  const pageRelatedSlugs = content.frontmatter.related ?? relatedSlugs;
  const related = pageRelatedSlugs.map(getCalculator).filter((calculator) => calculator && calculator.slug !== slug);
  const articleSchemaData = articleSchema({
    headline: resolvedPageTitle,
    description: resolvedPageDescription,
    url: `https://macrocalculators.com/calculators/${slug}`,
    publisherId: "https://macrocalculators.com/#organization",
    datePublished: content.frontmatter.published,
    dateModified: content.frontmatter.updated,
  });
  const fullSchema = [
    webPageSchema(resolvedPageTitle, resolvedPageDescription, `https://macrocalculators.com/calculators/${slug}`),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "Calculators", url: "https://macrocalculators.com/calculators" },
      { name: resolvedPageTitle, url: `https://macrocalculators.com/calculators/${slug}` },
    ]),
    webApplicationSchema(resolvedPageTitle, resolvedPageDescription, `https://macrocalculators.com/calculators/${slug}`),
    faqSchema(faqEntries),
    articleSchemaData,
  ];
  const currentPageLinks = entry.calculatorType === "bmr"
    ? bmrPageLinks
    : entry.calculatorType === "deficit"
      ? calorieDeficitPageLinks
    : entry.calculatorType === "calories"
      ? caloriePageLinks
    : entry.calculatorType === "protein"
      ? proteinPageLinks
      : entry.calculatorType === "carbs"
        ? carbPageLinks
      : entry.calculatorType === "fat"
        ? fatPageLinks
      : entry.calculatorType === "bodyfat"
        ? bodyFatPageLinks
      : entry.calculatorType === "leanmass"
        ? leanMassPageLinks
      : pageLinks;
  const renderSidebar = (placement: "mobile" | "desktop") => (
    <aside className={`calculator-sidebar calculator-sidebar-${placement}`}>
      <section className="calculator-sidebar-panel">
        <h2>On This Page</h2>
        <ol>
          {currentPageLinks.map(([label, id], index) => (
            <li key={id}><a href={`#${id}`}><span>{index + 1}</span>{label}</a></li>
          ))}
        </ol>
      </section>
      <section className="calculator-sidebar-panel">
        <h2>Related Calculators</h2>
        <nav aria-label="Related calculators">
          {related.map((calculator) => calculator && (
            <Link href={calculatorHref(calculator)} key={calculator.slug}>
              <span><strong>{calculator.shortTitle}</strong><small>{calculator.description}</small></span>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>
      </section>
    </aside>
  );

  return (
    <main className="home-shell calculator-page-shell">
      <SectionReveals />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(fullSchema) }} />
      <section className="hero-section calculator-hero">
        <nav aria-label="Breadcrumb" className="calculator-breadcrumbs">
          <Link href="/">Home</Link><span aria-hidden="true">›</span>
          <Link href="/calculators">Calculators</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{resolvedPageTitle}</span>
        </nav>
        <div className="hero-intro">
          <h1>{resolvedPageTitle}</h1>
          <p>{resolvedPageDescription}</p>
        </div>
        {entry.calculatorType === "tdee"
          ? <TdeeCalculatorWidget />
          : entry.calculatorType === "deficit"
            ? <CalorieDeficitCalculatorWidget />
          : entry.calculatorType === "calories"
            ? <CalorieCalculatorWidget />
          : entry.calculatorType === "leanmass"
            ? <LeanBodyMassCalculatorWidget />
          : entry.calculatorType === "bodyfat"
            ? <BodyFatCalculatorWidget />
          : entry.calculatorType === "bmr"
            ? <BmrCalculatorWidget />
            : entry.calculatorType === "protein"
              ? <ProteinCalculatorWidget />
              : entry.calculatorType === "carbs"
                ? <CarbCalculatorWidget />
                : <FatIntakeCalculatorWidget />}
      </section>

      {renderSidebar("mobile")}
      <div className="calculator-page-grid">
        <article className="calculator-article prose">
          <p className="mb-5 text-sm text-muted">
            By <Link href="/editorial-team">MacroCalculators Editorial Team</Link>
          </p>
          <Content components={mdxComponents} />
        </article>
        {renderSidebar("desktop")}
      </div>
    </main>
  );
}
