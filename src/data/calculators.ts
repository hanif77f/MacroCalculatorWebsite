// Single source of truth. Add a calculator here and it automatically
// appears in the nav, the /calculators hub, related-tools lists, and
// the sitemap. No other file needs editing for those to update.

export type Cluster = "macro" | "neutral";

export interface CalculatorEntry {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  cluster: Cluster; // macro = protein/carb/fat color; neutral = gray
  calculatorType: string;
  isHomepage?: boolean; // true = this tool's canonical URL is "/", not /calculators/slug
}

export const calculators: CalculatorEntry[] = [
  {
    slug: "macro-calculator",
    title: "Macro Calculator",
    shortTitle: "Macro Calculator",
    description: "Get your daily calorie and macro targets based on your goal, activity level, and body stats.",
    cluster: "macro",
    calculatorType: "macro",
    isHomepage: true, // homepage IS the tool page — no separate /calculators/macro-calculator route
  },
  {
    slug: "tdee-calculator",
    title: "TDEE Calculator (Calorie Calculator)",
    shortTitle: "Calorie Calculator (TDEE)",
    description: "Estimate your maintenance calories using trusted formulas.",
    cluster: "neutral",
    calculatorType: "tdee",
  },
  {
    slug: "bmr-calculator",
    title: "BMR Calculator",
    shortTitle: "BMR Calculator",
    description: "Estimate your Basal Metabolic Rate — calories burned at rest.",
    cluster: "neutral",
    calculatorType: "bmr",
  },
  {
    slug: "protein-calculator",
    title: "Protein Calculator",
    shortTitle: "Protein Calculator",
    description: "Find your optimal daily protein intake for your goal and body weight.",
    cluster: "macro",
    calculatorType: "protein",
  },
  {
    slug: "carb-calculator",
    title: "Carb Calculator",
    shortTitle: "Carbs Calculator",
    description: "Calculate your ideal carbohydrate intake for energy and performance.",
    cluster: "macro",
    calculatorType: "carbs",
  },
  {
    slug: "fat-calculator",
    title: "Fat Calculator",
    shortTitle: "Fat Calculator",
    description: "Get your recommended daily fat intake for hormone and overall health.",
    cluster: "macro",
    calculatorType: "fat",
  },
  {
    slug: "body-fat-calculator",
    title: "Body Fat Calculator",
    shortTitle: "Body Fat Calculator",
    description: "Estimate your body fat percentage using multiple methods.",
    cluster: "neutral",
    calculatorType: "bodyfat",
  },
  {
    slug: "lean-body-mass-calculator",
    title: "Lean Body Mass Calculator",
    shortTitle: "Lean Body Mass",
    description: "Estimate your fat-free body mass.",
    cluster: "neutral",
    calculatorType: "leanmass",
  },
  {
    slug: "ffmi-calculator",
    title: "FFMI Calculator",
    shortTitle: "FFMI Calculator",
    description: "Fat-Free Mass Index — a muscularity benchmark adjusted for height.",
    cluster: "neutral",
    calculatorType: "ffmi",
  },
  {
    slug: "calorie-deficit-calculator",
    title: "Calorie Deficit Calculator",
    shortTitle: "Calorie Deficit",
    description: "Find the right deficit for sustainable fat loss.",
    cluster: "neutral",
    calculatorType: "deficit",
  },
  {
    slug: "maintenance-calorie-calculator",
    title: "Maintenance Calorie Calculator",
    shortTitle: "Maintenance Calories",
    description: "Find the calories that keep your weight stable.",
    cluster: "neutral",
    calculatorType: "maintenance",
  },
  {
    slug: "keto-macro-calculator",
    title: "Keto Macro Calculator",
    shortTitle: "Keto Macro Calculator",
    description: "Lower-carb, keto-friendly macro targets.",
    cluster: "macro",
    calculatorType: "keto",
  },
  {
    slug: "one-rep-max-calculator",
    title: "One Rep Max Calculator",
    shortTitle: "One Rep Max Calculator",
    description: "Estimate your 1RM for bench press, squat, deadlift and more.",
    cluster: "neutral",
    calculatorType: "onerepmax",
  },
];

export function getCalculator(slug: string) {
  return calculators.find((c) => c.slug === slug);
}

// Returns the correct link for a calculator — "/" for the homepage tool,
// "/calculators/slug" for everything else. Use this everywhere instead
// of hand-building hrefs, so the homepage-canonical rule can't be
// accidentally violated in some new component later.
export function calculatorHref(entry: CalculatorEntry) {
  return entry.isHomepage ? "/" : `/calculators/${entry.slug}`;
}

export function clusterColorClass(cluster: Cluster) {
  return cluster === "macro" ? "bg-protein" : "bg-neutral";
}
