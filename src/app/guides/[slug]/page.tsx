import { notFound } from "next/navigation";
import { getContent, getAllSlugs } from "@/lib/mdx";
import { generateSeo } from "@/lib/seo";

export function generateStaticParams() {
  return getAllSlugs("guides").map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const entry = getContent("guides", params.slug);
  if (!entry) return {};
  return generateSeo({ title: entry.frontmatter.title, description: entry.frontmatter.description, path: `/guides/${params.slug}` });
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const entry = getContent("guides", params.slug);
  if (!entry) return notFound();
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">{entry.frontmatter.title}</h1>
      <article className="prose prose-neutral mt-6 max-w-none">{/* render entry.content via MDX compiler */}</article>
    </main>
  );
}
