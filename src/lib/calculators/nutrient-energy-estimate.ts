import {
  calculateMacrosSafe,
  type MacroInput,
  type MacroResult,
} from "@/lib/calculators/macro-calculator";
import type { StandardGoal } from "@/lib/calculator-standardization";

export type NutrientEnergyInput = Omit<MacroInput, "goal" | "split" | "customSplit"> & {
  goal: StandardGoal;
};

export function calculateNutrientEnergy(input: NutrientEnergyInput): MacroResult {
  const result = calculateMacrosSafe({
    ...input,
    goal: input.goal,
    split: "balanced",
  });
  if (!result.valid) {
    throw new RangeError(result.errors.join(" "));
  }
  return result;
}
