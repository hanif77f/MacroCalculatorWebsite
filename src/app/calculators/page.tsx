import CalculatorArchive from "@/components/CalculatorArchive";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { generateSeo } from "@/lib/seo";

export const metadata = generateSeo({
  title: "All Calculators",
  metaTitle: "Nutrition Calculators: Macro, TDEE, Protein & More",
  description: "Every nutrition and fitness calculator on MacroCalculators.",
  path: "/calculators",
});

export default function CalculatorsHub() {
  const schema = [
    webPageSchema("All Calculators", "Every nutrition and fitness calculator on MacroCalculators.", "https://macrocalculators.com/calculators"),
    breadcrumbSchema([
      { name: "Home", url: "https://macrocalculators.com" },
      { name: "Calculators", url: "https://macrocalculators.com/calculators" },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <CalculatorArchive />
    </>
  );
}
