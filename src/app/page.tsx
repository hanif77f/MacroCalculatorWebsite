import Link from "next/link";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { ComponentProps, ReactNode } from "react";
import CalculatorWidget from "@/components/CalculatorWidget";
import SiteLink from "@/components/SiteLink";
import SectionReveals from "@/components/SectionReveals";
import { webApplicationSchema, faqSchema } from "@/lib/schema";
import { getContent } from "@/lib/mdx";
import { getHomepageSectionLinks, remarkHomepageLayout } from "@/lib/homepage-mdx-layout";

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node && typeof node === "object" && "props" in node) return nodeText((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

function findHeader(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findHeader(child);
      if (found) return found;
    }
  } else if (node && typeof node === "object" && "props" in node) {
    const element = node as { type: unknown; props: { children?: ReactNode } };
    if (element.type === "thead") return element.props.children ?? null;
    return findHeader(element.props.children);
  }
  return null;
}

function getTableKind(children: ReactNode) {
  const headers = nodeText(findHeader(children)).toLowerCase();
  if (headers.includes("calories") && headers.includes("protein") && headers.includes("carbs") && headers.includes("fat")) return "table-targets";
  if (headers.includes("food") && headers.includes("protein")) return "table-food-protein";
  if (headers.includes("food") && headers.includes("carbs")) return "table-food-carbs";
  if (headers.includes("food") && headers.includes("fat")) return "table-food-fat";
  if (headers.includes("macro")) return "table-macro-breakdown";
  if (headers.includes("metric")) return "table-results";
  return "";
}

const mdxComponents = {
  a: SiteLink,
  h1: ({ children, ...props }: ComponentProps<"h1">) => <h2 {...props}>{children}</h2>,
  table: ({ children, ...props }: ComponentProps<"table">) => <table {...props} className={`mdx-table ${getTableKind(children)}`}>{children}</table>,
  tr: ({ children, ...props }: ComponentProps<"tr">) => {
    const firstCell = Array.isArray(children) ? children[0] : children;
    const label = nodeText(firstCell).trim().toLowerCase();
    const rowClass = label === "protein" ? "row-protein" : label === "carbs" || label === "carbohydrates" ? "row-carbs" : label === "fat" ? "row-fat" : label === "calories" ? "row-calories" : "";
    return <tr {...props} className={[props.className, rowClass].filter(Boolean).join(" ")}>{children}</tr>;
  },
};

export default async function HomePage() {
  const homeContent = getContent("_root", "homepage");
  const mdxSource = homeContent?.content.replace(/^(## .+?) \{#[\w-]+\}$/gm, "$1");
  const homepageSections = homeContent ? getHomepageSectionLinks(homeContent.content) : [];
  let compiledHome = null;
  if (mdxSource) {
    const { compiledSource, frontmatter, scope } = await serialize(mdxSource, { mdxOptions: { remarkPlugins: [remarkGfm, remarkHomepageLayout], development: false } }, true);
    const fullScope = { opts: { Fragment, jsx, jsxs, jsxDEV }, frontmatter, ...scope };
    const keys = Object.keys(fullScope);
    const Content = Reflect.construct(Function, [...keys, compiledSource])(...Object.values(fullScope)).default;
    compiledHome = jsx(Content, { components: mdxComponents });
  }
  const popular = [
    ["Macro Calculator", "Get your daily calorie and macro targets based on your goal, activity level, and body stats.", "/"],
    ["BMR Calculator", "Calculate your basal metabolic rate", "/calculators/bmr-calculator"],
    ["TDEE Calculator", "Estimate your maintenance calories using trusted formulas.", "/calculators/tdee-calculator"],
    ["Calorie Calculator", "Estimate your daily calorie needs for maintenance, weight loss, or weight gain.", "/calculators/calorie-calculator"],
    ["Protein Calculator", "Estimate a practical daily protein target based on your body weight, activity level, and goal.", "/calculators/protein-calculator"],
    ["Carb Calculator", "Estimate a daily carbohydrate target based on your calorie needs, activity, and goal.", "/calculators/carb-calculator"],
    ["Fat Intake Calculator", "Calculate your daily dietary fat target in grams from your calorie intake and chosen percentage of calories from fat.", "/calculators/fat-intake-calculator"],
    ["Body Fat Calculator", "Estimate body fat percentage from your height, neck, waist, hip, weight, and sex using the U.S. Navy circumference method.", "/calculators/body-fat-calculator"],
    ["Lean Body Mass Calculator", "Compare Boer, James, and Hume equations to estimate lean body mass from your sex, age, height, and weight.", "/calculators/lean-body-mass-calculator"],
    ["Calorie Deficit Calculator", "Estimate your maintenance calories, select a daily deficit, and find a practical calorie target for weight loss.", "/calculators/calorie-deficit-calculator"],
  ];
  const schema = [
    webApplicationSchema("Macro Calculator", "Calculate daily calories, protein, carbohydrates, and fat targets based on your goals and activity level.", "https://macrocalculators.com"),
    faqSchema([
      { question: "What is a macro calculator?", answer: "A macro calculator estimates the protein, carbohydrates, and fat you should eat daily based on your age, sex, weight, height, activity level, and goal." },
      { question: "How accurate is a macro calculator?", answer: "Treat calculated targets as a starting point and adjust them using your real-world results over time." },
    ]),
  ];

  return <main className="home-shell">
    <SectionReveals />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="hero-section" id="macro-calculator-form">
      <div className="hero-intro">
        <h1>Macro Calculator: Calculate Your Daily <span>Macros</span></h1>
        <p>Get your personalized calorie, protein, carbs and fat targets based on your body,<br className="desktop-break" /> activity level and goals.</p>
      </div>
      <CalculatorWidget />
    </section>

    <section className="content-section popular-section">
      <div className="section-heading"><div><h2>Popular Nutritional Calculators</h2><p>Explore our most useful calculators to help you reach your health and fitness goals.</p></div><Link href="/calculators">View All Calculators</Link></div>
      <div className="popular-grid">{popular.map(([title, desc, href]) => <Link key={title} href={href}><strong>{title}</strong><span>{desc}</span></Link>)}</div>
    </section>
    {homepageSections.length > 0 && <nav aria-label="On this page" className="homepage-toc">
      <h2>On this page</h2>
      <ul>{homepageSections.map(({ id, title }) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ul>
    </nav>}
    {compiledHome && <article className="prose prose-neutral mt-0 max-w-none  border-line pt-10">{compiledHome}</article>}
  </main>;
}
