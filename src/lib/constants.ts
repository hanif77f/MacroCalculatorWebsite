// Shared numeric constants used across calculator logic.
// Keep every "magic number" here, referenced by name, not re-typed
// inside individual calculator files.

export const ACTIVITY_LEVELS = {
  sedentary: { label: "Sedentary", multiplier: 1.2, hint: "Little or no exercise" },
  "lightly-active": { label: "Lightly Active", multiplier: 1.375, hint: "Exercise 1–3 times per week" },
  "moderately-active": { label: "Moderately Active", multiplier: 1.465, hint: "Exercise 4–5 times per week" },
  active: { label: "Active", multiplier: 1.55, hint: "Daily exercise or intense exercise 3–4 times per week" },
  "very-active": { label: "Very Active", multiplier: 1.725, hint: "Intense exercise 6–7 times per week" },
  "extra-active": { label: "Extra Active", multiplier: 1.9, hint: "Very intense exercise daily or a physically demanding job" },
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

export const MACRO_KCAL_PER_GRAM = {
  protein: 4.1,
  carbs: 3.75,
  fat: 8.8,
} as const;

/** @deprecated Use MACRO_KCAL_PER_GRAM. */
export const REFERENCE_PRESET_KCAL_PER_GRAM = MACRO_KCAL_PER_GRAM;

export const MACRO_SPLITS = {
  balanced: [0.25, 0.5, 0.25],
  lowFat: [0.275, 0.525, 0.2],
  lowCarb: [0.3, 0.4, 0.3],
  highProtein: [0.35, 0.425, 0.225],
  keto: [0.25, 0.05, 0.7],
} as const;

/** @deprecated Use MACRO_SPLITS with a separate calorie goal. */
export const LEGACY_MACRO_SPLITS = {
  lose: [0.4, 0.35, 0.25],
  build: [0.3, 0.45, 0.25],
  maintain: [0.3, 0.4, 0.3],
  keto: [0.25, 0.05, 0.7],
} as const;

export const GOAL_CALORIE_ADJUSTMENTS = {
  lose: -0.15,
  maintain: 0,
  muscleGain: 0.1,
} as const;

export const MACRO_CALORIE_GOALS = {
  maintain: { label: "Maintain weight", adjustmentKcal: 0, weeklyWeightChangeKg: undefined },
  "lose-mild": { label: "Mild weight loss — 0.25 kg (0.5 lb) per week", adjustmentKcal: -250, weeklyWeightChangeKg: -0.25 },
  "lose-standard": { label: "Weight loss — 0.5 kg (1 lb) per week", adjustmentKcal: -500, weeklyWeightChangeKg: -0.5 },
  "lose-fast": { label: "Faster weight loss — 1 kg (2 lb) per week", adjustmentKcal: -1000, weeklyWeightChangeKg: -1 },
  "gain-mild": { label: "Mild weight gain — 0.25 kg (0.5 lb) per week", adjustmentKcal: 250, weeklyWeightChangeKg: 0.25 },
  "gain-standard": { label: "Weight gain — 0.5 kg (1 lb) per week", adjustmentKcal: 500, weeklyWeightChangeKg: 0.5 },
  "gain-fast": { label: "Faster weight gain — 1 kg (2 lb) per week", adjustmentKcal: 1000, weeklyWeightChangeKg: 1 },
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
