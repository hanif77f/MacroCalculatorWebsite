export const GRAMS_PER_OUNCE = 28.349523125;

export type NutrientDisplayUnit = "grams" | "ounces";

export function formatNutrientAmount(grams: number, unit: NutrientDisplayUnit): string {
  if (unit === "ounces") {
    return (grams / GRAMS_PER_OUNCE).toFixed(2);
  }
  return Math.round(grams).toLocaleString();
}
