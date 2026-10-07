import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateBmr, type BmrInput } from "@/lib/calculators/macro-calculator";

export type CalorieGoal = "maintain" | "mildLose" | "lose" | "mildGain" | "gain";

export interface CalorieInput extends BmrInput {
  activity: keyof typeof ACTIVITY_MULTIPLIERS;
  goal: CalorieGoal;
}

export interface CalorieResult {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  goal: CalorieGoal;
  formulaUsed: string;
}

const goalAdjustments: Record<CalorieGoal, number> = {
  maintain: 0,
  mildLose: -250,
  lose: -500,
  mildGain: 250,
  gain: 500,
};

export function calculateCalories(input: CalorieInput): CalorieResult {
  const { age, weightKg, heightCm, activity, goal } = input;
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("Weight and height must be positive numbers.");
  }
  if ((input.formula === "katch" || input.formula === "cunningham")
    && (!Number.isFinite(input.bodyFatPct) || (input.bodyFatPct ?? 0) < 3 || (input.bodyFatPct ?? 0) > 70)) {
    throw new RangeError("Body fat percentage must be between 3 and 70 for this formula.");
  }

  const { bmr, formulaUsed } = calculateBmr(input);
  const maintenanceCalories = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
  const targetCalories = Math.max(0, maintenanceCalories + goalAdjustments[goal]);

  return { bmr, maintenanceCalories, targetCalories, goal, formulaUsed };
}
