import type { StandardGoal } from "@/lib/calculator-standardization";
import {
  calculateNutrientEnergy,
  type NutrientEnergyInput,
} from "@/lib/calculators/nutrient-energy-estimate";

export const DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE = 50;
export const CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE = { min: 45, max: 65 } as const;
export const CARBOHYDRATE_GRAMS_PER_KCAL = 4;
export const CARBOHYDRATE_COMPARISON_PERCENTAGES = [40, 55, 65, 75] as const;

export type CarbInput = NutrientEnergyInput & {
  percentage?: number;
};

export interface CarbResult {
  goal: StandardGoal;
  totalCalories: number;
  percentage: number;
  grams: number;
  calories: number;
}

export function calculateCarbohydratePortion(totalCalories: number, percentage: number) {
  if (!Number.isFinite(totalCalories) || totalCalories < 0
    || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new RangeError("Calories must be non-negative and carbohydrate percentage must be between 0 and 100.");
  }
  const calories = totalCalories * percentage / 100;
  return { calories, grams: calories / CARBOHYDRATE_GRAMS_PER_KCAL };
}

export function calculateCarbs(input: CarbInput): CarbResult {
  const percentage = input.percentage ?? DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE;
  if (!Number.isInteger(percentage)
    || percentage < CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.min
    || percentage > CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.max) {
    throw new RangeError(
      `Carbohydrate percentage must be a whole number between ${CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.min} and ${CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.max}.`,
    );
  }
  const energy = calculateNutrientEnergy(input);
  const portion = calculateCarbohydratePortion(energy.targetKcal, percentage);
  return {
    goal: input.goal,
    totalCalories: energy.targetKcal,
    percentage,
    ...portion,
  };
}
