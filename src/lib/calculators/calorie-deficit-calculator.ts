import { calculateTdee } from "@/lib/calculators/tdee-calculator";
import type { MacroInput } from "@/lib/calculators/macro-calculator";

export interface CalorieDeficitInput extends Omit<MacroInput, "goal"> {
  deficitKcal: number;
  targetWeightKg?: number;
}

export interface CalorieDeficitResult {
  bmr: number;
  maintenanceCalories: number;
  deficitCalories: number;
  targetCalories: number;
  estimatedWeeklyLossKg: number;
  formulaUsed: string;
  estimatedWeightToLoseKg?: number;
  estimatedTimeWeeks?: number;
}

export function calculateCalorieDeficit(input: CalorieDeficitInput): CalorieDeficitResult {
  const { age, weightKg, heightCm, deficitKcal, targetWeightKg } = input;
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("Weight and height must be positive numbers.");
  }
  if (!Number.isFinite(deficitKcal) || deficitKcal <= 0) {
    throw new RangeError("Choose a positive daily calorie deficit.");
  }
  if (targetWeightKg !== undefined && (!Number.isFinite(targetWeightKg) || targetWeightKg <= 0 || targetWeightKg >= weightKg)) {
    throw new RangeError("Target weight must be positive and lower than current weight.");
  }
  if ((input.formula === "katch" || input.formula === "cunningham")
    && (!Number.isFinite(input.bodyFatPct) || (input.bodyFatPct ?? 0) < 3 || (input.bodyFatPct ?? 0) > 70)) {
    throw new RangeError("Body fat percentage must be between 3 and 70 for this formula.");
  }

  const tdee = calculateTdee(input);
  if (deficitKcal >= tdee.tdee) {
    throw new RangeError("The selected deficit must be lower than your estimated maintenance calories.");
  }

  const estimatedWeeklyLossKg = (deficitKcal * 7) / 7700;
  return {
    bmr: tdee.bmr,
    maintenanceCalories: tdee.tdee,
    deficitCalories: Math.round(deficitKcal),
    targetCalories: Math.round(tdee.tdee - deficitKcal),
    estimatedWeeklyLossKg,
    formulaUsed: tdee.formulaUsed,
    estimatedWeightToLoseKg: targetWeightKg === undefined ? undefined : weightKg - targetWeightKg,
    estimatedTimeWeeks: targetWeightKg === undefined ? undefined : (weightKg - targetWeightKg) / estimatedWeeklyLossKg,
  };
}
