import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateMacros, MacroInput } from "./macro-calculator";

// TDEE calculator reuses the macro engine and just surfaces bmr/tdee —
// no duplicated math, single source of truth for the formulas.
export function calculateTdee(input: Omit<MacroInput, "goal">) {
  const result = calculateMacros({ ...input, goal: "maintain" });
  return { bmr: result.bmr, tdee: result.tdee, formulaUsed: result.formulaUsed };
}

export { ACTIVITY_MULTIPLIERS };
