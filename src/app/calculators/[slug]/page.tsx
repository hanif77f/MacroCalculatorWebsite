import { notFound } from "next/navigation";
import { calculators, getCalculator } from "@/data/calculators";
import { getContent } from "@/lib/mdx";
import { generateSeo } from "@/lib/seo";
import { webApplicationSchema, breadcrumbSchema } from "@/lib/schema";
import CalculatorWidget from "@/components/CalculatorWidget";

// ONE template renders every calculator page EXCEPT macro-calculator,
// which is canonical at "/" (the homepage IS the macro calculator tool
// page — see data/calculators.ts isHomepage flag). This prevents two
// URLs competing for the same "macro calculator" keyword.

export function generateStaticParams() {
  return calculators.filter((c) => !c.isHomepage).map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const entry = getCalculator(params.slug);
  if (!entry || entry.isHomepage) return {};
  return generateSeo({ title: entry.title, description: entry.description, path: `/calculators/${entry.slug}` });
}

export default function CalculatorPage({ params }: { params: { slug: string } }) {
  const entry = getCalculator(params.slug);
  if (!entry || entry.isHomepage) return notFound(); // guards against direct navigation too
  const content = getContent("calculators", params.slug);

  const schema = [
    webApplicationSchema(entry.title, entry.description, `https://macrocalculators.com/calculators/${entry.slug}`),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "Calculators", url: "https://macrocalculators.com/calculators" },
      { name: entry.title, url: `https://macrocalculators.com/calculators/${entry.slug}` },
    ]),
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1 className="font-display text-3xl font-extrabold">{entry.title}</h1>
      <p className="mt-2 max-w-xl text-muted">{entry.description}</p>
      <div className="mt-6"><CalculatorWidget /></div>
      {content ? (
        <article className="prose prose-neutral mt-10 max-w-none">
          {/* render content.content via MDX compiler */}
        </article>
      ) : (
        <p className="mt-10 text-sm text-muted">Content file not found: content/calculators/{params.slug}.mdx</p>
      )}
    </main>
  );
}
