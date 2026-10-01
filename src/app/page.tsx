import Link from "next/link";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { ComponentProps, ReactNode } from "react";
import CalculatorWidget from "@/components/CalculatorWidget";
import { webApplicationSchema, faqSchema } from "@/lib/schema";
import { getContent } from "@/lib/mdx";
import { remarkHomepageLayout } from "@/lib/homepage-mdx-layout";

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
  let compiledHome = null;
  if (mdxSource) {
    const { compiledSource, frontmatter, scope } = await serialize(mdxSource, { mdxOptions: { remarkPlugins: [remarkGfm, remarkHomepageLayout], development: false } }, true);
    const fullScope = { opts: { Fragment, jsx, jsxs, jsxDEV }, frontmatter, ...scope };
    const keys = Object.keys(fullScope);
    const Content = Reflect.construct(Function, [...keys, compiledSource])(...Object.values(fullScope)).default;
    compiledHome = jsx(Content, { components: mdxComponents });
  }
  const popular = [
    ["Macro Calculator", "Get your daily protein, carbs and fat targets", "/"],
    ["BMR Calculator", "Calculate your basal metabolic rate", "/calculators/bmr-calculator"],
    ["Weight Loss Calculator", "Create a calorie deficit while keeping protein high", "/calculators/calorie-deficit-calculator"],
    ["Calorie Calculator", "Find your daily calorie needs", "/calculators/tdee-calculator"],
    ["Body Fat Calculator", "Estimate your body fat percentage", "/calculators/body-fat-calculator"],
    ["Muscle Gain Calculator", "Get the right balance of macros for muscle growth", "/calculators/macro-calculator"],
    ["TDEE Calculator", "Estimate your total daily energy expenditure", "/calculators/tdee-calculator"],
    ["Lean Body Mass Calculator", "Find your lean body mass", "/calculators/lean-body-mass-calculator"],
    ["Maintenance Calculator", "Find your ideal macros to maintain your weight", "/calculators/maintenance-calorie-calculator"],
  ];
  const guides = ["What Are Macros?", "Macro Ratios Explained", "Tracking Your Macros", "Common Macro Mistakes", "Nutrition Basics"];
  const schema = [webApplicationSchema("Macro Calculator", "Free daily macro and calorie calculator.", "https://macrocalculators.com"), faqSchema([
    { question: "What is a macro calculator?", answer: "A macro calculator estimates the protein, carbohydrates, and fat you should eat daily based on your age, sex, weight, height, activity level, and goal." },
    { question: "How accurate is a macro calculator?", answer: "Treat calculated targets as a starting point and adjust them using your real-world results over time." },
  ])];

  return <main className="home-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="hero-section">
      <div className="hero-intro">
        <h1>Calculate Your <span>Macros</span></h1>
        <p>Get your personalized calorie, protein, carbs and fat targets based on your body,<br className="desktop-break" /> activity level and goals.</p>
      </div>
      <CalculatorWidget />
    </section>

    <section className="content-section popular-section">
      <div className="section-heading"><div><h2>Popular Nutritional Calculators</h2><p>Explore our most useful calculators to help you reach your health and fitness goals.</p></div><Link href="/calculators">View All Calculators</Link></div>
      <div className="popular-grid">{popular.map(([title, desc, href]) => <Link key={title} href={href}><strong>{title}</strong><span>{desc}</span></Link>)}</div>
    </section>
    {compiledHome && <article className="prose prose-neutral mt-16 max-w-none border-t border-line pt-10">{compiledHome}</article>}

    <section className="content-section guide-section">
      <div className="section-heading"><div><h2>Nutrition Guides</h2><p>Practical, evidence-based guides to help you build better habits and reach your goals.</p></div><Link href="/guides">View All Guides</Link></div>
      <nav className="guide-links">{guides.map((g, i) => <Link key={g} href={`/guides/${["what-are-macros", "macro-ratios", "tracking-macros", "common-mistakes", "nutrition-basics"][i]}`}>{g}</Link>)}</nav>
    </section>
  </main>;
}
