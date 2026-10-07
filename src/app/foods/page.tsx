import Link from "next/link";
import { listContent } from "@/lib/mdx";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "Food Nutrition",
  description: "Explore food nutrition information and macro details from MacroCalculators.",
  path: "/foods",
});

export default function FoodsHub() {
  const foods = listContent("foods");
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">Foods</h1>
      <div className="mt-6 overflow-hidden rounded border border-line bg-white">
        {foods.length === 0 && <p className="p-4 text-muted text-sm">No foods yet — add .mdx files to content/foods/</p>}
        {foods.map((g) => (
          <Link key={g.slug} href={`/foods/${g.slug}`} className="block border-b border-line p-4 last:border-b-0">
            <strong className="block">{g.title}</strong>
            <small className="text-muted">{g.description}</small>
          </Link>
        ))}
      </div>
    </main>
  );
}
