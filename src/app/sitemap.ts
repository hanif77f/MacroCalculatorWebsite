import { MetadataRoute } from "next";
import { calculators } from "@/data/calculators";
import { getAllSlugs, getContent } from "@/lib/mdx";

const BASE = "https://macrocalculators.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const calcUrls = calculators.filter((calculator) =>
    !calculator.isHomepage && getContent("calculators", calculator.slug),
  ).map((c) => ({
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
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/editorial-team`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/terms-of-use`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/disclaimer`, changeFrequency: "yearly", priority: 0.4 },
    ...calcUrls,
    ...guideUrls,
    ...foodUrls,
    ...glossaryUrls,
  ];
}
