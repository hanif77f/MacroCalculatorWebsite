import { calculateMacros, type MacroInput } from "@/lib/calculators/macro-calculator";

export type CarbInput = MacroInput;

export interface CarbResult {
  grams: number;
  calories: number;
  totalCalories: number;
  percentage: number;
}

export function calculateCarbs(input: CarbInput): CarbResult {
  const result = calculateMacros(input);
  const percentage = input.goal === "lose" ? 35 : input.goal === "build" ? 45 : 40;

  return {
    grams: result.carbs,
    calories: result.carbs * 4,
    totalCalories: result.targetKcal,
    percentage,
  };
}
