import Link from "next/link";
import { calculators, clusterColorClass, calculatorHref } from "@/data/calculators";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "All Calculators",
  description: "Every nutrition and fitness calculator on MacroCalculators.",
  path: "/calculators",
});

export default function CalculatorsHub() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">Calculators</h1>
      <div className="mt-6 overflow-hidden rounded border border-line bg-white">
        {calculators.map((c) => (
          <Link key={c.slug} href={calculatorHref(c)} className="flex gap-3 border-b border-line p-4 last:border-b-0">
            <span className={`w-1 rounded ${clusterColorClass(c.cluster)}`} />
            <span><strong className="block">{c.title}</strong><small className="text-muted">{c.description}</small></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
