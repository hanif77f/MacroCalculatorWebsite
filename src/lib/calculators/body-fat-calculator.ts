export type BodyFatSex = "male" | "female";
export type BodyFatUnit = "metric" | "imperial";

export interface BodyFatInput {
  sex: BodyFatSex;
  age?: number;
  weight: number;
  height: number;
  neck: number;
  waist: number;
  hip?: number;
  unit: BodyFatUnit;
}

export interface BodyFatResult {
  bodyFatPercentage: number;
  category: string;
  fatMass: number;
  leanMass: number;
  bmi: number;
  bmiBodyFatPercentage?: number;
}

function validateMeasurement(label: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive number.`);
  }
}

export function calculateBodyFat(input: BodyFatInput): BodyFatResult {
  const { sex, age, weight, height, neck, waist, hip, unit } = input;
  if (age !== undefined && (!Number.isInteger(age) || age < 18 || age > 100)) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  validateMeasurement("Weight", weight);
  validateMeasurement("Height", height);
  validateMeasurement("Neck circumference", neck);
  validateMeasurement("Waist circumference", waist);
  if (sex === "female") validateMeasurement("Hip circumference", hip ?? 0);

  const cmPerUnit = unit === "imperial" ? 2.54 : 1;
  const heightCm = height * cmPerUnit;
  const neckCm = neck * cmPerUnit;
  const waistCm = waist * cmPerUnit;
  const hipCm = (hip ?? 0) * cmPerUnit;
  const log10 = (value: number) => Math.log(value) / Math.LN10;
  const circumferenceDifference = sex === "male" ? waistCm - neckCm : waistCm + hipCm - neckCm;

  if (circumferenceDifference <= 0) {
    throw new RangeError("Check the circumference measurements; waist-based measurement must be greater than neck.");
  }

  const bodyFatPercentage = sex === "male"
    ? 495 / (1.0324 - 0.19077 * log10(circumferenceDifference) + 0.15456 * log10(heightCm)) - 450
    : 495 / (1.29579 - 0.35004 * log10(circumferenceDifference) + 0.221 * log10(heightCm)) - 450;

  if (!Number.isFinite(bodyFatPercentage) || bodyFatPercentage < 0 || bodyFatPercentage > 75) {
    throw new RangeError("These measurements produced an out-of-range estimate. Check your entries and tape placement.");
  }

  const weightKg = unit === "imperial" ? weight / 2.20462 : weight;
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const bmiBodyFatPercentage = age === undefined
    ? undefined
    : Math.max(0, Math.min(75, 1.2 * bmi + 0.23 * age - (sex === "male" ? 16.2 : 5.4)));
  const upperBounds = sex === "male" ? [5, 13, 17, 24] : [13, 20, 24, 31];
  const categories = ["Essential fat", "Athletes", "Fitness", "Average", "Above ACE category threshold"];
  const category = categories[upperBounds.findIndex((upperBound) => bodyFatPercentage <= upperBound)] ?? categories[categories.length - 1];

  return {
    bodyFatPercentage,
    category,
    fatMass: weight * bodyFatPercentage / 100,
    leanMass: weight * (1 - bodyFatPercentage / 100),
    bmi,
    bmiBodyFatPercentage,
  };
}
