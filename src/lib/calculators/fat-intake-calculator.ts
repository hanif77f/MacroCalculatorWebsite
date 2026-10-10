import { MACRO_CALORIE_GOALS } from "@/lib/constants";
import type { StandardGoal } from "@/lib/calculator-standardization";
import {
  calculateNutrientEnergy,
  type NutrientEnergyInput,
} from "@/lib/calculators/nutrient-energy-estimate";

export const FAT_ENERGY_RANGE = { min: 0.2, max: 0.35 } as const;
export const SATURATED_FAT_ENERGY_LIMIT = 0.1;
export const FAT_GRAMS_PER_KCAL = 9;

export interface FatGoalTarget {
  goal: StandardGoal;
  label: string;
  calories: number;
  minimumGrams: number;
  maximumGrams: number;
  midpointGrams: number;
}

export interface FatIntakeResult {
  goal: StandardGoal;
  bmr: number;
  maintenanceCalories: number;
  calories: number;
  formulaUsed: string;
  minimumGrams: number;
  maximumGrams: number;
  midpointGrams: number;
  saturatedFatAtTenPercent: number;
  goals: FatGoalTarget[];
}

export type FatIntakeInput = NutrientEnergyInput;

function fatRange(calories: number) {
  const minimumGrams = calories * FAT_ENERGY_RANGE.min / FAT_GRAMS_PER_KCAL;
  const maximumGrams = calories * FAT_ENERGY_RANGE.max / FAT_GRAMS_PER_KCAL;
  return {
    minimumGrams,
    maximumGrams,
    midpointGrams: (minimumGrams + maximumGrams) / 2,
  };
}

export function calculateFatIntake(input: FatIntakeInput): FatIntakeResult {
  const energy = calculateNutrientEnergy(input);
  const goals = Object.entries(MACRO_CALORIE_GOALS).map(([goal, definition]) => {
    const typedGoal = goal as StandardGoal;
    const goalEnergy = calculateNutrientEnergy({ ...input, goal: typedGoal });
    return {
      goal: typedGoal,
      label: definition.label,
      calories: goalEnergy.targetKcal,
      ...fatRange(goalEnergy.targetKcal),
    };
  });

  return {
    goal: input.goal,
    bmr: energy.bmr,
    maintenanceCalories: energy.tdee,
    calories: energy.targetKcal,
    formulaUsed: energy.formulaUsed,
    ...fatRange(energy.targetKcal),
    saturatedFatAtTenPercent: energy.targetKcal * SATURATED_FAT_ENERGY_LIMIT / FAT_GRAMS_PER_KCAL,
    goals,
  };
}
