import { MetadataRoute } from "next";
import { calculators } from "@/data/calculators";
import { getAllSlugs } from "@/lib/mdx";

const BASE = "https://macrocalculators.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const calcUrls = calculators.map((c) => ({
    url: `${BASE}/calculators/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));
  const guideUrls = getAllSlugs("guides").map((slug) => ({
    url: `${BASE}/guides/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const foodUrls = getAllSlugs("foods").map((slug) => ({
    url: `${BASE}/foods/${slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));
  const glossaryUrls = getAllSlugs("glossary").map((slug) => ({
    url: `${BASE}/glossary/${slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/calculators`, changeFrequency: "weekly", priority: 0.9 },
    ...calcUrls,
    ...guideUrls,
    ...foodUrls,
    ...glossaryUrls,
  ];
}
