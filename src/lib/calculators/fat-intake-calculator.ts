import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateBmr, type BmrInput } from "@/lib/calculators/macro-calculator";

export interface FatIntakeInput extends BmrInput {
  activity: keyof typeof ACTIVITY_MULTIPLIERS;
  percentage: number;
}

export interface FatGoalTarget {
  label: string;
  calories: number;
  minimumGrams: number;
  maximumGrams: number;
}

export interface FatIntakeResult {
  bmr: number;
  calories: number;
  formulaUsed: string;
  percentage: number;
  grams: number;
  minimumGrams: number;
  maximumGrams: number;
  saturatedFatAtTenPercent: number;
  saturatedFatAtSevenPercent: number;
  goals: FatGoalTarget[];
}

const goalAdjustments = [
  { label: "Maintenance", adjustment: 0 },
  { label: "Lose 0.5 kg/week", adjustment: -500 },
  { label: "Lose 1 kg/week", adjustment: -1000 },
  { label: "Gain 0.5 kg/week", adjustment: 500 },
  { label: "Gain 1 kg/week", adjustment: 1000 },
] as const;

function fatRange(calories: number) {
  const roundedGrams = (fraction: number) => Math.round(Number((calories * fraction / 9).toFixed(1)));
  return {
    minimumGrams: roundedGrams(0.2),
    maximumGrams: roundedGrams(0.35),
  };
}

export function calculateFatIntake(input: FatIntakeInput): FatIntakeResult {
  const { age, weightKg, heightCm, activity, percentage } = input;
  if (!Number.isFinite(age) || age < 18 || age > 100) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) {
    throw new RangeError("Weight and height must be positive numbers.");
  }
  if (!Number.isInteger(percentage) || percentage < 20 || percentage > 35) {
    throw new RangeError("Fat percentage must be a whole number between 20 and 35.");
  }
  if ((input.formula === "katch" || input.formula === "cunningham")
    && (!Number.isFinite(input.bodyFatPct) || (input.bodyFatPct ?? 0) < 3 || (input.bodyFatPct ?? 0) > 70)) {
    throw new RangeError("Body fat percentage must be between 3 and 70 for this formula.");
  }

  const { bmr, formulaUsed } = calculateBmr(input);
  const calories = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
  const { minimumGrams, maximumGrams } = fatRange(calories);

  return {
    bmr,
    calories,
    formulaUsed,
    percentage,
    grams: Math.round(calories * percentage / 100 / 9),
    minimumGrams,
    maximumGrams,
    saturatedFatAtTenPercent: Math.ceil(calories * 0.1 / 9),
    saturatedFatAtSevenPercent: Math.ceil(calories * 0.07 / 9),
    goals: goalAdjustments.map(({ label, adjustment }) => {
      const goalCalories = Math.max(0, calories + adjustment);
      return { label, calories: goalCalories, ...fatRange(goalCalories) };
    }),
  };
}
