import { ACTIVITY_LEVELS, MACRO_CALORIE_GOALS } from "@/lib/constants";

export const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_LEVELS).map(([value, definition]) => ({
  value,
  label: `${definition.label} — ${definition.hint}`,
  multiplier: definition.multiplier,
}));

export const GOAL_OPTIONS = Object.entries(MACRO_CALORIE_GOALS).map(([value, definition]) => ({
  value,
  label: definition.label,
  adjustmentKcal: definition.adjustmentKcal,
}));

export type StandardGoal = keyof typeof MACRO_CALORIE_GOALS;

export function getGoalCategory(goal: StandardGoal): "maintain" | "lose" | "build" {
  if (goal.startsWith("lose-")) return "lose";
  if (goal.startsWith("gain-")) return "build";
  return "maintain";
}
