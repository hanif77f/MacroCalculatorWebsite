import { ACTIVITY_MULTIPLIERS, KCAL_PER_GRAM, MACRO_SPLITS, GOAL_ADJUSTMENT_KCAL } from "@/lib/constants";

export interface MacroInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activity: keyof typeof ACTIVITY_MULTIPLIERS;
  goal: keyof typeof MACRO_SPLITS;
  formula: "mifflin" | "katch" | "cunningham" | "harris";
  bodyFatPct?: number;
}

export interface MacroResult {
  bmr: number;
  tdee: number;
  targetKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  formulaUsed: string;
}

export type BmrInput = Pick<MacroInput, "weightKg" | "heightCm" | "age" | "sex" | "formula" | "bodyFatPct">;

function bmrMifflin(w: number, h: number, age: number, sex: "male" | "female") {
  return sex === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
}
function bmrHarris(w: number, h: number, age: number, sex: "male" | "female") {
  return sex === "male"
    ? 13.397 * w + 4.799 * h - 5.677 * age + 88.362
    : 9.247 * w + 3.098 * h - 4.33 * age + 447.593;
}
function bmrKatch(lbm: number) { return 370 + 21.6 * lbm; }
function bmrCunningham(lbm: number) { return 500 + 22 * lbm; }

export function calculateBmr(input: BmrInput) {
  const { weightKg, heightCm, age, sex, formula, bodyFatPct } = input;

  if ((formula === "katch" || formula === "cunningham") && bodyFatPct) {
    const leanBodyMass = weightKg * (1 - bodyFatPct / 100);
    return {
      bmr: Math.round(formula === "katch" ? bmrKatch(leanBodyMass) : bmrCunningham(leanBodyMass)),
      formulaUsed: formula === "katch" ? "Katch-McArdle" : "Cunningham",
    };
  }

  if (formula === "harris") {
    return { bmr: Math.round(bmrHarris(weightKg, heightCm, age, sex)), formulaUsed: "Harris-Benedict" };
  }

  return { bmr: Math.round(bmrMifflin(weightKg, heightCm, age, sex)), formulaUsed: "Mifflin-St Jeor" };
}

export function calculateMacros(input: MacroInput): MacroResult {
  const { activity, goal } = input;
  const { bmr, formulaUsed } = calculateBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  const targetKcal = Math.round(tdee + GOAL_ADJUSTMENT_KCAL[goal]);
  const [pPct, cPct, fPct] = MACRO_SPLITS[goal];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetKcal,
    protein: Math.round((targetKcal * pPct) / KCAL_PER_GRAM.protein),
    carbs: Math.round((targetKcal * cPct) / KCAL_PER_GRAM.carbs),
    fat: Math.round((targetKcal * fPct) / KCAL_PER_GRAM.fat),
    formulaUsed,
  };
}
