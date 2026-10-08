import {
  ACTIVITY_MULTIPLIERS,
  CALCULATOR_INPUT_LIMITS,
  GOAL_CALORIE_ADJUSTMENTS,
  KCAL_PER_GRAM,
  LEGACY_MACRO_SPLITS,
  MACRO_SPLITS,
  MINIMUM_CALORIE_WARNING_THRESHOLDS,
  MINIMUM_FAT_CALORIE_SHARE,
  PROTEIN_TARGET_G_PER_KG,
} from "@/lib/constants";

export type MacroSplit = keyof typeof MACRO_SPLITS;
export type MacroGoal = "lose" | "maintain" | "build" | "keto";
export type CanonicalMacroGoal = keyof typeof GOAL_CALORIE_ADJUSTMENTS;
export type BmrFormula = "mifflin" | "katch" | "cunningham" | "harris";

export interface MacroInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activity: keyof typeof ACTIVITY_MULTIPLIERS;
  goal: MacroGoal;
  calorieGoal?: CanonicalMacroGoal;
  formula: BmrFormula;
  bodyFatPct?: number;
  split?: MacroSplit | "custom";
  customSplit?: readonly [number, number, number];
}

export interface MacroResult {
  valid: true;
  bmr: number;
  tdee: number;
  targetKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  formulaUsed: string;
  proteinPerKg: number;
  actualProteinShare: number;
  actualCarbShare: number;
  actualFatShare: number;
  warnings: string[];
  bodyFatFallback: boolean;
}

export interface InvalidMacroResult {
  valid: false;
  errors: string[];
  bmr: null;
  tdee: null;
  targetKcal: null;
  protein: null;
  carbs: null;
  fat: null;
  formulaUsed: null;
  proteinPerKg: null;
  actualProteinShare: null;
  actualCarbShare: null;
  actualFatShare: null;
  warnings: string[];
  bodyFatFallback: false;
}

export type MacroCalculationResult = MacroResult | InvalidMacroResult;

export type BmrInput = Pick<MacroInput, "weightKg" | "heightCm" | "age" | "sex" | "formula" | "bodyFatPct">;

function bmrMifflin(w: number, h: number, age: number, sex: "male" | "female") {
  return sex === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
}

function bmrHarris(w: number, h: number, age: number, sex: "male" | "female") {
  return sex === "male"
    ? 13.397 * w + 4.799 * h - 5.677 * age + 88.362
    : 9.247 * w + 3.098 * h - 4.33 * age + 447.593;
}

function bmrKatch(lbm: number) {
  return 370 + 21.6 * lbm;
}

function bmrCunningham(lbm: number) {
  return 500 + 22 * lbm;
}

export function convertWeightToKg(weight: number, unit: "kg" | "lb") {
  return unit === "kg" ? weight : weight / 2.20462;
}

export function convertHeightToCm(height: number, unit: "cm" | "in") {
  return unit === "cm" ? height : height * 2.54;
}

export function convertFeetAndInchesToCm(feet: number, inches: number) {
  return (feet * 12 + inches) * 2.54;
}

function validFormula(formula: string): formula is BmrFormula {
  return formula === "mifflin" || formula === "harris" || formula === "katch" || formula === "cunningham";
}

function validateBmrInput(input: BmrInput) {
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0
    || !Number.isFinite(input.heightCm) || input.heightCm <= 0
    || !Number.isFinite(input.age) || input.age <= 0
    || (input.sex !== "male" && input.sex !== "female")
    || !validFormula(input.formula)) {
    throw new RangeError("BMR inputs must contain finite, positive measurements and a supported formula.");
  }

  if (input.bodyFatPct !== undefined && input.bodyFatPct !== 0
    && (!Number.isFinite(input.bodyFatPct)
      || input.bodyFatPct < CALCULATOR_INPUT_LIMITS.bodyFatPct.min
      || input.bodyFatPct > CALCULATOR_INPUT_LIMITS.bodyFatPct.max)) {
    throw new RangeError("Body fat percentage must be between 3 and 70, or omitted.");
  }
}

export function calculateBmr(input: BmrInput) {
  validateBmrInput(input);
  const { weightKg, heightCm, age, sex, formula, bodyFatPct } = input;
  const bodyFatFallback = (formula === "katch" || formula === "cunningham")
    && (bodyFatPct === undefined || bodyFatPct === 0);

  if ((formula === "katch" || formula === "cunningham") && bodyFatPct !== undefined && bodyFatPct !== 0) {
    const leanBodyMass = weightKg * (1 - bodyFatPct / 100);
    return {
      bmr: Math.round(formula === "katch" ? bmrKatch(leanBodyMass) : bmrCunningham(leanBodyMass)),
      formulaUsed: formula === "katch" ? "Katch-McArdle" : "Cunningham",
      bodyFatFallback,
    };
  }

  if (formula === "harris") {
    return { bmr: Math.round(bmrHarris(weightKg, heightCm, age, sex)), formulaUsed: "Harris-Benedict", bodyFatFallback };
  }

  return { bmr: Math.round(bmrMifflin(weightKg, heightCm, age, sex)), formulaUsed: "Mifflin-St Jeor", bodyFatFallback };
}

function invalidResult(errors: string[]): InvalidMacroResult {
  return {
    valid: false,
    errors,
    bmr: null,
    tdee: null,
    targetKcal: null,
    protein: null,
    carbs: null,
    fat: null,
    formulaUsed: null,
    proteinPerKg: null,
    actualProteinShare: null,
    actualCarbShare: null,
    actualFatShare: null,
    warnings: [],
    bodyFatFallback: false,
  };
}

function validateMacroInput(input: MacroInput, enforceMacroLimits: boolean) {
  const errors: string[] = [];
  const { ageYears, weightKg, heightCm, bodyFatPct } = CALCULATOR_INPUT_LIMITS;

  if (enforceMacroLimits) {
    if (!Number.isInteger(input.age) || input.age < ageYears.min || input.age > ageYears.max) {
      errors.push(`Age must be between ${ageYears.min} and ${ageYears.max} years.`);
    }
    if (!Number.isFinite(input.weightKg) || input.weightKg < weightKg.min || input.weightKg > weightKg.max) {
      errors.push(`Weight must be between ${weightKg.min} and ${weightKg.max} kg.`);
    }
    if (!Number.isFinite(input.heightCm) || input.heightCm < heightCm.min || input.heightCm > heightCm.max) {
      errors.push(`Height must be between ${heightCm.min} and ${heightCm.max} cm.`);
    }
  } else if (!Number.isFinite(input.age) || input.age <= 0
    || !Number.isFinite(input.weightKg) || input.weightKg <= 0
    || !Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    errors.push("Age, weight, and height must be finite positive values.");
  }
  if (input.sex !== "male" && input.sex !== "female") errors.push("Select a valid sex.");
  if (!(input.activity in ACTIVITY_MULTIPLIERS)) errors.push("Select a valid activity level.");
  if (!validFormula(input.formula)) errors.push("Select a supported BMR formula.");
  if (input.bodyFatPct !== undefined && input.bodyFatPct !== 0
    && (!Number.isFinite(input.bodyFatPct) || input.bodyFatPct < bodyFatPct.min || input.bodyFatPct > bodyFatPct.max)) {
    errors.push(`Body fat must be between ${bodyFatPct.min}% and ${bodyFatPct.max}%, or omitted.`);
  }

  const supportedGoals: readonly string[] = ["lose", "maintain", "build", "keto"];
  if (!supportedGoals.includes(input.goal)) errors.push("Select a valid calorie goal.");
  if (input.calorieGoal !== undefined
    && !(input.calorieGoal in GOAL_CALORIE_ADJUSTMENTS)) errors.push("Select a valid calorie goal.");
  if (input.split !== undefined && input.split !== "custom" && !(input.split in MACRO_SPLITS)) {
    errors.push("Select a valid macro split.");
  }
  if (input.split === "custom") {
    const custom = input.customSplit;
    if (!custom || custom.length !== 3 || custom.some((value) => !Number.isFinite(value) || value < 0)
      || custom[1] + custom[2] <= 0 || custom[0] + custom[1] + custom[2] <= 0) {
      errors.push("A custom split must contain three nonnegative percentages with some carbohydrate and fat.");
    }
  }
  if (input.split !== "custom" && input.customSplit !== undefined) {
    errors.push("Custom percentages can only be used with the custom split.");
  }
  return errors;
}

function normalizedSplit(input: MacroInput, useLegacyGoalSplit: boolean): readonly [number, number, number] {
  if (input.split === "custom" && input.customSplit) {
    const total = input.customSplit[0] + input.customSplit[1] + input.customSplit[2];
    return [input.customSplit[0] / total, input.customSplit[1] / total, input.customSplit[2] / total];
  }

  if (useLegacyGoalSplit && !input.calorieGoal && input.split === undefined) return LEGACY_MACRO_SPLITS[input.goal];

  const split = input.split ?? (!input.calorieGoal && input.goal === "keto" ? "keto" : "balanced");
  if (split === "custom") return [0, 0, 0];
  return MACRO_SPLITS[split];
}

function sharePercent(calories: number, targetKcal: number) {
  return (calories / targetKcal) * 100;
}

function calculateMacrosInternal(
  input: MacroInput,
  enforceMacroLimits: boolean,
  useLegacyGoalSplit: boolean,
): MacroCalculationResult {
  const errors = validateMacroInput(input, enforceMacroLimits);
  if (errors.length) return invalidResult(errors);

  const { activity, goal } = input;
  const { bmr, formulaUsed, bodyFatFallback } = calculateBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  const canonicalGoal = input.calorieGoal ?? (goal === "build" ? "muscleGain" : goal === "keto" ? "maintain" : goal);
  const targetKcal = Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENTS[canonicalGoal]));

  if (!Number.isFinite(tdee) || !Number.isFinite(targetKcal) || targetKcal <= 0) {
    return invalidResult(["The inputs do not produce a usable calorie target."]);
  }

  const [proteinShare, carbShare, fatShare] = normalizedSplit(input, useLegacyGoalSplit);
  const splitProteinGrams = targetKcal * proteinShare / KCAL_PER_GRAM.protein;
  const splitProteinPerKg = splitProteinGrams / input.weightKg;
  const preset = input.split !== "custom";
  const adjustedProteinGrams = preset
    ? Math.min(
      input.weightKg * PROTEIN_TARGET_G_PER_KG.max,
      Math.max(input.weightKg * PROTEIN_TARGET_G_PER_KG.min, splitProteinGrams),
    )
    : splitProteinGrams;
  const protein = Math.round(adjustedProteinGrams);
  const proteinCalories = protein * KCAL_PER_GRAM.protein;
  const remainingCalories = targetKcal - proteinCalories;
  const remainingMacroShare = carbShare + fatShare;
  const fatCalories = remainingCalories * fatShare / remainingMacroShare;
  const fat = Math.round(fatCalories / KCAL_PER_GRAM.fat);
  const carbs = Math.round((targetKcal - proteinCalories - fat * KCAL_PER_GRAM.fat) / KCAL_PER_GRAM.carbs);
  const proteinPerKg = protein / input.weightKg;
  const actualProteinShare = sharePercent(protein * KCAL_PER_GRAM.protein, targetKcal);
  const actualCarbShare = sharePercent(carbs * KCAL_PER_GRAM.carbs, targetKcal);
  const actualFatShare = sharePercent(fat * KCAL_PER_GRAM.fat, targetKcal);
  const warnings: string[] = [];

  if (preset && (splitProteinGrams < input.weightKg * PROTEIN_TARGET_G_PER_KG.min
    || splitProteinGrams > input.weightKg * PROTEIN_TARGET_G_PER_KG.max)) {
    warnings.push(
      `Preset protein was adjusted from ${splitProteinGrams.toFixed(1)} g (${splitProteinPerKg.toFixed(1)} g/kg) `
      + `to ${protein} g (${proteinPerKg.toFixed(1)} g/kg) to stay within the `
      + `${PROTEIN_TARGET_G_PER_KG.min}–${PROTEIN_TARGET_G_PER_KG.max} g/kg range.`,
    );
  }
  if (!preset && (proteinPerKg < PROTEIN_TARGET_G_PER_KG.min || proteinPerKg > PROTEIN_TARGET_G_PER_KG.max)) {
    warnings.push(
      `Custom protein provides ${proteinPerKg.toFixed(1)} g/kg, outside the `
      + `${PROTEIN_TARGET_G_PER_KG.min}–${PROTEIN_TARGET_G_PER_KG.max} g/kg range.`,
    );
  }
  if (actualFatShare < MINIMUM_FAT_CALORIE_SHARE * 100) {
    warnings.push(`Fat provides less than ${MINIMUM_FAT_CALORIE_SHARE * 100}% of the calorie target.`);
  }
  if (targetKcal < MINIMUM_CALORIE_WARNING_THRESHOLDS[input.sex]) {
    warnings.push(
      `The calorie target is below ${MINIMUM_CALORIE_WARNING_THRESHOLDS[input.sex].toLocaleString()} kcal/day for ${input.sex === "female" ? "women" : "men"}.`,
    );
  }
  if (bodyFatFallback) {
    warnings.push(`${input.formula === "katch" ? "Katch-McArdle" : "Cunningham"} requires body-fat information; this calculation fell back to Mifflin-St Jeor.`);
  }

  if (![bmr, tdee, targetKcal, protein, carbs, fat, proteinPerKg, actualProteinShare, actualCarbShare, actualFatShare].every(Number.isFinite)
    || protein < 0 || carbs < 0 || fat < 0) {
    return invalidResult(["The inputs do not produce usable calorie and macro values."]);
  }

  return {
    valid: true,
    bmr,
    tdee: Math.round(tdee),
    targetKcal,
    protein,
    carbs,
    fat,
    formulaUsed,
    proteinPerKg,
    actualProteinShare,
    actualCarbShare,
    actualFatShare,
    warnings,
    bodyFatFallback,
  };
}

export function calculateMacrosSafe(input: MacroInput): MacroCalculationResult {
  return calculateMacrosInternal(input, true, false);
}

export function calculateMacros(input: MacroInput): MacroResult {
  const result = calculateMacrosInternal(input, false, true);
  if (!result.valid) throw new RangeError(result.errors.join(" "));
  return result;
}
