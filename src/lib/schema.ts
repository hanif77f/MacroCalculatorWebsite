// JSON-LD builders. Each returns a plain object — render it in the page
// with <script type="application/ld+json"> and JSON.stringify(...).

export function organizationSchema(options?: { sameAs?: string[] }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://macrocalculators.com/#organization",
    name: "MacroCalculators",
    url: "https://macrocalculators.com/",
    logo: "https://macrocalculators.com/images/logo/logo.png",
    email: "macrocalculators@gmail.com",
  };

  if (options?.sameAs && options.sameAs.length > 0) {
    schema.sameAs = options.sameAs;
  }

  return schema;
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://macrocalculators.com/#website",
    name: "MacroCalculators",
    url: "https://macrocalculators.com/",
    publisher: {
      "@id": "https://macrocalculators.com/#organization",
    },
  };
}

export function editorialTeamProfileSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://macrocalculators.com/editorial-team#profile",
    url: "https://macrocalculators.com/editorial-team",
    name: "MacroCalculators Editorial Team | Nutrition & Fitness Calculators",
    mainEntity: {
      "@type": "Organization",
      "@id": "https://macrocalculators.com/#editorial-team",
      name: "MacroCalculators Editorial Team",
      url: "https://macrocalculators.com/editorial-team",
      description: "The editorial team behind MacroCalculators.com's nutrition and fitness calculators and educational content.",
      logo: "https://macrocalculators.com/images/logo/logo.png",
      email: "macrocalculators@gmail.com",
    },
  };
}

export function webPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleSchema(options: {
  headline: string;
  description: string;
  url: string;
  publisherId: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.headline,
    description: options.description,
    mainEntityOfPage: options.url,
    author: {
      "@id": "https://macrocalculators.com/#editorial-team",
    },
    publisher: {
      "@id": options.publisherId,
    },
  };

  if (options.datePublished) {
    schema.datePublished = options.datePublished;
  }

  if (options.dateModified) {
    schema.dateModified = options.dateModified;
  }

  return schema;
}

export function contactPageSchema(email?: string) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
  };

  if (email) {
    schema.email = email.replace(/^mailto:/i, "");
  }

  return schema;
}

export function webApplicationSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "SportsApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
