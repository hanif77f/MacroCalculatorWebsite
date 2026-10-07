// Single source of truth. Add a calculator here and it automatically
// appears in the nav, the /calculators hub, related-tools lists, and
// the sitemap. No other file needs editing for those to update.

export type Cluster = "macro" | "neutral";
export const calculatorNavigationGroups = [
  { id: "nutrition", label: "Nutrition & Macros" },
  { id: "energy", label: "Energy & Calories" },
  { id: "body-composition", label: "Body Composition" },
] as const;
export type CalculatorNavigationGroup = (typeof calculatorNavigationGroups)[number]["id"];

export interface CalculatorEntry {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  cluster: Cluster; // macro = protein/carb/fat color; neutral = gray
  calculatorType: string;
  navigationGroup?: CalculatorNavigationGroup;
  navigationOrder?: number;
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
    navigationGroup: "nutrition",
    navigationOrder: 1,
    isHomepage: true, // homepage IS the tool page — no separate /calculators/macro-calculator route
  },
  {
    slug: "tdee-calculator",
    title: "TDEE Calculator",
    shortTitle: "TDEE Calculator",
    description: "Estimate your maintenance calories using trusted formulas.",
    cluster: "neutral",
    calculatorType: "tdee",
    navigationGroup: "energy",
    navigationOrder: 2,
  },
  {
    slug: "calorie-calculator",
    title: "Calorie Calculator",
    shortTitle: "Calorie Calculator",
    description: "Estimate your daily calorie needs for maintenance, weight loss, or weight gain.",
    cluster: "neutral",
    calculatorType: "calories",
    navigationGroup: "energy",
    navigationOrder: 3,
  },
  {
    slug: "bmr-calculator",
    title: "BMR Calculator",
    shortTitle: "BMR Calculator",
    description: "Estimate your Basal Metabolic Rate — calories burned at rest.",
    cluster: "neutral",
    calculatorType: "bmr",
    navigationGroup: "energy",
    navigationOrder: 1,
  },
  {
    slug: "protein-calculator",
    title: "Protein Calculator",
    shortTitle: "Protein Calculator",
    description: "Estimate a practical daily protein target based on your body weight, activity level, and goal.",
    cluster: "macro",
    calculatorType: "protein",
    navigationGroup: "nutrition",
    navigationOrder: 2,
  },
  {
    slug: "carb-calculator",
    title: "Carb Calculator",
    shortTitle: "Carbs Calculator",
    description: "Estimate a daily carbohydrate target based on your calorie needs, activity, and goal.",
    cluster: "macro",
    calculatorType: "carbs",
    navigationGroup: "nutrition",
    navigationOrder: 3,
  },
  {
    slug: "fat-intake-calculator",
    title: "Fat Intake Calculator",
    shortTitle: "Fat Intake Calculator",
    description: "Calculate your daily dietary fat target in grams from your calorie intake and chosen percentage of calories from fat.",
    cluster: "macro",
    calculatorType: "fat",
    navigationGroup: "nutrition",
    navigationOrder: 4,
  },
  {
    slug: "body-fat-calculator",
    title: "Body Fat Calculator",
    shortTitle: "Body Fat Calculator",
    description: "Estimate body fat percentage from your height, neck, waist, hip, weight, and sex using the U.S. Navy circumference method.",
    cluster: "neutral",
    calculatorType: "bodyfat",
    navigationGroup: "body-composition",
    navigationOrder: 1,
  },
  {
    slug: "lean-body-mass-calculator",
    title: "Lean Body Mass Calculator",
    shortTitle: "Lean Body Mass",
    description: "Compare Boer, James, and Hume equations to estimate lean body mass from your sex, age, height, and weight.",
    cluster: "neutral",
    calculatorType: "leanmass",
    navigationGroup: "body-composition",
    navigationOrder: 2,
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
    description: "Estimate your maintenance calories, select a daily deficit, and find a practical calorie target for weight loss.",
    cluster: "neutral",
    calculatorType: "deficit",
    navigationGroup: "energy",
    navigationOrder: 4,
  },
  {
    slug: "maintenance-calorie-calculator",
    title: "Maintenance Calorie Calculator",
    shortTitle: "Maintenance Calories",
    description: "Find the calories that keep your weight stable.",
    cluster: "neutral",
    calculatorType: "maintenance",
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
