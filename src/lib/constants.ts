// Shared numeric constants used across calculator logic.
// Keep every "magic number" here, referenced by name, not re-typed
// inside individual calculator files.

export const ACTIVITY_LEVELS = {
  sedentary: { label: "Sedentary", multiplier: 1.2, hint: "little or no exercise" },
  light: { label: "Lightly Active", multiplier: 1.375, hint: "1 to 3 days/week" },
  moderate: { label: "Moderately Active", multiplier: 1.55, hint: "3 to 5 days/week" },
  veryActive: { label: "Very Active", multiplier: 1.725, hint: "6 to 7 days/week" },
  extremelyActive: { label: "Extremely Active", multiplier: 1.9, hint: "hard daily training or a physical job" },
} as const;

export const ACTIVITY_MULTIPLIERS = Object.fromEntries(
  Object.entries(ACTIVITY_LEVELS).map(([level, definition]) => [level, definition.multiplier]),
) as { [Level in keyof typeof ACTIVITY_LEVELS]: (typeof ACTIVITY_LEVELS)[Level]["multiplier"] };

export const CALCULATOR_INPUT_LIMITS = {
  ageYears: { min: 18, max: 80 },
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  bodyFatPct: { min: 3, max: 70 },
} as const;

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
} as const;

export const MACRO_SPLITS = {
  balanced: [0.3, 0.4, 0.3],
  highProtein: [0.4, 0.3, 0.3],
  lowCarb: [0.3, 0.2, 0.5],
  keto: [0.25, 0.05, 0.7],
} as const;

/** @deprecated Use MACRO_SPLITS with a separate calorie goal. */
export const LEGACY_MACRO_SPLITS = {
  lose: [0.4, 0.35, 0.25],
  build: [0.3, 0.45, 0.25],
  maintain: MACRO_SPLITS.balanced,
  keto: MACRO_SPLITS.keto,
} as const;

export const GOAL_CALORIE_ADJUSTMENTS = {
  lose: -0.15,
  maintain: 0,
  muscleGain: 0.1,
} as const;

/** @deprecated Use GOAL_CALORIE_ADJUSTMENTS; values are TDEE fractions, not kcal. */
export const GOAL_ADJUSTMENT_KCAL = {
  lose: GOAL_CALORIE_ADJUSTMENTS.lose,
  build: GOAL_CALORIE_ADJUSTMENTS.muscleGain,
  maintain: GOAL_CALORIE_ADJUSTMENTS.maintain,
  keto: GOAL_CALORIE_ADJUSTMENTS.maintain,
} as const;

export const PROTEIN_TARGET_G_PER_KG = {
  min: 1.6,
  max: 2.2,
} as const;

export const MINIMUM_FAT_CALORIE_SHARE = 0.2;

export const MINIMUM_CALORIE_WARNING_THRESHOLDS = {
  female: 1200,
  male: 1500,
} as const;
