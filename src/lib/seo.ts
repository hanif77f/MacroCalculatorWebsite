import type { Metadata } from "next";

const SITE_URL = "https://macrocalculators.com";
const SITE_NAME = "MacroCalculators";
export const OG_IMAGE = "/images/og/macrocalculators-og.webp";

export function generateSeo(opts: {
  title: string;
  metaTitle?: string;
  description: string;
  path: string;
  keywords?: string[];
  robots?: { index: boolean; follow: boolean };
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: opts.metaTitle ?? `${opts.title} | ${SITE_NAME}`,
    description: opts.description,
    keywords: opts.keywords,
    robots: opts.robots,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [OG_IMAGE],
    },
  };
}
