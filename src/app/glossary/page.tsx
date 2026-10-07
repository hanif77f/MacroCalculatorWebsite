import Link from "next/link";
import { listContent } from "@/lib/mdx";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "Nutrition Glossary",
  description: "Explore definitions of nutrition, calorie, and fitness terms.",
  path: "/glossary",
});

export default function GuidesHub() {
  const guides = listContent("guides");
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">Guides</h1>
      <div className="mt-6 overflow-hidden rounded border border-line bg-white">
        {guides.length === 0 && <p className="p-4 text-muted text-sm">No guides yet — add .mdx files to content/guides/</p>}
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="block border-b border-line p-4 last:border-b-0">
            <strong className="block">{g.title}</strong>
            <small className="text-muted">{g.description}</small>
          </Link>
        ))}
      </div>
    </main>
  );
}
