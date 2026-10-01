// Shared numeric constants used across calculator logic.
// Keep every "magic number" here, referenced by name, not re-typed
// inside individual calculator files.

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  veryActive: 1.725,
  extremelyActive: 1.9,
} as const;

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
} as const;

// [protein%, carbs%, fat%]
export const MACRO_SPLITS: Record<string, [number, number, number]> = {
  lose: [0.40, 0.35, 0.25],
  build: [0.30, 0.45, 0.25],
  maintain: [0.30, 0.40, 0.30],
  keto: [0.25, 0.08, 0.67],
};

export const GOAL_ADJUSTMENT_KCAL = {
  lose: -450,
  build: 275,
  maintain: 0,
  keto: 0,
} as const;
