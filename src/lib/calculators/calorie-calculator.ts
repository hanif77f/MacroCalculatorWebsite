import { MACRO_CALORIE_GOALS } from "@/lib/constants";
import type { StandardGoal } from "@/lib/calculator-standardization";
import { calculateTdee } from "@/lib/calculators/tdee-calculator";
import type { MacroInput } from "@/lib/calculators/macro-calculator";

export type CalorieGoal = StandardGoal | "mildLose" | "lose" | "mildGain" | "gain";

export interface CalorieInput extends Omit<MacroInput, "goal"> {
  goal: CalorieGoal;
}

export interface CalorieResult {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  goal: CalorieGoal;
  formulaUsed: string;
}

const legacyGoalAdjustments = {
  mildLose: -250,
  lose: -500,
  mildGain: 250,
  gain: 500,
} as const;

function getGoalAdjustment(goal: CalorieGoal) {
  switch (goal) {
    case "mildLose":
    case "lose":
    case "mildGain":
    case "gain":
      return legacyGoalAdjustments[goal];
    default:
      return MACRO_CALORIE_GOALS[goal].adjustmentKcal;
  }
}

export function calculateCalories(input: CalorieInput): CalorieResult {
  const { age, weightKg, heightCm, goal } = input;
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("Weight and height must be positive numbers.");
  }
  const { bmr, tdee: maintenanceCalories, formulaUsed } = calculateTdee(input);
  const targetCalories = Math.max(0, maintenanceCalories + getGoalAdjustment(goal));

  return { bmr, maintenanceCalories, targetCalories, goal, formulaUsed };
}
